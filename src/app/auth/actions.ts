'use server';

// This function sends a real SMS using Authkey.io.
// It requires AUTHKEY_API_KEY and AUTHKEY_SENDER_ID to be set in .env
export async function sendOtpSmsAction(phoneNumber: string, otp: string) {
  const authkey = process.env.AUTHKEY_API_KEY;
  const senderId = process.env.AUTHKEY_SENDER_ID;

  // If key or sender is a placeholder/missing, log to console instead of sending SMS
  if (!authkey || authkey === 'YOUR_AUTHKEY_API_KEY' || !senderId) {
    console.log('---');
    console.log('--- AUTHKEY.IO CONFIGURATION MISSING ---');
    console.log('--- OTP will be logged to the console for development. ---');
    console.log(`--- Mobile Number: ${phoneNumber}`);
    console.log(`--- Your OTP is: ${otp}`);
    console.log('--- To send real SMS, add your Authkey API Key and Sender ID to the .env file.');
    console.log('---');
    // Return success so the signup flow can continue
    return { success: true };
  }

  const message = `Your verification code for Uttarakhand Getaways is: ${otp}`;
  const mobile = phoneNumber;
  const countryCode = '91'; // Assuming Indian numbers

  const url = new URL('https://console.authkey.io/request');
  url.searchParams.append('authkey', authkey);
  url.searchParams.append('mobile', mobile);
  url.searchParams.append('country_code', countryCode);
  url.searchParams.append('sms', message);
  url.searchParams.append('sender', senderId);

  try {
    const response = await fetch(url.toString(), { method: 'GET' });
    
    // Authkey can return non-json for certain errors
    const responseText = await response.text();
    let body;
    try {
        body = JSON.parse(responseText);
    } catch(e) {
        // If parsing fails, use the raw text as the error message
        throw new Error(responseText);
    }


    if (response.ok && body.status === 'success') {
      console.log(`SMS sent successfully to ${mobile}.`);
      console.log('Authkey Response:', body);
      return { success: true };
    } else {
      const errorMessage = body.message || 'Unknown Authkey.io error';
      console.error(`Error sending SMS via Authkey.io: ${errorMessage}`);
      throw new Error(`Failed to send SMS: ${errorMessage}`);
    }
  } catch (err: any) {
    console.error('Authkey.io request error:', err);
    throw new Error(
      err.message || 'An error occurred while trying to send the OTP SMS.'
    );
  }
}
