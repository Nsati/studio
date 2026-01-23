
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import { adminDb } from '@/firebase/admin';
import { sendEmail } from '@/services/email';
import type { Booking, Hotel, Room } from '@/lib/types';
import * as admin from 'firebase-admin';
import { format } from 'date-fns';

// Disable Next.js body parser to access the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  console.log('--- Razorpay Webhook Hit ---');
  
  if (!secret) {
    console.error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.log('Webhook Error: Signature missing.');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const rawBody = await getRawBody(req.body!);
    const bodyJson = JSON.parse(rawBody.toString());
    console.log("STEP 1: WEBHOOK HIT with body:", JSON.stringify(bodyJson, null, 2));

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log("STEP 2: Webhook signature verified successfully.");

    const event = bodyJson.event;
    const payload = bodyJson.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const notes = paymentEntity.notes;
      const { user_id, booking_id } = notes;

      if (!user_id || !booking_id) {
        console.error(`Webhook Error: Missing user_id or booking_id in payment notes for payment ${paymentEntity.id}`);
        return NextResponse.json({ status: 'ok', message: 'Missing notes, cannot process.' });
      }

      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);

      let confirmedBookingData: Booking | null = null;

      // Use a transaction to confirm the booking and update inventory
      await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) {
          throw new Error(`Booking ${booking_id} not found in DB.`);
        }

        const booking = bookingDoc.data() as Booking;

        // Idempotency: If already confirmed, do nothing further.
        if (booking.status === 'CONFIRMED') {
          console.log(`Webhook Info: Booking ${booking_id} is already confirmed. Skipping transaction.`);
          confirmedBookingData = booking; // Set data for email sending
          return;
        }
        
        console.log(`STEP 3: Booking status before update is: ${booking.status}`);

        const roomRef = adminDb.collection('hotels').doc(booking.hotelId).collection('rooms').doc(booking.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) throw new Error(`Room ${booking.roomId} not found.`);
        const room = roomDoc.data() as Room;

        if ((room.availableRooms ?? 0) <= 0) {
          throw new Error(`Overbooking detected for room ${booking.roomId}! No available rooms.`);
        }

        // Atomically update both documents
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });

        // Prepare data for email sending
        confirmedBookingData = {
          ...booking,
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        };
      });

      console.log(`STEP 3: Booking status for ${booking_id} is now CONFIRMED in DB.`);

      if (!confirmedBookingData) {
         throw new Error("Transaction finished but booking data for email is not available.");
      }

      // --- Transaction successful, now send email (DECOUPLED AND ROBUST) ---
      try {
        const hotelSnap = await adminDb.collection('hotels').doc(confirmedBookingData.hotelId).get();
        if (!hotelSnap.exists) throw new Error(`Hotel ${confirmedBookingData.hotelId} not found for email generation`);
        
        const hotel = hotelSnap.data() as Hotel;

        console.log(`STEP 4: Attempting to send email for booking ${booking_id}`);
        
        // **RELIABLE, HARD-CODED EMAIL TEMPLATE**
        const subject = `Your Himalayan Adventure Awaits! Booking Confirmed for ${hotel.name}`;
        const checkInDate = (confirmedBookingData.checkIn as admin.firestore.Timestamp).toDate();
        const checkOutDate = (confirmedBookingData.checkOut as admin.firestore.Timestamp).toDate();

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Booking Confirmed! 🎉</h2>
                <p>Dear ${confirmedBookingData.customerName},</p>
                <p>Thank you for booking with Uttarakhand Getaways. Your payment has been successful and your booking is confirmed.</p>
                <h3>Booking Summary</h3>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Hotel:</strong> ${hotel.name}</li>
                    <li><strong>Room:</strong> ${confirmedBookingData.roomType}</li>
                    <li><strong>Check-in:</strong> ${format(checkInDate, 'PPP')}</li>
                    <li><strong>Check-out:</strong> ${format(checkOutDate, 'PPP')}</li>
                    <li><strong>Total Paid:</strong> ₹${confirmedBookingData.totalPrice.toLocaleString('en-IN')}</li>
                    <li><strong>Booking ID:</strong> ${confirmedBookingData.id}</li>
                </ul>
                <p>We look forward to welcoming you to the serene beauty of Uttarakhand.</p>
                <p>Sincerely,<br>The Team at ${hotel.name}</p>
            </div>
        `;
        
        console.log("STEP 5: Attempting to send email to:", confirmedBookingData.customerEmail);
        
        const emailResult = await sendEmail({
            to: confirmedBookingData.customerEmail,
            subject: subject,
            html: htmlBody,
        });

        if (emailResult.success) {
            console.log(`STEP 5: Email sent successfully! Message ID: ${emailResult.data?.id}`);
        } else {
            console.error(`STEP 5: Failed to send email. Error: ${emailResult.error}`);
            // Do not throw an error here, the booking is already confirmed.
        }

      } catch (emailError: any) {
          console.error(`Webhook Warning: Booking ${booking_id} confirmed, but failed to send email. Error: ${emailError.message}`);
          // We don't re-throw the error because the critical part (booking confirmation) is done.
      }
    }

    console.log('--- Webhook Processed Successfully ---');
    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('FATAL: Error processing Razorpay webhook:', error.message);
    // Return 500 to indicate an internal error. Razorpay will retry.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
