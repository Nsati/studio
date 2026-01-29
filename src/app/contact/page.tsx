
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="bg-muted/40 py-16">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold md:text-5xl">Get in Touch</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    We'd love to hear from you! Whether you have a question about our hotels, need assistance with a booking, or just want to share your travel stories, our team is ready to help.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Mail className="h-6 w-6 text-primary" />
                            Email Us
                        </CardTitle>
                        <CardDescription>
                            For general inquiries and support.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="mailto:nsati09@gmail.com" className="text-lg font-semibold text-primary hover:underline">
                            nsati09@gmail.com
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">We aim to respond within 24 hours.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Phone className="h-6 w-6 text-primary" />
                            Call Us
                        </CardTitle>
                        <CardDescription>
                            For urgent matters and phone bookings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <a href="tel:+916399902725" className="text-lg font-semibold text-primary hover:underline">
                            +91 6399902725
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">Available from 10 AM to 7 PM IST.</p>
                    </CardContent>
                </Card>

                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <MapPin className="h-6 w-6 text-primary" />
                            Our Office
                        </CardTitle>
                        <CardDescription>
                            Come say hello at our headquarters.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">
                            Uttarakhand Getaways Pvt. Ltd.
                        </p>
                         <p className="text-muted-foreground">
                            123, Mall Road, Nainital, Uttarakhand, India - 263001
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
