
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import type { Booking, Room, Hotel } from '@/lib/types';
import { sendBookingConfirmationEmail } from '@/services/email';

export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  if (!adminDb) {
    const configError = 'FATAL - Firebase Admin SDK is not initialized. Webhook cannot proceed. Please check server logs for instructions on setting GOOGLE_APPLICATION_CREDENTIALS_JSON.';
    console.error('❌ STEP 0:', configError);
    // Return 500 so Razorpay might retry later if the admin config is fixed.
    return NextResponse.json({ error: configError }, { status: 500 });
  }
  
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('❌ STEP 0: FATAL - RAZORPAY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.warn('⚠️ Webhook ignored: Signature missing.');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const bodyText = await req.text();
    console.log('✅ STEP 1: Webhook received with body.');
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    console.log('✅ STEP 2: Webhook signature verified successfully.');

    const body = JSON.parse(bodyText);
    const event = body.event;
    const payload = body.payload;

    if (event === 'payment.captured') {
      console.log('✅ STEP 3: "payment.captured" event received.');
      const paymentEntity = payload.payment.entity;
      const { user_id, booking_id } = paymentEntity.notes;

      if (!user_id || !booking_id) {
        console.error(`❌ Webhook Error: Missing user_id or booking_id in payment notes for payment ${paymentEntity.id}`);
        return NextResponse.json({ status: 'ok', message: 'Missing notes, but acknowledged.' });
      }

      const bookingRef = adminDb.collection('users').doc(user_id).collection('bookings').doc(booking_id);

      // This transaction acts as a fallback/redundancy.
      // It confirms the booking if the client-side flow failed.
      const confirmedBooking = await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) {
            console.error(`❌ Transaction Error: Booking ${booking_id} not found.`);
            return null; // Return null to indicate failure within transaction.
        }

        const bookingData = bookingDoc.data() as Booking;

        // Idempotency check: If already confirmed (likely by client-flow), do nothing but return data for email.
        if (bookingData.status === 'CONFIRMED') {
          console.log(`✅ STEP 4: Idempotency check pass. Booking ${booking_id} is already confirmed.`);
          return bookingData; // Return existing data to send email
        }
        
        console.log(`ℹ️ STEP 4: [Webhook Fallback] Booking ${booking_id} was PENDING. Confirming now...`);

        const roomRef = adminDb.collection('hotels').doc(bookingData.hotelId).collection('rooms').doc(bookingData.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) {
            console.error(`❌ Transaction Error: Room ${bookingData.roomId} for booking ${booking_id} not found.`);
            return null;
        }
        const room = roomDoc.data() as Room;

        if ((room.availableRooms ?? 0) <= 0) {
          console.error(`❌ Transaction Error: Overbooking detected for room ${bookingData.roomId}! No available rooms.`);
          return null;
        }
        
        // Atomically update both documents
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });

        // Return the updated booking data
        return { ...bookingData, status: 'CONFIRMED', razorpayPaymentId: paymentEntity.id } as Booking;
      });
      
      if (confirmedBooking) {
        console.log(`✅ STEP 5: Webhook transaction for ${booking_id} completed.`);

        // STEP 6: Send confirmation email
        try {
            const hotelDoc = await adminDb.collection('hotels').doc(confirmedBooking.hotelId).get();
            if (!hotelDoc.exists) throw new Error(`Hotel ${confirmedBooking.hotelId} not found.`);
            
            const hotelName = (hotelDoc.data() as Hotel).name;
            console.log(`📧 STEP 6: Attempting to send confirmation email to ${confirmedBooking.customerEmail}.`);

            await sendBookingConfirmationEmail({
                to: confirmedBooking.customerEmail,
                customerName: confirmedBooking.customerName,
                hotelName: hotelName,
                checkIn: confirmedBooking.checkIn,
                checkOut: confirmedBooking.checkOut,
                bookingId: confirmedBooking.id || booking_id
            });
            console.log(`✅ STEP 7: Email logic finished for booking ${booking_id}.`);

        } catch (emailError: any) {
            // Log email error but don't fail the webhook response
            console.error(`❌ STEP 7: Failed to send email for booking ${booking_id}:`, emailError.message);
        }

      } else {
        console.error(`❌ STEP 5: Webhook transaction for ${booking_id} failed or returned null.`);
      }

    } else {
        console.log(`ℹ️ Webhook received non-payment event: "${event}". Ignoring.`);
    }

    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ FATAL: Webhook handler failed:', error.message);
    // Return 500 to indicate an internal error. Razorpay will retry.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
