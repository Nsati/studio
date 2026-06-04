
import PDFDocument from 'pdfkit';

/**
 * @fileOverview Production-grade PDF Invoice Generator.
 * Creates a beautiful bill for Northern Harrier travelers.
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

      // --- HEADER ---
      doc.rect(0, 0, doc.page.width, 150).fill('#1B4D2E');
      doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('NORTHERN HARRIER', 50, 40);
      doc.fontSize(10).font('Helvetica').text('Official Booking Invoice', 50, 70);
      doc.fontSize(10).text('Himalayan Intelligence Sync: VERIFIED', 50, 85);
      
      doc.fillColor('#FFFFFF').fontSize(16).text('INVOICE', 400, 40, { align: 'right' });
      doc.fontSize(10).text(`ID: ${details.bookingId}`, 400, 65, { align: 'right' });
      doc.text(`Date: ${details.date}`, 400, 80, { align: 'right' });

      // --- BODY ---
      doc.fillColor('#1a1a1a').moveDown(6);

      // Customer Column
      doc.fontSize(12).font('Helvetica-Bold').text('TRAVELER DETAILS', 50, 180);
      doc.fontSize(10).font('Helvetica').text(details.userName, 50, 200);
      doc.text(details.userEmail, 50, 215);

      // Property Column
      doc.fontSize(12).font('Helvetica-Bold').text('PROPERTY NODES', 300, 180);
      doc.fontSize(10).font('Helvetica').text(details.hotelName, 300, 200);
      doc.text(`Window: ${details.checkIn} to ${details.checkOut}`, 300, 215);

      doc.moveDown(4);

      // --- TABLE ---
      const tableTop = 280;
      doc.rect(50, tableTop, 500, 20).fill('#F3F4F6');
      doc.fillColor('#1B4D2E').fontSize(10).font('Helvetica-Bold').text('DESCRIPTION', 60, tableTop + 5);
      doc.text('AMOUNT (INR)', 450, tableTop + 5, { align: 'right' });

      doc.fillColor('#1a1a1a').fontSize(10).font('Helvetica').text('Himalayan Stay & Experience Services', 60, tableTop + 35);
      doc.text(`₹${details.amount.toLocaleString('en-IN')}`, 450, tableTop + 35, { align: 'right' });

      doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).stroke('#E5E7EB');

      // --- TOTAL ---
      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica-Bold').text('TOTAL PAID:', 350, doc.y);
      doc.fillColor('#1B4D2E').text(`₹${details.amount.toLocaleString('en-IN')}`, 450, doc.y - 14, { align: 'right' });

      // --- FOOTER ---
      doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('This is a computer generated document synchronized via Tripzy Cloud Bridge. No physical signature required.', 50, 750, { align: 'center' });
      doc.text('© Northern Harrier Expeditions. Dehradun, Uttarakhand, India.', 50, 765, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
