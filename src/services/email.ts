'use server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL;

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(payload: EmailPayload) {
    if (!process.env.RESEND_API_KEY || !fromEmail) {
        console.error("Email service is not configured. Missing RESEND_API_KEY or FROM_EMAIL.");
        // In production, you might want to throw an error or handle this differently
        return { success: false, error: "Email service not configured." };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `Uttarakhand Getaways <${fromEmail}>`,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error: error.message };
        }

        console.log("Email sent successfully:", data);
        return { success: true, data };

    } catch (error: any) {
        console.error("Failed to send email:", error);
        return { success: false, error: error.message };
    }
}
