'use server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(payload: EmailPayload) {
    if (!resendApiKey) {
        console.error("Email service is not configured. Missing RESEND_API_KEY.");
        return { success: false, error: "Email service not configured on the server." };
    }

    const resend = new Resend(resendApiKey);

    try {
        const { data, error } = await resend.emails.send({
            // Using Resend's verified test domain to ensure email delivery during development.
            // In production, you would replace this with your own verified domain.
            from: `Uttarakhand Getaways <onboarding@resend.dev>`,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };

    } catch (error: any) {
        console.error("Failed to send email via Resend:", error);
        return { success: false, error: error.message };
    }
}
