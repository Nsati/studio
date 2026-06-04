
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/firebase/admin';
import { generateInvoicePDF } from '@/lib/pdf-service';
import { sendInvoiceEmail } from '@/lib/email-service';

/**
 * @fileOverview Production-Grade Razorpay Webhook.
 * Handles payment verification, Firestore status sync, and Automated SMTP Billing.
 */

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'Msdhoni@123';

  const text = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature not found' }, { status: 400 });
  }

  // 1. Verify Webhook Signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(text);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    console.error('[WEBHOOK ERROR] Invalid signature detected.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { adminDb, error: adminError } = getFirebaseAdmin();
  if (adminError || !adminDb) {
    console.error('[WEBHOOK ERROR] Firebase Admin failed:', adminError);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const event = JSON.parse(text);

    // 2. Process Successful Payment
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes;
      const bookingId = notes?.booking_id;
      const userId = notes?.user_id;

      if (!bookingId || !userId) {
        console.warn('[WEBHOOK] Missing metadata in payment notes.');
        return NextResponse.json({ status: 'ok, missing metadata' });
      }

      const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);
      const bookingSnap = await bookingRef.get();

      if (!bookingSnap.exists) {
        console.warn(`[WEBHOOK] Booking node ${bookingId} not found in Firestore.`);
        return NextResponse.json({ status: 'booking not found' });
      }

      const bookingData = bookingSnap.data();

      // 3. Update Firestore Status
      await bookingRef.update({
        status: 'CONFIRMED',
        razorpayPaymentId: paymentEntity.id,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ [WEBHOOK] Booking ${bookingId} confirmed in cloud.`);

      // 4. Generate PDF & Trigger SMTP Email
      if (bookingData?.customerEmail) {
        const amount = paymentEntity.amount / 100; // Convert paise to INR
        
        try {
            // Generate Buffer
            const pdfBuffer = await generateInvoicePDF({
                userName: bookingData.customerName || 'Himalayan Explorer',
                userEmail: bookingData.customerEmail,
                bookingId: bookingId,
                hotelName: bookingData.hotelName || 'Premium Property',
                checkIn: bookingData.checkIn || 'TBD',
                checkOut: bookingData.checkOut || 'TBD',
                amount: amount,
                date: new Date().toLocaleDateString()
            });

            // Send via NodeMailer
            await sendInvoiceEmail({
                to: bookingData.customerEmail,
                userName: bookingData.customerName || 'Explorer',
                bookingId: bookingId,
                amount: amount,
                pdfBuffer: pdfBuffer
            });
            console.log(`📧 [WEBHOOK] Invoice dispatched to ${bookingData.customerEmail}`);
        } catch (mailErr: any) {
            console.error('[WEBHOOK MAIL FAILURE]:', mailErr.message);
        }
      }
    }

    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('[WEBHOOK CRITICAL ERROR]:', error.message);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
