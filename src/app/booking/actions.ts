
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getAdminDb } from '@/firebase/admin';
import * as admin from 'firebase-admin';
import type { Booking, Room, Hotel, ConfirmedBookingSummary } from '@/lib/types';
import { sendBookingConfirmationEmail } from '@/services/email';

export async function checkBackendStatus() {
  const db = getAdminDb();
  return { isConfigured: !!db };
}

interface CreateOrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  keyId?: string;
  error?: string;
}

export async function createRazorpayOrder(
  amount: number,
  notes: { [key: string]: string }
): Promise<CreateOrderResponse> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      'CRITICAL: Razorpay keys are not configured in environment variables.'
    );
    return {
      success: false,
      error:
        'Payment gateway is not configured on the server. Please contact support.',
    };
  }

  try {
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit, ensuring integer
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
      notes, // Pass notes for webhook context
    };
    const order = await razorpayInstance.orders.create(options);

    return {
      success: true,
      order: {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      },
      keyId: keyId,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Could not create Razorpay order.';
    return { success: false, error: errorMessage };
  }
}

// The bookingDetails received from the client will have dates as ISO strings.
interface VerifyPaymentParams {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingDetails: Omit<Booking, 'status' | 'createdAt' | 'razorpayPaymentId' | 'checkIn' | 'checkOut'> & { id: string, checkIn: string, checkOut: string };
}

export async function verifyPaymentAndConfirmBooking(params: VerifyPaymentParams): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = params;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        console.error('CRITICAL: RAZORPAY_KEY_SECRET is not configured.');
        return { success: false, error: 'Payment gateway is not configured on the server.' };
    }

    const db = getAdminDb();
    if (!db) {
        console.error("CRITICAL: Firebase Admin SDK is not initialized.");
        return { success: false, error: "Database service is not available." };
    }
    
    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
        console.error("Payment verification failed: Invalid signature.");
        return { success: false, error: "Payment verification failed. Please contact support." };
    }

    // 2. Signature is valid, now confirm the booking in the database
    const bookingRef = db.collection('users').doc(bookingDetails.userId).collection('bookings').doc(bookingDetails.id);
    const roomRef = db.collection('hotels').doc(bookingDetails.hotelId).collection('rooms').doc(bookingDetails.roomId);

    try {
        const bookingResult = await db.runTransaction(async (transaction) => {
            const existingBookingDoc = await transaction.get(bookingRef);
            if (existingBookingDoc.exists()) {
                console.log(`Idempotency check passed. Booking ${bookingDetails.id} already exists.`);
                return existingBookingDoc.data() as Booking;
            }

            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists()) {
                throw new Error(`Room ${bookingDetails.roomId} not found.`);
            }
            const room = roomDoc.data() as Room;

            if ((room.availableRooms ?? 0) <= 0) {
                throw new Error(`Overbooking detected for room ${bookingDetails.roomId}. No rooms available.`);
            }

            const newBookingData: Booking = {
                ...bookingDetails,
                checkIn: new Date(bookingDetails.checkIn),
                checkOut: new Date(bookingDetails.checkOut),
                status: 'CONFIRMED',
                createdAt: new Date(),
                razorpayPaymentId: razorpay_payment_id,
            };
            
            transaction.set(bookingRef, newBookingData);
            transaction.update(roomRef, { availableRooms: admin.firestore.FieldValue.increment(-1) });

            return newBookingData;
        });

        if (!bookingResult) {
            throw new Error("Transaction failed to return booking data.");
        }

        // 3. Create public summary for success page
        const hotelDoc = await db.collection('hotels').doc(bookingResult.hotelId).get();
        if (!hotelDoc.exists()) {
            // This is a critical failure. The hotel data is needed for the summary.
            // If we proceed, the success page will 404. We must fail the entire operation.
            console.error(`CRITICAL: Hotel document ${bookingResult.hotelId} not found after booking ${bookingResult.id} was confirmed. Cannot create success summary.`);
            // In a real production app, we would also trigger a refund for the payment here.
            throw new Error(`Could not retrieve hotel details to finalize your booking confirmation. Please contact support with your payment ID: ${razorpay_payment_id}`);
        }
        
        const hotel = hotelDoc.data() as Hotel;
        const summaryRef = db.collection('confirmedBookings').doc(bookingResult.id!);
        const summaryData: ConfirmedBookingSummary = {
            id: bookingResult.id!,
            hotelId: hotel.id,
            hotelName: hotel.name,
            hotelCity: hotel.city,
            hotelAddress: hotel.address,
            customerName: bookingResult.customerName,
            checkIn: bookingResult.checkIn,
            checkOut: bookingResult.checkOut,
            guests: bookingResult.guests,
            totalPrice: bookingResult.totalPrice,
            roomType: bookingResult.roomType,
            userId: bookingResult.userId,
        };
        await summaryRef.set(summaryData);

         // 4. Send confirmation email (do this after DB writes)
        await sendBookingConfirmationEmail({
            to: bookingResult.customerEmail,
            customerName: bookingResult.customerName,
            hotelName: hotel.name,
            checkIn: bookingResult.checkIn,
            checkOut: bookingResult.checkOut,
            bookingId: bookingResult.id!
        });

        return { success: true, bookingId: bookingResult.id! };

    } catch (error: any) {
        console.error('Error during booking confirmation transaction:', error);
        // In a real app, you might want to try and issue a refund here if the DB operations fail.
        return { success: false, error: error.message || "Failed to save your booking after payment. Please contact support." };
    }
}
