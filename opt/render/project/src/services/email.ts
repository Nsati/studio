
'use server';

import { Resend } from 'resend';
import { format } from 'date-fns';
import type { Booking, Hotel } from '@/lib/types';

// Initialize Resend with the API key from environment variables.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailParams {
    to: string;
    customerName: string;
    hotelName: string;
    checkIn: Date;
    checkOut: Date;
    bookingId: string;
}

export async function sendBookingConfirmationEmail(params: EmailParams) {
    if (!resend) {
        console.warn('⚠️ Resend API key not configured. Skipping email sending.');
        return { success: false, error: 'Email service is not configured.' };
    }

    const { to, customerName, hotelName, checkIn, checkOut, bookingId } = params;

    // Ensure dates are JavaScript Date objects
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
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #388E3C;">Booking Confirmation</h2>
                        <p>Hello ${customerName},</p>
                        <p>Your booking at <strong>${hotelName}</strong> is confirmed! Get ready for an amazing experience in the heart of the Himalayas.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <h3 style="margin-top: 0; color: #388E3C;">Booking Details:</h3>
                            <ul style="list-style-type: none; padding: 0;">
                                <li style="margin-bottom: 10px;"><strong>Booking ID:</strong> ${bookingId}</li>
                                <li style="margin-bottom: 10px;"><strong>Check-in:</strong> ${format(checkInDate, 'EEEE, dd MMMM yyyy')}</li>
                                <li style="margin-bottom: 10px;"><strong>Check-out:</strong> ${format(checkOutDate, 'EEEE, dd MMMM yyyy')}</li>
                            </ul>
                        </div>
                        <p style="margin-top: 20px;">We look forward to welcoming you.</p>
                        <p>Best regards,<br/>The Uttarakhand Getaways Team</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            throw new Error(`Failed to send email via Resend: ${error.message}`);
        }

        console.log('✅ Confirmation email sent successfully via Resend:', data);
        return { success: true, data };
    } catch (e: any) {
        console.error('❌ Error in sendBookingConfirmationEmail function:', e);
        // Do not re-throw the error to prevent the webhook from failing if email sending fails.
        // The booking is already confirmed, which is the most critical part.
        return { success: false, error: e.message };
    }
}
