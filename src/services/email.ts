'use server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL;

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(payload: EmailPayload) {
    if (!resendApiKey || !fromEmail) {
        console.error("Email service is not configured. Missing RESEND_API_KEY or FROM_EMAIL.");
        return { success: false, error: "Email service not configured on the server." };
    }

    const resend = new Resend(resendApiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: `Uttarakhand Getaways <${fromEmail}>`,
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
