
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
    console.error('CRITICAL: RAZORPAY_KEY_SECRET is missing from environment variables.');
    return NextResponse.json({ 
      error: 'Gateway configuration error. Please contact admin to set RAZORPAY_KEY_SECRET.' 
    }, { status: 500 });
  }

  try {
    const { amount, currency = 'INR' } = await req.json();

    // Razorpay requires amount in paise. If user sends 1000 INR, we send 100000.
    // We ensure it's at least 1 Rupee (100 paise)
    const orderAmount = Math.round(Number(amount) * 100);

    if (!orderAmount || orderAmount < 100) {
      return NextResponse.json({ error: 'Invalid amount. Minimum amount should be ₹1.' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const options = {
      amount: orderAmount,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    console.log(`[RAZORPAY] Creating order for ${orderAmount} paise`);
    const order = await instance.orders.create(options);

    return NextResponse.json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error('[RAZORPAY ORDER ERROR]:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create Razorpay order',
      details: error.description || 'Internal Server Error'
    }, { status: 500 });
  }
}
