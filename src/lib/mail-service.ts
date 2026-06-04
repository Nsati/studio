
import { Resend } from 'resend';

/**
 * @fileOverview Professional Email Service for Northern Harrier.
 * Uses Resend to send beautifully formatted HTML bills/invoices.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvoiceData {
  customerName: string;
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  paymentId: string;
}

export async function sendBookingConfirmationEmail(email: string, data: InvoiceData) {
  try {
    const { customerName, bookingId, hotelName, checkIn, checkOut, amount, paymentId } = data;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1B4D2E; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Northern Harrier</h1>
          <p style="margin-top: 10px; opacity: 0.8; font-size: 14px;">Official Booking Confirmation</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 20px; margin-bottom: 20px;">Namaste ${customerName},</h2>
          <p style="line-height: 1.6; color: #4b5563;">Your Himalayan expedition has been successfully synchronized. Below is your official bill and reservation summary.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Booking ID</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-weight: bold;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Property</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${hotelName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Check-in</td>
                <td style="padding: 10px 0; text-align: right;">${checkIn}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Check-out</td>
                <td style="padding: 10px 0; text-align: right;">${checkOut}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;"></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #1a1a1a; font-weight: 900; font-size: 16px;">Total Amount Paid</td>
                <td style="padding: 10px 0; text-align: right; color: #1B4D2E; font-weight: 900; font-size: 20px;">₹${amount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Transaction ID: ${paymentId}</p>
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="https://northern-harrier.com/my-bookings" style="background-color: #FF8C42; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase;">View Full Voucher</a>
          </div>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 11px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Northern Harrier Expeditions. Dehradun, UK, India.</p>
          <p>For support, call +91-6399902725</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Northern Harrier <onboarding@resend.dev>', // Change to your verified domain in production
      to: email,
      subject: `Booking Confirmed: ${hotelName} [${bookingId}]`,
      html: htmlContent,
    });

    console.log(`[MAIL] Confirmation sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('[MAIL ERROR]:', error);
    return { success: false, error };
  }
}
