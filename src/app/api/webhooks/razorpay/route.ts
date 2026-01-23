import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import { adminDb } from '@/firebase/admin';
import { generateBookingConfirmationEmail } from '@/ai/flows/generate-booking-confirmation-email';
import type { Booking, Hotel, Room } from '@/lib/types';
import * as admin from 'firebase-admin';

// Disable Next.js body parser to access the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const rawBody = await getRawBody(req.body!);
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature is valid, now process the event
    const body = JSON.parse(rawBody.toString());
    const event = body.event;
    const payload = body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const notes = paymentEntity.notes;
      const { user_id, booking_id } = notes;

      if (!user_id || !booking_id) {
        console.error(`Webhook Error: Missing user_id or booking_id in payment notes for payment ${paymentEntity.id}`);
        return NextResponse.json({ status: 'ok', message: 'Missing notes' });
      }

      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);

      // Use a transaction to confirm the booking and update inventory
      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) throw new Error(`Booking ${booking_id} not found in DB.`);

        const booking = bookingDoc.data() as Booking;

        // Idempotency: If already confirmed, do nothing further.
        if (booking.status === 'CONFIRMED') {
          console.log(`Webhook: Booking ${booking_id} is already confirmed.`);
          return; // Exit transaction successfully
        }
        if (booking.status !== 'PENDING') {
          throw new Error(`Booking ${booking_id} status is ${booking.status}, not PENDING.`);
        }

        const roomRef = adminDb.collection('hotels').doc(booking.hotelId).collection('rooms').doc(booking.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) throw new Error(`Room ${booking.roomId} not found.`);
        const room = roomDoc.data() as Room;

        if ((room.availableRooms ?? 0) <= 0) {
          // In a real system, flag for manual intervention (e.g., refund and notify user).
          throw new Error(`Overbooking detected for room ${booking.roomId}! No available rooms.`);
        }

        // Atomically update both documents
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });
      });

      // --- Transaction successful, now send email ---
      const updatedBookingSnap = await bookingRef.get();
      const confirmedBooking = updatedBookingSnap.data() as Booking;
      const hotelSnap = await adminDb.collection('hotels').doc(confirmedBooking.hotelId).get();
      
      if (!hotelSnap.exists) throw new Error(`Hotel ${confirmedBooking.hotelId} not found for email generation`);
      
      const hotel = hotelSnap.data() as Hotel;

      console.log(`Webhook: Generating email for confirmed booking ${booking_id}`);

      // Use Genkit flow to generate email content
      const emailContent = await generateBookingConfirmationEmail({
          hotelName: hotel.name,
          customerName: confirmedBooking.customerName,
          checkIn: new Date(confirmedBooking.checkIn).toISOString(),
          checkOut: new Date(confirmedBooking.checkOut).toISOString(),
          roomType: confirmedBooking.roomType,
          totalPrice: confirmedBooking.totalPrice,
          bookingId: confirmedBooking.id!,
      });
      
      // In a real app, you would use an email service like Nodemailer, SendGrid, or Resend here.
      console.log('--- PRODUCTION-READY BOOKING CONFIRMATION EMAIL (FROM WEBHOOK) ---');
      console.log('TO:', confirmedBooking.customerEmail);
      console.log('SUBJECT:', emailContent.subject);
      // console.log('BODY:', emailContent.body); // Keep console clean
      console.log('-----------------------------------------------------------------');
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error.message);
    // Return 500 to indicate an internal error. Razorpay will retry.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
