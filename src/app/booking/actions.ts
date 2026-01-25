
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

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
  notes: { [key:string]: string }
): Promise<CreateOrderResponse> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      'CRITICAL: Razorpay keys are not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
    return {
      success: false,
      error:
        'Payment gateway is not configured correctly on the server. Please contact support.',
    };
  }

  try {
    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
      notes,
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


interface VerifyPaymentResponse {
  success: boolean;
  error?: string;
}

// This function now ONLY verifies the payment signature.
// All database operations are moved to a client-side transaction.
export async function verifyRazorpaySignature(
  paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
): Promise<VerifyPaymentResponse> {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        console.error('CRITICAL: RAZORPAY_KEY_SECRET is not configured for signature verification.');
        return { success: false, error: 'Payment verification service is not configured.' };
    }

    const body = paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== paymentData.razorpay_signature) {
        return { success: false, error: 'Payment verification failed: Invalid signature.' };
    }

    return { success: true };
}
