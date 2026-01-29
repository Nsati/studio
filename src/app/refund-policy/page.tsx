
export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <h1 className="font-headline text-3xl font-bold mb-8">Cancellations & Refund Policy</h1>
      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Cancellation Process</h2>
          <p>
            We understand that plans can change. You can cancel your booking directly from your user dashboard.
          </p>
          <ol className="list-decimal list-inside space-y-2 mt-4 pl-4">
            <li>Log in to your Uttarakhand Getaways account and navigate to the <a href="/my-bookings" className="text-primary hover:underline">My Bookings</a> page.</li>
            <li>Find the booking you wish to cancel and click on the "Cancel Booking" button.</li>
            <li>Follow the on-screen instructions to confirm the cancellation.</li>
          </ol>
          <p className="mt-4">
            Please note that cancellation policies are set by our hotel partners and can vary significantly from one hotel to another. The specific cancellation policy for your booking is displayed during the reservation process and in your confirmation email.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Refund Eligibility</h2>
          <p>
            Your eligibility for a refund depends entirely on the cancellation policy of the hotel you booked.
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
            <li><strong>Free Cancellation:</strong> If you cancel within the free cancellation period mentioned in your booking terms, you will typically receive a full refund.</li>
            <li><strong>Partial Refund:</strong> Some policies may offer a partial refund if you cancel after the free cancellation period has expired but before a certain deadline.</li>
            <li><strong>Non-Refundable:</strong> Many promotional or discounted rates are non-refundable. If you have booked a non-refundable rate, you will not be eligible for a refund upon cancellation.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Refund Processing</h2>
          <p>
            If your booking is eligible for a refund, the amount will be credited back to your original mode of payment.
          </p>
          <p className="mt-4">
            Please allow **7-10 business days** for the refund to reflect in your account. The processing time may vary depending on your bank or card issuer.
          </p>
          <p className="mt-2">
            Uttarakhand Getaways acts as a facilitator between you and the hotel. The final refund amount and decision rest with the hotel according to their policy.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Contact Us for Assistance</h2>
          <p>
            If you face any issues with the cancellation process or have questions about your refund, our support team is here to help.
          </p>
          <p className="mt-4">
            For any disputes or queries, please contact us at:
            <br />
            <strong>Email:</strong> <a href="mailto:nsati09@gmail.com" className="text-primary hover:underline">nsati09@gmail.com</a>
            <br />
            <strong>Phone:</strong> <a href="tel:+916399902725" className="text-primary hover:underline">+91 6399902725</a>
          </p>
        </section>
      </div>
    </div>
  );
}
