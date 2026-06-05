
import nodemailer from 'nodemailer';

/**
 * @fileOverview Hardened SMTP Email Service for Northern Harrier.
 * Delivers dynamic HTML content with PDF attachments or OTP codes using Gmail.
 */

export interface MailOptions {
    to: string;
    userName: string;
    bookingId: string;
    amount: number;
    pdfBuffer: Buffer;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'mistrikumar42@gmail.com',
        pass: process.env.EMAIL_PASS || 'Msdhoni@123'
    }
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
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #1a1a1a; border: 1px solid #eee; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #1B4D2E; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">NORTHERN HARRIER</h1>
                </div>
                <div style="padding: 40px; line-height: 1.6;">
                    <h2 style="color: #1B4D2E;">Namaste ${userName}, 🎉</h2>
                    <p style="font-size: 16px; color: #4b5563;">Your Himalayan journey is now officially synchronized. We have confirmed your reservation and processed the secure transaction.</p>
                    
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Booking ID:</strong> <span style="font-family: monospace;">${bookingId}</span></p>
                        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Net Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}</p>
                        <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">VERIFIED & CONFIRMED</span></p>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">Attached to this email is your official digital invoice (PDF). Please present this node during your check-in protocol at the property.</p>
                    
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;">
                    
                    <div style="text-align: center;">
                        <p style="font-size: 12px; color: #94a3b8;">Need assistance with your nodes? Contact our 24/7 Himalayan Liaison.</p>
                        <p style="font-size: 12px; font-weight: bold; color: #1B4D2E;">+91-6399902725</p>
                    </div>
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
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="background-color: #1B4D2E; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; letter-spacing: 4px; font-size: 20px; font-weight: 900;">NORTHERN HARRIER</h1>
                </div>
                <div style="padding: 40px; text-align: left; background-color: white;">
                    <h2 style="color: #1B4D2E; font-size: 22px;">Namaste ${name},</h2>
                    <p style="font-size: 15px; color: #64748b; line-height: 1.6;">To establish your secure Himalayan node and complete registration, please use the 6-digit verification code below:</p>
                    
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1B4D2E; font-family: monospace;">${otp}</span>
                    </div>
                    
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">This protocol code will expire in <strong>10 minutes</strong>. If you did not initiate this request, please ignore this email.</p>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
                    <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Expedition Hub • Dehradun, Uttarakhand</p>
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
