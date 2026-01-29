
export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Shipping Policy</h1>
      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Applicability</h2>
          <p>
            Welcome to Uttarakhand Getaways! As a service provider for hotel and tour package bookings, we deliver all our services, confirmations, and communications electronically.
          </p>
          <p className="mt-4">
            Since our products are digital services (booking confirmations, vouchers, etc.), there are no physical goods to ship. Therefore, a traditional shipping policy is not applicable to our business model. All booking-related documents will be sent to the email address you provide during the booking process.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Delivery of Confirmation</h2>
          <p>
            Upon successful completion of your booking and payment, you will receive an instant booking confirmation via email. This email will serve as your proof of purchase and will contain all the necessary details about your booking, including the hotel's address, check-in/check-out dates, and your booking ID.
          </p>
          <p className="mt-4">
            If you do not receive a confirmation email within a few minutes of booking, please check your spam or junk folder. If you still cannot find it, please contact us immediately at <a href="mailto:nsati09@gmail.com" className="text-primary hover:underline">nsati09@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
