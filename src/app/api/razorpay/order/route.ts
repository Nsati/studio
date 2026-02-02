import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Hardened Razorpay Order API
 * Following industry standards for Live Mode.
 */

export async function POST(req: Request) {
  // Use environment variables strictly
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error('CRITICAL: Razorpay Credentials missing in environment variables.');
    return NextResponse.json({ 
      error: 'Gateway Configuration Error', 
      details: 'API Keys are not configured on the server.' 
    }, { status: 500 });
  }

  try {
    const { amount, currency = 'INR' } = await req.json();

    // 1. Validation: Amount must be valid and minimum ₹1
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 1) {
      return NextResponse.json({ error: 'Invalid amount. Minimum ₹1 required.' }, { status: 400 });
    }

    // 2. Format: Amount in paise (Integer only)
    const amountInPaise = Math.floor(numericAmount * 100);

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payments
    };

    console.log(`[RAZORPAY] Attempting to create order for ${amountInPaise} paise`);
    
    const order = await instance.orders.create(options);

    console.log(`[RAZORPAY] Order Created Successfully: ${order.id}`);
    
    return NextResponse.json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    // 3. Robust Error Logging
    console.error('[RAZORPAY API ERROR]:', {
      message: error.message,
      description: error.description,
      metadata: error.metadata,
      code: error.code
    });

    return NextResponse.json({ 
      error: 'Order creation failed',
      details: error.description || error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
