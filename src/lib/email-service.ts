
import nodemailer from 'nodemailer';

/**
 * @fileOverview Hardened SMTP Email Service.
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

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
    const mailOptions = {
        from: `"Northern Harrier Auth" <${process.env.EMAIL_USER || 'mistrikumar42@gmail.com'}>`,
        to: email,
        subject: `${otp} is your Northern Harrier Verification Code`,
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; padding: 30px;">
                <h1 style="color: #1B4D2E; text-align: center; letter-spacing: 2px;">NORTHERN HARRIER</h1>
                <p style="font-size: 16px; color: #333;">Namaste ${name},</p>
                <p style="font-size: 14px; color: #666; line-height: 1.5;">To complete your registration and establish your secure Himalayan node, please use the verification code below:</p>
                
                <div style="background-color: #f0f6ff; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #1B4D2E;">${otp}</span>
                </div>
                
                <p style="font-size: 12px; color: #999; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="font-size: 10px; color: #bbb; text-align: center;">Northern Harrier Expedition Hub • Dehradun, UK</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ [OTP SENT] Verification code dispatched to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ [SMTP OTP ERROR]:', error);
        throw error;
    }
};
