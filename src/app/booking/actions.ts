'use server';

const Razorpay = require('razorpay');
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
  amount: number
): Promise<CreateOrderResponse> {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        console.error('Razorpay keys are not configured in environment variables.');
        return { success: false, error: 'Payment gateway is not configured on the server. Please contact support.' };
    }

  try {
    const razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
    };
    const order = await razorpayInstance.orders.create(options);

    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: keyId,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Could not create Razorpay order.';
    return { success: false, error: errorMessage };
  }
}

interface VerifyPaymentResponse {
  success: boolean;
  error?: string;
}

export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResponse> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    console.error('RAZORPAY_KEY_SECRET is not set.');
    return { success: false, error: 'Server configuration error.' };
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    return { success: true };
  } else {
    console.warn('Payment verification failed: Signatures do not match.');
    return { success: false, error: 'Payment verification failed.' };
  }
}
