
'use server';

import Razorpay from 'razorpay';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { Booking, Room } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Creates a pending booking within a transaction, decrements inventory, and then creates a Razorpay order.
 * This ensures that a payment link is only generated if a room is actually available.
 */
export async function initiateBookingAndCreateOrder(
  bookingData: Omit<Booking, 'status' | 'createdAt' | 'razorpayPaymentId'>
) {
  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (adminError || !adminDb) {
    return { success: false, error: adminError, order: null, keyId: null, bookingId: null };
  }
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const errorMessage = 'Payment processing is currently unavailable.';
    return { success: false, error: errorMessage, order: null, keyId: null, bookingId: null };
  }

  const { userId, hotelId, roomId, totalPrice } = bookingData;
  const bookingId = `booking_${Date.now()}_${userId.substring(0, 5)}`;
  const roomRef = adminDb.doc(`hotels/${hotelId}/rooms/${roomId}`);
  const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

  try {
    // Step 1: Run a transaction to check inventory, decrement it, and create a PENDING booking.
    await adminDb.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists) {
        throw new Error("Room data not found.");
      }
      const roomData = roomDoc.data() as Room;
      if ((roomData.availableRooms ?? 0) <= 0) {
        throw new Error("Sorry, this room just got sold out!");
      }

      // Decrement inventory
      transaction.update(roomRef, { availableRooms: FieldValue.increment(-1) });

      // Create PENDING booking by explicitly mapping fields.
      // This is safer than spreading `bookingData` which might contain `undefined` or unexpected fields.
      const newBooking = {
        userId: bookingData.userId,
        hotelId: bookingData.hotelId,
        hotelName: bookingData.hotelName,
        hotelCity: bookingData.hotelCity,
        hotelAddress: bookingData.hotelAddress,
        roomId: bookingData.roomId,
        roomType: bookingData.roomType,
        checkIn: Timestamp.fromDate(new Date(bookingData.checkIn as any)),
        checkOut: Timestamp.fromDate(new Date(bookingData.checkOut as any)),
        guests: bookingData.guests,
        totalPrice: bookingData.totalPrice,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        status: 'PENDING',
        createdAt: FieldValue.serverTimestamp(),
        ...(bookingData.couponCode && { couponCode: bookingData.couponCode }),
      };
      
      transaction.set(bookingRef, newBooking);
    });

    // Step 2: If the transaction was successful, create the Razorpay order.
    const razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountInPaise = Math.round(totalPrice * 100);
    if (amountInPaise < 100) throw new Error('Order amount must be at least ₹1.00');

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: { booking_id: bookingId, user_id: userId },
    };

    const order = await razorpayInstance.orders.create(orderOptions);
    if (!order) throw new Error('Failed to create order with Razorpay.');

    return { success: true, order, keyId, bookingId, error: null };

  } catch (error: any) {
    console.error('SERVER ACTION ERROR: Failed to initiate booking:', error);
    // No need to revert transaction here, as it automatically rolls back on error.
    return { success: false, error: error.message, order: null, keyId: null, bookingId: null };
  }
}

/**
 * Reverts a pending booking if the user cancels payment.
 * Deletes the booking and increments inventory.
 */
export async function cancelInitiatedBooking(userId: string, bookingId: string) {
    const { adminDb, error: adminError } = getFirebaseAdmin();
    if (adminError || !adminDb) {
        return { success: false, message: adminError };
    }
    
    const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists) return; // Already processed or never existed

            const bookingData = bookingDoc.data() as Booking;
            // Only revert PENDING bookings. Don't touch confirmed ones.
            if (bookingData.status !== 'PENDING') return;

            const roomRef = adminDb.doc(`hotels/${bookingData.hotelId}/rooms/${bookingData.roomId}`);
            
            // Increment inventory
            transaction.update(roomRef, { availableRooms: FieldValue.increment(1) });
            // Delete the pending booking
            transaction.delete(bookingRef);
        });
        return { success: true, message: "Booking process cancelled." };
    } catch(error: any) {
        console.error(`Failed to revert booking ${bookingId}:`, error);
        // This is a best-effort cleanup. If it fails, a cron job would be the next-level solution.
        return { success: false, message: "Failed to clean up pending booking." };
    }
}
