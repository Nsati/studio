
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Razorpay Order Creation API (Server-Side)
 * Generates a unique Order ID for secure payments.
 */

export async function POST(req: Request) {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_SBAuFmGWqZjkQM';
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    console.error('RAZORPAY_KEY_SECRET is missing from environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { amount, currency = 'INR' } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    // Amount must be in paise (e.g., 500 INR = 50000 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error('[RAZORPAY ORDER ERROR]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
