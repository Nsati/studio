
'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * This webhook serves as a listener for Razorpay payment events.
 * Currently, its primary purpose is to verify the authenticity of the webhook call
 * using the signature and secret.
 *
 * The main application logic for booking confirmation is handled on the client-side
 * for a more responsive user experience and to reduce server dependency. This webhook
 * acts as a simple receiver and a potential entry point for future server-side logging
 * or secondary checks if needed.
 */
export async function POST(req: NextRequest) {
  console.log('--- Razorpay Webhook Endpoint Hit ---');

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('❌ STEP 0: RAZORPAY_WEBHOOK_SECRET is not set. Cannot verify webhook signature.');
    // Return a 200 OK to prevent Razorpay from resending, but log the server configuration error.
    return NextResponse.json({ status: 'error', message: 'Webhook secret not configured on server.' });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.warn('⚠️ Webhook ignored: Signature missing.');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const bodyText = await req.text();
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log('✅ STEP 1: Webhook signature verified successfully.');
    
    const body = JSON.parse(bodyText);
    const event = body.event;

    console.log(`ℹ️ Received and verified a "${event}" event.`);

    // The endpoint successfully received and verified the event.
    // The primary booking logic is on the client, so we just acknowledge receipt.
    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ FATAL: Webhook handler failed:', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
