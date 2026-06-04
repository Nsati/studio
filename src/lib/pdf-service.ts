
import PDFDocument from 'pdfkit';

/**
 * @fileOverview Production PDF Generation Engine.
 * Creates professional Himalayan-themed invoices for Northern Harrier travelers.
 */

export interface InvoiceData {
  userName: string;
  userEmail: string;
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  date: string;
}

export const generateInvoicePDF = (details: InvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: any[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- BRAND HEADER ---
      doc.rect(0, 0, doc.page.width, 160).fill('#1B4D2E');
      doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold').text('NORTHERN HARRIER', 50, 50);
      doc.fontSize(10).font('Helvetica').text('Sacred Landscapes. Modern Protocols.', 50, 85);
      doc.text('Official Cloud-Synced Digital Invoice', 50, 100);
      
      doc.fillColor('#FFFFFF').fontSize(14).text('INVOICE / BILL', 400, 55, { align: 'right' });
      doc.fontSize(9).text(`ID: ${details.bookingId}`, 400, 85, { align: 'right' });
      doc.text(`Issue Date: ${details.date}`, 400, 100, { align: 'right' });

      // --- SECTION: DETAILS ---
      doc.fillColor('#1a1a1a').moveDown(8);

      // Traveler Info
      doc.fontSize(12).font('Helvetica-Bold').text('TRAVELER PROFILE', 50, 200);
      doc.fontSize(10).font('Helvetica').text(details.userName, 50, 220);
      doc.text(details.userEmail, 50, 235);

      // Property Info
      doc.fontSize(12).font('Helvetica-Bold').text('PROPERTY NODE', 300, 200);
      doc.fontSize(10).font('Helvetica').text(details.hotelName, 300, 220);
      doc.text(`Check-in: ${details.checkIn}`, 300, 235);
      doc.text(`Check-out: ${details.checkOut}`, 300, 250);

      doc.moveDown(4);

      // --- SECTION: TABLE ---
      const tableTop = 320;
      doc.rect(50, tableTop, 500, 25).fill('#F8FAF9');
      doc.fillColor('#1B4D2E').fontSize(10).font('Helvetica-Bold').text('DESCRIPTION', 65, tableTop + 8);
      doc.text('AMOUNT (INR)', 450, tableTop + 8, { align: 'right' });

      doc.fillColor('#4b5563').fontSize(10).font('Helvetica').text('Himalayan Stay Experience & Service Sync', 65, tableTop + 45);
      doc.fillColor('#1a1a1a').text(`₹${details.amount.toLocaleString('en-IN')}`, 450, tableTop + 45, { align: 'right' });

      doc.moveTo(50, tableTop + 80).lineTo(550, tableTop + 80).stroke('#E5E7EB');

      // --- SECTION: TOTAL ---
      doc.moveDown(3);
      doc.fontSize(14).font('Helvetica-Bold').text('TOTAL PAID:', 350, doc.y);
      doc.fillColor('#1B4D2E').text(`₹${details.amount.toLocaleString('en-IN')}`, 450, doc.y - 14, { align: 'right' });

      // --- SECTION: AUTHENTICATION ---
      doc.fillColor('#16a34a').fontSize(9).font('Helvetica-Bold').text('PAYMENT VERIFIED VIA RAZORPAY GATEWAY', 50, 500, { align: 'center' });

      // --- FOOTER ---
      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('This is a computer-generated document synchronized via Northern Harrier Cloud Intelligence.', 50, 750, { align: 'center' });
      doc.text('© Northern Harrier Expeditions. Dehradun, Uttarakhand, India.', 50, 765, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
