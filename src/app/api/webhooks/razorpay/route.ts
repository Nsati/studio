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
    const configError = 'FATAL - Firebase Admin SDK is not initialized. Webhook cannot proceed.';
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
      const notes = paymentEntity.notes;
      
      const {
            user_id,
            booking_id,
            hotel_id,
            room_id,
            check_in,
            check_out,
            guests,
            total_price,
            customer_name,
            customer_email,
            room_type,
      } = notes;
      
      const requiredNotes = { user_id, booking_id, hotel_id, room_id, check_in, check_out, guests, total_price, customer_name, customer_email, room_type };

      for (const [key, value] of Object.entries(requiredNotes)) {
          if (!value) {
              console.error(`❌ Webhook Error: Missing note '${key}' in payment ${paymentEntity.id}`);
              return NextResponse.json({ status: 'ok', message: `Missing note: ${key}` });
          }
      }

      const bookingRef = db.collection('users').doc(user_id).collection('bookings').doc(booking_id);
      const roomRef = db.collection('hotels').doc(hotel_id).collection('rooms').doc(room_id);
      
      let createdBookingData: Booking;

      try {
        const bookingResult = await db.runTransaction(async (transaction) => {
            const existingBookingDoc = await transaction.get(bookingRef);
            if (existingBookingDoc.exists()) {
                console.log(`✅ Idempotency check pass. Booking ${booking_id} already exists.`);
                return existingBookingDoc.data() as Booking;
            }

            console.log(`ℹ️ STEP 4: [Webhook] Creating new booking ${booking_id}...`);

            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists()) {
                throw new Error(`Room ${room_id} for booking ${booking_id} not found.`);
            }
            const room = roomDoc.data() as Room;

            if ((room.availableRooms ?? 0) <= 0) {
                console.error(`❌ Transaction Error: Overbooking detected for room ${room_id}! No available rooms.`);
                throw new Error(`Overbooking detected for room ${room_id}`);
            }

            const newBookingData: Booking = {
                id: booking_id,
                hotelId: hotel_id,
                userId: user_id,
                roomId: room_id,
                roomType: room_type,
                checkIn: new Date(check_in),
                checkOut: new Date(check_out),
                guests: parseInt(guests),
                totalPrice: parseFloat(total_price),
                customerName: customer_name,
                customerEmail: customer_email,
                status: 'CONFIRMED',
                createdAt: new Date(),
                razorpayPaymentId: paymentEntity.id,
            };
            
            transaction.set(bookingRef, newBookingData);
            transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });

            return newBookingData;
        });

        if (bookingResult) {
            createdBookingData = bookingResult;
            console.log(`✅ STEP 5: Webhook transaction for ${booking_id} completed.`);
        } else {
            throw new Error("Transaction returned null or undefined.");
        }
      } catch (error: any) {
        console.error(`❌ STEP 5: Webhook transaction for ${booking_id} failed:`, error.message);
        return NextResponse.json({ error: 'Webhook transaction failed', details: error.message }, { status: 500 });
      }

      const hotelDoc = await db.collection('hotels').doc(createdBookingData.hotelId).get();
      if (!hotelDoc.exists) {
          console.error(`❌ FATAL: Could not find hotel ${createdBookingData.hotelId} for booking ${booking_id}.`);
      } else {
          const hotel = hotelDoc.data() as Hotel;

          try {
              const summaryRef = db.collection('confirmedBookings').doc(booking_id);
              const summaryData: ConfirmedBookingSummary = {
                  id: booking_id,
                  hotelId: hotel.id,
                  hotelName: hotel.name,
                  hotelCity: hotel.city,
                  hotelAddress: hotel.address,
                  customerName: createdBookingData.customerName,
                  checkIn: createdBookingData.checkIn,
                  checkOut: createdBookingData.checkOut,
                  guests: createdBookingData.guests,
                  totalPrice: createdBookingData.totalPrice,
                  roomType: createdBookingData.roomType,
                  userId: createdBookingData.userId,
              };
              await summaryRef.set(summaryData);
              console.log(`✅ STEP 6: Public booking summary created for ${booking_id}.`);
          } catch (summaryError: any) {
                console.error(`❌ STEP 6: Failed to create public summary for booking ${booking_id}:`, summaryError.message);
          }

          try {
              console.log(`📧 STEP 7: Attempting to send confirmation email to ${createdBookingData.customerEmail}.`);
              await sendBookingConfirmationEmail({
                  to: createdBookingData.customerEmail,
                  customerName: createdBookingData.customerName,
                  hotelName: hotel.name,
                  checkIn: createdBookingData.checkIn,
                  checkOut: createdBookingData.checkOut,
                  bookingId: createdBookingData.id || booking_id
              });
              console.log(`✅ STEP 8: Email logic finished for booking ${booking_id}.`);
          } catch (emailError: any) {
              console.error(`❌ STEP 8: Failed to send email for booking ${booking_id}:`, emailError.message);
          }
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
