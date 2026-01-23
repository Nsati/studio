'use server';

import { Resend } from 'resend';
import type { Booking } from '@/lib/types';
import { adminDb } from '@/firebase/admin';
import type { Hotel } from '@/lib/types';
import { format } from 'date-fns';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = "Uttarakhand Getaways <onboarding@resend.dev>";

export async function sendBookingConfirmationEmail(booking: Booking) {
    if (!adminDb) {
        console.error("❌ Email Service Error: Firebase Admin SDK not initialized. Cannot send email.");
        return; // Fail gracefully
    }

    if (!resendApiKey) {
        console.warn("⚠️ Email Service Warning: RESEND_API_KEY is not set. Email not sent.");
        // Log to console instead for development
        console.log("--- DEV-ONLY: SIMULATED EMAIL ---");
        console.log(`To: ${booking.customerEmail}`);
        console.log(`Subject: Booking Confirmed for booking ID ${booking.id}`);
        console.log("---------------------------------");
        return;
    }

    const resend = new Resend(resendApiKey);

    try {
        const hotelSnap = await adminDb.collection('hotels').doc(booking.hotelId).get();
        if (!hotelSnap.exists) {
            throw new Error(`Hotel ${booking.hotelId} not found for email generation.`);
        }
        const hotel = hotelSnap.data() as Hotel;

        const checkInDate = (booking.checkIn as any).toDate ? (booking.checkIn as any).toDate() : new Date(booking.checkIn);
        const checkOutDate = (booking.checkOut as any).toDate ? (booking.checkOut as any).toDate() : new Date(booking.checkOut);

        const subject = `Booking Confirmed: Your trip to ${hotel.name}!`;
        const body = `
            <h1>Booking Confirmed! 🎉</h1>
            <p>Hi ${booking.customerName},</p>
            <p>Your booking at <strong>${hotel.name}</strong> is confirmed. Get ready for an amazing trip to ${hotel.city}!</p>
            
            <h3>Booking Details:</h3>
            <ul>
                <li><strong>Booking ID:</strong> ${booking.id}</li>
                <li><strong>Hotel:</strong> ${hotel.name}, ${hotel.city}</li>
                <li><strong>Room Type:</strong> ${booking.roomType}</li>
                <li><strong>Check-in:</strong> ${format(checkInDate, 'EEEE, dd MMMM yyyy')}</li>
                <li><strong>Check-out:</strong> ${format(checkOutDate, 'EEEE, dd MMMM yyyy')}</li>
                <li><strong>Guests:</strong> ${booking.guests}</li>
                <li><strong>Total Paid:</strong> ${booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</li>
            </ul>
            
            <p>We look forward to welcoming you.</p>
            <p>Sincerely,<br/>The Team at Uttarakhand Getaways</p>
        `;

        await resend.emails.send({
            from: fromEmail,
            to: booking.customerEmail,
            subject: subject,
            html: body,
        });
        
        console.log(`✅ Email successfully sent to ${booking.customerEmail} for booking ${booking.id}.`);

    } catch (error) {
        console.error(`❌ FAILED to send confirmation email for booking ${booking.id}:`, error);
        // Do not re-throw error. The booking is confirmed, email is secondary.
        // The error is logged for debugging.
    }
}
