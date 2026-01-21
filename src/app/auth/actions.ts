'use server';

import { Vonage } from '@vonage/server-sdk';

// This function sends a real SMS using Vonage.
// It requires VONAGE_API_KEY and VONAGE_API_SECRET to be set in .env
export async function sendOtpSmsAction(phoneNumber: string, otp: string) {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;

  // If secret is a placeholder, log to console instead of sending SMS
  if (!apiSecret || apiSecret === 'YOUR_VONAGE_API_SECRET') {
    console.log('---');
    console.log('--- VONAGE API SECRET MISSING ---');
    console.log('--- OTP will be logged to the console for development. ---');
    console.log(`--- Mobile Number: ${phoneNumber}`);
    console.log(`--- Your OTP is: ${otp}`);
    console.log('--- To send real SMS, add your Vonage API Secret to the .env file.');
    console.log('---');
    // Return success so the signup flow can continue
    return { success: true };
  }

  // If we have a real secret, proceed with sending the SMS
  if (!apiKey) {
    const errorMessage = 'Vonage API Key is not set in .env file. Cannot send SMS.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const vonage = new Vonage({
    apiKey: apiKey,
    apiSecret: apiSecret,
  });

  const from = 'Uttarakhand Getaways';
  // Assuming Indian numbers, prefix with 91. A production app might need a country code input.
  const to = `91${phoneNumber}`;
  const text = `Your verification code for Uttarakhand Getaways is: ${otp}`;

  try {
    const response = await vonage.sms.send({ to, from, text });
    if (response.messages[0].status === '0') {
      console.log(`SMS sent successfully to ${to}.`);
      return { success: true };
    } else {
      const errorMessage =
        (response.messages[0] as any).errorText || 'Unknown Vonage error';
      console.error(`Error sending SMS via Vonage: ${errorMessage}`);
      throw new Error(`Failed to send SMS: ${errorMessage}`);
    }
  } catch (err: any) {
    // This will catch errors from the Vonage SDK itself (e.g., network issues)
    console.error('Vonage SDK error:', err);
    throw new Error(
      err.message || 'An error occurred while trying to send the OTP SMS.'
    );
  }
}
