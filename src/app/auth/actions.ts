'use server';

import { Vonage } from '@vonage/server-sdk';

// This function sends a real SMS using Vonage.
// It requires VONAGE_API_KEY and VONAGE_API_SECRET to be set in .env
export async function sendOtpSmsAction(phoneNumber: string, otp: string) {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;

  if (!apiKey || !apiSecret) {
    const errorMessage =
      'Vonage API Key or Secret is not set in .env file. Cannot send SMS.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Add a check for placeholder values
  if (apiSecret === 'YOUR_VONAGE_API_SECRET' || !apiSecret) {
    const errorMessage =
      'Vonage API Secret is a placeholder. Please update it in your .env file.';
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
        response.messages[0]['error-text'] || 'Unknown Vonage error';
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
