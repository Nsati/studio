
import nodemailer from 'nodemailer';

/**
 * @fileOverview Hardened SMTP Email Service.
 * Uses Nodemailer to deliver invoices with PDF attachments.
 */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export interface MailOptions {
    to: string;
    userName: string;
    bookingId: string;
    amount: number;
    pdfBuffer: Buffer;
}

export const sendInvoiceEmail = async (options: MailOptions) => {
    const { to, userName, bookingId, amount, pdfBuffer } = options;

    const mailOptions = {
        from: `"Northern Harrier" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `[CONFIRMED] Your Himalayan Bill: ${bookingId}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; color: #1a1a1a;">
                <div style="background-color: #1B4D2E; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">NORTHERN HARRIER</h1>
                </div>
                <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #1B4D2E;">Namaste ${userName}, 🎉</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your expedition has been successfully synchronized and confirmed in our Himalayan grid.</p>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 5px 0;"><strong>Booking ID:</strong> <span style="font-family: monospace;">${bookingId}</span></p>
                        <p style="margin: 5px 0;"><strong>Amount Verified:</strong> ₹${amount.toLocaleString('en-IN')}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> CONFIRMED (PAID)</p>
                    </div>

                    <p style="font-size: 14px; color: #6b7280;">Your official digital invoice is attached to this email as a PDF. Please keep it for your records and check-in protocols.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">Need assistance? Respond to this node or call our helpline.</p>
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
        console.log(`✅ [SMTP] Invoice sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ [SMTP ERROR]:', error);
        return false;
    }
};
