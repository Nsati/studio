
import { notFound } from 'next/navigation';
import { getBookingById } from '@/lib/data';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingSuccessPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const bookingId = searchParams?.bookingId;

    if (!bookingId || typeof bookingId !== 'string') {
        return (
            <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Booking Request</AlertTitle>
                    <AlertDescription>
                        We couldn't find the booking details. Please check your email or go to "My Bookings" page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const booking = getBookingById(bookingId);

    if (!booking) {
        notFound();
    }
    
    // The user should be on this page after a SUCCESSFUL booking.
    if (booking.status !== 'Confirmed') {
         return (
            <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
                 <Card>
                    <CardContent className="p-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Booking Not Confirmed</AlertTitle>
                            <AlertDescription>
                                There was an issue with your booking. It is currently in '{booking.status}' state. Please contact support for assistance.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                 </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
            <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8">
                     <BookingConfirmation booking={booking} />
                </CardContent>
            </Card>
        </div>
    );
}
