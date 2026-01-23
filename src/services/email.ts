
'use server';

import { Resend } from 'resend';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
    to: string;
    customerName: string;
    hotelName: string;
    checkIn: Date;
    checkOut: Date;
    bookingId: string;
}

export async function sendBookingConfirmationEmail(params: EmailParams) {
    const { to, customerName, hotelName, checkIn, checkOut, bookingId } = params;

    const checkInDate = (checkIn as any).toDate ? (checkIn as any).toDate() : new Date(checkIn);
    const checkOutDate = (checkOut as any).toDate ? (checkOut as any).toDate() : new Date(checkOut);

    // For Resend's test environment, all emails are sent to 'delivered@resend.dev'
    // but appear in your inbox if your domain is verified. 'onboarding@resend.dev' is a safe 'from' address for testing.
    const fromAddress = 'Uttarakhand Getaways <onboarding@resend.dev>';

    try {
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject: `Booking Confirmed: Your Trip to ${hotelName}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Booking Confirmation</h2>
                    <p>Hello ${customerName},</p>
                    <p>Your booking at <strong>${hotelName}</strong> is confirmed! Get ready for an amazing experience in the heart of the Himalayas.</p>
                    <h3>Booking Details:</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Booking ID:</strong> ${bookingId}</li>
                        <li><strong>Check-in:</strong> ${format(checkInDate, 'PPPP')}</li>
                        <li><strong>Check-out:</strong> ${format(checkOutDate, 'PPPP')}</li>
                    </ul>
                    <p>We look forward to welcoming you.</p>
                    <p>Best regards,<br/>The Uttarakhand Getaways Team</p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend API Error:', error);
            throw new Error(`Failed to send email via Resend: ${error.message}`);
        }

        console.log('Confirmation email sent successfully via Resend:', data);
        return { success: true, data };
    } catch (e: any) {
        console.error('Error in sendBookingConfirmationEmail function:', e);
        // Do not re-throw the error to prevent the webhook from failing if email sending fails.
        // The booking is already confirmed, which is the most critical part.
        return { success: false, error: e.message };
    }
}
