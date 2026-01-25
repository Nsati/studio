
'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import type { Booking, Room, Hotel, ConfirmedBookingSummary } from '@/lib/types';
import { sendBookingConfirmationEmail } from '@/services/email';

export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  if (!adminDb) {
    const configError = 'FATAL - Firebase Admin SDK is not initialized. Webhook cannot proceed. Please check server logs for instructions on setting GOOGLE_APPLICATION_CREDENTIALS_JSON.';
    console.error('❌ STEP 0:', configError);
    return NextResponse.json({ error: configError }, { status: 500 });
  }
  const db = adminDb; 

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

      const bookingRef = db.collection('users').doc(user_id).collection('bookings').doc(booking_id);

      const confirmedBooking = await db.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        if (!bookingDoc.exists) {
            console.error(`❌ Transaction Error: Booking ${booking_id} for user ${user_id} not found.`);
            return null;
        }

        const bookingData = bookingDoc.data() as Booking;

        if (bookingData.status === 'CONFIRMED') {
          console.log(`✅ STEP 4: Idempotency check pass. Booking ${booking_id} is already confirmed.`);
          return bookingData;
        }
        
        console.log(`ℹ️ STEP 4: [Webhook] Booking ${booking_id} was PENDING. Confirming now...`);

        const roomRef = db.collection('hotels').doc(bookingData.hotelId).collection('rooms').doc(bookingData.roomId);
        const roomDoc = await transaction.get(roomRef);

        if (!roomDoc.exists) {
            console.error(`❌ Transaction Error: Room ${bookingData.roomId} for booking ${booking_id} not found.`);
            return null;
        }
        const room = roomDoc.data() as Room;

        if ((room.availableRooms ?? 0) <= 0) {
          console.error(`❌ Transaction Error: Overbooking detected for room ${bookingData.roomId}! No available rooms.`);
          // TODO: Here, we should refund the payment automatically.
          return null;
        }
        
        transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });
        transaction.update(bookingRef, {
          status: 'CONFIRMED',
          razorpayPaymentId: paymentEntity.id,
        });

        return { ...bookingData, status: 'CONFIRMED', razorpayPaymentId: paymentEntity.id } as Booking;
      });
      
      if (confirmedBooking) {
        console.log(`✅ STEP 5: Webhook transaction for ${booking_id} completed.`);

        const hotelDoc = await db.collection('hotels').doc(confirmedBooking.hotelId).get();
        if (!hotelDoc.exists) {
            console.error(`❌ FATAL: Could not find hotel ${confirmedBooking.hotelId} for booking ${booking_id}.`);
        } else {
            const hotel = hotelDoc.data() as Hotel;

            // STEP 6: Create public summary for success page
            try {
                const summaryRef = db.collection('confirmedBookings').doc(booking_id);
                const summaryData: ConfirmedBookingSummary = {
                    id: booking_id,
                    hotelId: hotel.id,
                    hotelName: hotel.name,
                    hotelCity: hotel.city,
                    hotelAddress: hotel.address,
                    customerName: confirmedBooking.customerName,
                    checkIn: confirmedBooking.checkIn,
                    checkOut: confirmedBooking.checkOut,
                    guests: confirmedBooking.guests,
                    totalPrice: confirmedBooking.totalPrice,
                    roomType: confirmedBooking.roomType,
                    userId: confirmedBooking.userId,
                };
                await summaryRef.set(summaryData);
                console.log(`✅ STEP 6: Public booking summary created for ${booking_id}.`);
            } catch (summaryError: any) {
                 console.error(`❌ STEP 6: Failed to create public summary for booking ${booking_id}:`, summaryError.message);
            }

            // STEP 7: Send confirmation email
            try {
                console.log(`📧 STEP 7: Attempting to send confirmation email to ${confirmedBooking.customerEmail}.`);
                await sendBookingConfirmationEmail({
                    to: confirmedBooking.customerEmail,
                    customerName: confirmedBooking.customerName,
                    hotelName: hotel.name,
                    checkIn: confirmedBooking.checkIn,
                    checkOut: confirmedBooking.checkOut,
                    bookingId: confirmedBooking.id || booking_id
                });
                console.log(`✅ STEP 8: Email logic finished for booking ${booking_id}.`);

            } catch (emailError: any) {
                console.error(`❌ STEP 8: Failed to send email for booking ${booking_id}:`, emailError.message);
            }
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
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
