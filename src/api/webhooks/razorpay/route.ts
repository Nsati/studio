
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
        // Return 200 OK because there's nothing to retry.
        return NextResponse.json({ status: 'ok', message: 'Missing notes, cannot process.' });
      }

      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);
      let bookingDataForEmail: Booking | null = null;

      // Use a transaction to confirm the booking and update inventory
      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) {
            console.error(`Webhook Transaction Error: Booking ${booking_id} not found.`);
            throw new Error(`Booking ${booking_id} not found in DB.`);
        }

        const booking = bookingDoc.data() as Booking;

        // Idempotency check: If already confirmed, do nothing further.
        if (booking.status === 'CONFIRMED') {
          console.log(`Webhook: Booking ${booking_id} is already confirmed. No action taken.`);
          return; // Exit transaction successfully. bookingDataForEmail will remain null.
        }
        
        if (booking.status !== 'PENDING') {
          throw new Error(`Booking ${booking_id} has invalid status '${booking.status}', expected 'PENDING'.`);
        }
        
        const roomRef = adminDb.collection('hotels').doc(booking.hotelId).collection('rooms').doc(booking.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) {
            throw new Error(`Room ${booking.roomId} for hotel ${booking.hotelId} not found.`);
        }
        
        const room = roomDoc.data() as Room;
        const currentAvailableRooms = room.availableRooms ?? 0;

        if (currentAvailableRooms <= 0) {
          // This should ideally be handled gracefully, e.g., flag for manual refund.
          // For now, we throw to indicate a critical inventory issue.
          throw new Error(`Overbooking detected for room ${booking.roomId}! No available rooms.`);
        }
        
        // Atomically update both documents
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });

        // Pass the booking data out to trigger the email for this newly confirmed booking.
        bookingDataForEmail = booking;
      });

      // --- Transaction is complete. Booking is CONFIRMED. ---
      // Now, try to send the email. This part is non-critical for the user's flow.
      // If it fails, we log it but still return a 200 OK to Razorpay.

      if (bookingDataForEmail) {
        try {
            const bookingDetails = bookingDataForEmail;
            const hotelSnap = await adminDb.collection('hotels').doc(bookingDetails.hotelId).get();
            
            if (!hotelSnap.exists) {
                // Throw an error to be caught by our local try/catch block.
                throw new Error(`Hotel ${bookingDetails.hotelId} not found for email generation.`);
            }
            
            const hotel = hotelSnap.data() as Hotel;

            console.log(`Webhook: Generating email for newly confirmed booking ${booking_id}`);

            // The dates from Firestore are Timestamps. Convert them to JS Dates, then to ISO strings.
            const checkInDate = (bookingDetails.checkIn as admin.firestore.Timestamp).toDate();
            const checkOutDate = (bookingDetails.checkOut as admin.firestore.Timestamp).toDate();

            // Use Genkit flow to generate email content
            const emailContent = await generateBookingConfirmationEmail({
                hotelName: hotel.name,
                customerName: bookingDetails.customerName,
                checkIn: checkInDate.toISOString(),
                checkOut: checkOutDate.toISOString(),
                roomType: bookingDetails.roomType,
                totalPrice: bookingDetails.totalPrice,
                bookingId: booking_id, // Use the reliable ID from notes
            });
            
            // In a real app, you would use an email service like Nodemailer, SendGrid, or Resend here.
            console.log('--- PRODUCTION-READY BOOKING CONFIRMATION EMAIL (SIMULATED) ---');
            console.log('TO:', bookingDetails.customerEmail);
            console.log('SUBJECT:', emailContent.subject);
            // console.log('BODY:', emailContent.body); // Keep console clean for clarity
            console.log('-----------------------------------------------------------------');

        } catch (emailError: any) {
            // IMPORTANT: We catch the email error but don't re-throw it.
            // This prevents the webhook from failing and retrying if only the email part has a problem.
            // The booking is already confirmed in the database.
            console.error(`[Non-critical error] Booking ${booking_id} confirmed successfully, but email generation failed:`, emailError.message);
        }
      }
    }

    // Acknowledge receipt of the webhook to prevent retries.
    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    // This catches errors from the transaction or signature verification.
    console.error('Error processing Razorpay webhook:', error.message);
    // Return 500 to indicate a critical internal error. Razorpay will retry.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
