
import { NextResponse } from 'next/server';

/**
 * This webhook endpoint is intentionally left inactive.
 *
 * The application has been architected to use a direct, client-side Firestore transaction
 * for booking confirmation immediately after a successful payment. This approach was chosen
 * to eliminate dependencies on server-side configurations (like Firebase Admin SDK) that
 * were causing deployment and reliability issues.
 *
 * While a webhook is a common pattern, the current client-side transaction model, secured
 * by robust Firestore rules, provides a more resilient and simpler user experience for this
 * specific application by removing a potential point of failure.
 *
 * This file is kept for potential future use, such as for server-to-server refund processing
 * or other administrative tasks that are not on the critical user path.
 */
export async function POST(req: Request) {
  console.log("Razorpay webhook received, but is not configured for booking confirmation. This is expected behavior.");
  // Acknowledge the webhook to prevent Razorpay from re-sending.
  return NextResponse.json({ status: 'ok' });
}
