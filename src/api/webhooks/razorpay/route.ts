// This file has been intentionally emptied.
// The payment confirmation logic has been moved to a client-side transaction
// in BookingForm.tsx to bypass server-side Firebase Admin SDK initialization issues.
// This new architecture removes the need for a server-to-server webhook,
// making the payment confirmation flow more direct and resilient for this application.
