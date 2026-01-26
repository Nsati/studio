
'use server';

import Razorpay from 'razorpay';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Booking, Hotel, Room, Promotion } from '@/lib/types';
import { differenceInDays } from 'date-fns';


/**
 * Creates a PENDING booking document in Firestore using the Admin SDK,
 * then creates a corresponding Razorpay order. This server-side approach
 * is more robust because it calculates the final price on the server,
 * preventing any client-side tampering.
 */
export async function initializeBookingAndCreateOrder(
  data: {
    userId: string;
    hotelId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    customerName: string;
    customerEmail: string;
    couponCode?: string;
  }
) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
      const errorMessage = "Payment processing is currently unavailable. (Admin Error: Razorpay keys are missing in .env).";
      console.error(`SERVER ACTION ERROR: ${errorMessage}`);
      return { success: false, error: errorMessage, order: null, keyId: null, bookingId: null };
  }

  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (!adminDb) {
      const errorMessage = adminError || "Payment processing is currently unavailable. (Admin Error: Firebase Admin SDK failed to initialize).";
      console.error(`SERVER ACTION ERROR: ${errorMessage}`);
      return { success: false, error: errorMessage, order: null, keyId: null, bookingId: null };
  }
  
  const { userId, hotelId, roomId, customerName, customerEmail, guests, couponCode } = data;

  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { success: false, error: 'Invalid date format received.', order: null, keyId: null, bookingId: null };
  }

  const bookingId = `booking_${Date.now()}_${userId.substring(0,5)}`;
  const bookingRef = adminDb.collection('users').doc(userId).collection('bookings').doc(bookingId);

  try {
    // --- SERVER-SIDE PRICE CALCULATION ---
    const hotelRef = adminDb.doc(`hotels/${hotelId}`);
    const roomRef = adminDb.doc(`hotels/${hotelId}/rooms/${roomId}`);
    
    const [hotelSnap, roomSnap] = await Promise.all([hotelRef.get(), roomRef.get()]);

    if (!hotelSnap.exists) throw new Error(`Hotel with ID ${hotelId} not found.`);
    if (!roomSnap.exists) throw new Error(`Room with ID ${roomId} not found.`);

    const hotel = hotelSnap.data() as Hotel;
    const room = roomSnap.data() as Room;

    const nights = differenceInDays(checkOutDate, checkInDate);
    if (nights <= 0) throw new Error("Check-out date must be after check-in date.");

    const hotelDiscountPercent = hotel.discount || 0;
    const originalRoomPrice = room.price;
    const discountedRoomPrice = originalRoomPrice * (1 - hotelDiscountPercent / 100);
    const basePriceAfterHotelDiscount = discountedRoomPrice * nights;
    
    let couponDiscount = 0;
    if (couponCode) {
        const couponRef = adminDb.doc(`promotions/${couponCode.toUpperCase()}`);
        const couponSnap = await couponRef.get();
        if (couponSnap.exists()) {
            const promotion = couponSnap.data() as Promotion;
            if (promotion.isActive) {
                if (promotion.discountType === 'percentage') {
                    couponDiscount = basePriceAfterHotelDiscount * (promotion.discountValue / 100);
                } else {
                    couponDiscount = promotion.discountValue;
                }
            }
        }
    }
    
    const finalPrice = Math.max(0, basePriceAfterHotelDiscount - couponDiscount);
    // --- END SERVER-SIDE PRICE CALCULATION ---

    // 1. Create the PENDING booking document on the server with authoritative price
    const pendingBookingData: Booking = {
      userId,
      hotelId,
      roomId,
      roomType: room.type,
      guests,
      totalPrice: finalPrice,
      customerName,
      customerEmail,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: 'PENDING',
      createdAt: Timestamp.now().toDate(),
    };
    await bookingRef.set(pendingBookingData);

    // 2. Create Razorpay order
    const razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountInPaise = Math.round(finalPrice * 100);
    
    if (amountInPaise < 100) {
        // Razorpay requires at least 1 INR. For this app, we'll throw an error if the final price is less than 1.
        // A real app might handle free bookings differently (e.g. skip payment entirely).
        throw new Error('Order amount must be at least ₹1.00');
    }

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: { booking_id: bookingId, user_id: userId, hotel_id: hotelId, room_id: roomId },
    };
    
    const order = await razorpayInstance.orders.create(orderOptions);
    if (!order) throw new Error('Failed to create order with Razorpay.');
    
    return { success: true, order, keyId, error: null, bookingId };

  } catch (error: any) {
    console.error('SERVER ACTION ERROR: Failed to initialize booking/order:', error);
    // Attempt to clean up the PENDING booking if order creation fails to prevent orphans
    await bookingRef.delete().catch(delErr => console.error('Failed to clean up orphaned pending booking:', delErr));
    return { success: false, error: error.message || 'An unknown server error occurred.', order: null, keyId: null, bookingId: null };
  }
}
