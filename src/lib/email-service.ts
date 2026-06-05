import nodemailer from 'nodemailer';

/**
 * @fileOverview Hardened SMTP Email Service for Northern Harrier.
 * Features: Optimized Transporter with strict Gmail protocols.
 */

export interface MailOptions {
    to: string;
    userName: string;
    bookingId: string;
    amount: number;
    pdfBuffer: Buffer;
}

// Global transporter for reuse
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.EMAIL_USER || 'mistrikumar42@gmail.com',
        pass: process.env.EMAIL_PASS || 'Msdhoni@123'
    },
    timeout: 10000 // 10s timeout
});

/**
 * Sends a booking invoice with a PDF attachment.
 */
export const sendInvoiceEmail = async (options: MailOptions) => {
    const { to, userName, bookingId, amount, pdfBuffer } = options;

    const mailOptions = {
        from: `"Northern Harrier" <${process.env.EMAIL_USER || 'mistrikumar42@gmail.com'}>`,
        to: to,
        subject: `[CONFIRMED] Your Booking Invoice: ${bookingId}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #1B4D2E; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; letter-spacing: 4px; text-transform: uppercase;">NORTHERN HARRIER</h1>
                </div>
                <div style="padding: 40px;">
                    <h2 style="color: #1B4D2E;">Namaste ${userName}, 🎉</h2>
                    <p>Your booking <strong>${bookingId}</strong> is confirmed. Net Amount: ₹${amount.toLocaleString('en-IN')}.</p>
                    <p>Please find the attached PDF invoice for your expedition.</p>
                </div>
            </div>
        `,
        attachments: [
            {
                filename: `Invoice_${bookingId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ [SMTP SUCCESS] Invoice sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ [SMTP ERROR]:', error);
        throw error;
    }
};

/**
 * Sends a 6-digit OTP code for user registration.
 */
export const sendOTPEmail = async (email: string, otp: string, name: string) => {
    const mailOptions = {
        from: `"Northern Harrier Auth" <${process.env.EMAIL_USER || 'mistrikumar42@gmail.com'}>`,
        to: email,
        subject: `${otp} is your Northern Harrier Verification Code`,
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
                <div style="background-color: #1B4D2E; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; letter-spacing: 4px; font-size: 20px;">NORTHERN HARRIER</h1>
                </div>
                <div style="padding: 40px; text-align: left; background-color: white;">
                    <h2 style="color: #1B4D2E; font-size: 22px;">Namaste ${name},</h2>
                    <p style="color: #64748b;">Use the 6-digit verification code below to establish your secure node:</p>
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1B4D2E;">${otp}</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code will expire in 10 minutes.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ [OTP SENT] Code dispatched to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ [SMTP OTP ERROR]:', error);
        throw error;
    }
};
