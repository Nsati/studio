
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import getRawBody from 'raw-body';

// Disable Next.js body parser to access the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  console.log('--- Razorpay Webhook Hit (No-Op) ---');
  
  if (!secret) {
    console.error('Webhook secret not configured, but this endpoint is a no-op.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    console.log('Webhook Info: Signature missing.');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  try {
    const rawBody = await getRawBody(req.body!);
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook Error: Invalid signature.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // The webhook's job is done. The client-side flow is now responsible for
    // finalizing the booking to provide immediate user feedback.
    // This webhook can serve as a fallback or for reconciliation in the future,
    // but for now, it does nothing.
    console.log("Webhook received and verified, but taking no action as per current design.");

    return NextResponse.json({ status: 'received_and_ignored' });

  } catch (error: any) {
    console.error('Error processing Razorpay webhook (No-Op):', error.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
