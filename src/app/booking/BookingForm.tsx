
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { differenceInDays, format, parse } from 'date-fns';
import { createRazorpayOrder, verifyPaymentAndConfirmBooking } from '@/app/booking/actions';
import { signInAnonymously } from 'firebase/auth';


import type { Hotel, Room, Booking, Promotion } from '@/lib/types';
import { useFirestore, useAuth, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, getDoc } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar, Users, BedDouble, ArrowLeft, Tag, ShieldCheck, Info, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userProfile } = useUser();
    const auth = useAuth(); // For guest checkout
    const { toast } = useToast();
    const firestore = useFirestore();

    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '1';
    
    const hotelRef = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return doc(firestore, 'hotels', hotelId);
    }, [firestore, hotelId]);

    const { data: hotel, isLoading: isHotelLoading } = useDoc<Hotel>(hotelRef);
    
    const roomsQuery = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return collection(firestore, 'hotels', hotelId, 'rooms');
    }, [firestore, hotelId]);
    
    const { data: rooms, isLoading: areRoomsLoading } = useCollection<Room>(roomsQuery);

    const room = useMemoFirebase(() => {
        if (areRoomsLoading || !rooms) return null;
        return rooms.find(r => r.id === roomId);
    }, [areRoomsLoading, rooms, roomId]);


    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');


    useEffect(() => {
        if (userProfile) {
            setCustomerDetails({ name: userProfile.displayName, email: userProfile.email });
        }
    }, [userProfile]);

    if (isHotelLoading || areRoomsLoading) {
        return null; // Let the parent Suspense boundary handle the loading UI.
    }
    
    if (!hotelId || !roomId || !checkInStr || !checkOutStr || !hotel || !room) {
        return notFound();
    }
    
    const checkIn = parse(checkInStr, 'yyyy-MM-dd', new Date());
    const checkOut = parse(checkOutStr, 'yyyy-MM-dd', new Date());
    const nights = differenceInDays(checkOut, checkIn);

    if (nights <= 0) {
        return notFound();
    }

    const hotelImage = PlaceHolderImages.find((img) => img.id === hotel.images[0]);
    
    const hotelDiscountPercent = hotel.discount || 0;
    const originalRoomPrice = room.price;
    const discountedRoomPrice = originalRoomPrice * (1 - hotelDiscountPercent / 100);
    
    const originalBasePrice = originalRoomPrice * nights;
    const basePriceAfterHotelDiscount = discountedRoomPrice * nights;
    const totalPrice = basePriceAfterHotelDiscount - couponDiscount;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Database not available' });
            return;
        }

        const couponRef = doc(firestore, 'promotions', couponCode.toUpperCase());
        const couponSnap = await getDoc(couponRef);

        if (couponSnap.exists() && couponSnap.data().isActive) {
            const promotion = couponSnap.data() as Promotion;
            let discountAmount = 0;

            if (promotion.discountType === 'percentage') {
                // Coupon is applied on the price after hotel discount
                discountAmount = basePriceAfterHotelDiscount * (promotion.discountValue / 100);
                setCouponMessage(`🎉 Coupon "${promotion.code}" applied! You saved ${promotion.discountValue}%.`);
            } else { // fixed
                discountAmount = promotion.discountValue;
                 setCouponMessage(`🎉 Coupon "${promotion.code}" applied! You saved a flat amount.`);
            }
            setCouponDiscount(discountAmount);
            toast({
                title: 'Coupon Applied!',
                description: `You saved ${discountAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}.`,
            });
        } else {
            setCouponDiscount(0);
            setCouponMessage('Invalid or expired coupon code.');
            toast({
                variant: 'destructive',
                title: 'Invalid Coupon',
                description: 'The coupon code you entered is not valid or has expired.',
            });
        }
    };

    const handlePayment = async () => {
        // --- Initial validations ---
        if (typeof window.Razorpay === 'undefined') {
            toast({
                variant: "destructive",
                title: "Payment Gateway Error",
                description: "Could not connect to the payment service. Please refresh.",
            });
            return;
        }
        if (totalPrice < 1) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Total amount must be at least ₹1.',
            });
            return;
        }
        if (!customerDetails.name || !customerDetails.email) {
            toast({
                variant: 'destructive',
                title: 'Missing Details',
                description: 'Please provide your name and email.',
            });
            return;
        }
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Database not available' });
            return;
        }
        setIsBooking(true);

        // --- Get or create a user for the booking ---
        let userIdForBooking = user?.uid;
        if (!userIdForBooking) {
            if (!auth) {
                 toast({ variant: 'destructive', title: 'Authentication service not available' });
                 setIsBooking(false);
                 return;
            }
            try {
                const userCredential = await signInAnonymously(auth);
                userIdForBooking = userCredential.user.uid;
                toast({
                    title: 'Booking as Guest',
                    description: 'Your booking will be saved temporarily.',
                });
            } catch (error) {
                console.error("Anonymous sign-in failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Guest Checkout Failed',
                    description: 'Could not proceed. Please try again.',
                });
                setIsBooking(false);
                return;
            }
        }
        
        const bookingId = `booking_${Date.now()}`;

        // --- Create Razorpay order ---
        const orderResponse = await createRazorpayOrder(totalPrice, {
            // Notes for webhook fallback
            user_id: userIdForBooking,
            booking_id: bookingId
        });

        if (!orderResponse.success || !orderResponse.order) {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: orderResponse.error || 'Could not initiate payment.',
            });
            setIsBooking(false);
            return;
        }
        const { order, keyId } = orderResponse;
        
        const bookingDetails = {
            id: bookingId,
            userId: userIdForBooking,
            hotelId: hotel.id,
            roomId: room.id,
            roomType: room.type,
            checkIn: checkInStr,
            checkOut: checkOutStr,
            guests: parseInt(guests),
            totalPrice: totalPrice,
            customerName: customerDetails.name,
            customerEmail: customerDetails.email,
        };

        const options = {
            key: keyId,
            amount: order.amount,
            currency: order.currency,
            name: "Uttarakhand Getaways",
            description: `Booking for ${hotel.name}`,
            order_id: order.id,
            handler: async (response: any) => {
                try {
                    toast({ title: "Payment Received!", description: "Verifying and confirming your booking..." });
                    
                    const verificationResult = await verifyPaymentAndConfirmBooking({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        bookingDetails: bookingDetails
                    });

                    if (verificationResult.success && verificationResult.bookingId) {
                         toast({
                            title: "Payment Verified!",
                            description: "Your booking is confirmed. Redirecting..."
                        });
                        router.push(`/booking/success/${verificationResult.bookingId}`);
                    } else {
                        throw new Error(verificationResult.error || "Payment verification failed.");
                    }
                } catch (error: any) {
                     toast({
                        variant: "destructive",
                        title: "Booking Confirmation Failed",
                        description: error.message || "There was an issue confirming your booking after payment. Please contact support, your payment was successful.",
                        duration: 10000,
                    });
                    setIsBooking(false);
                }
            },
            prefill: {
                name: customerDetails.name,
                email: customerDetails.email,
            },
            theme: {
                color: "#388E3C", 
            },
            modal: {
                ondismiss: () => {
                    setIsBooking(false);
                    toast({
                        variant: 'destructive',
                        title: 'Payment Cancelled',
                        description: 'You cancelled the payment process.',
                    })
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch(e) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Failed to open payment gateway. Please refresh.",
            });
            setIsBooking(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4 md:px-6">
            <Link href={`/hotels/${hotel.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Hotel
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">Review Your Booking</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">{hotel.name}</CardTitle>
                            <CardDescription>{hotel.city}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hotelImage && (
                                <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-4">
                                    <Image src={hotelImage.imageUrl} alt={hotel.name} data-ai-hint={hotelImage.imageHint} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                </div>
                            )}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <BedDouble className="h-5 w-5" />
                                    <span>{room.type} Room</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="h-5 w-5" />
                                    <span>{format(checkIn, 'EEE, LLL dd')} - {format(checkOut, 'EEE, LLL dd')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Users className="h-5 w-5" />
                                    <span>{guests} Guest(s)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="font-headline text-2xl font-bold md:text-3xl">Confirm & Book</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Guest Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor='customerName'>Full Name</Label>
                                <Input
                                    id="customerName"
                                    placeholder="Your Name"
                                    value={customerDetails.name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor='customerEmail'>Email Address</Label>
                                <Input
                                    id="customerEmail"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={customerDetails.email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Price Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>{room.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} x {nights} nights</span>
                                <span>{originalBasePrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>

                             {hotelDiscountPercent > 0 && (
                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Hotel Offer ({hotelDiscountPercent}%)</span>
                                    <span>- {(originalBasePrice - basePriceAfterHotelDiscount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-muted-foreground text-sm">
                                <span>Taxes &amp; Fees</span>
                                <span className="font-semibold text-green-600">Included</span>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <Label htmlFor="coupon" className="flex items-center gap-2 font-semibold text-base">
                                    <Tag className="h-5 w-5 text-primary" /> Apply Discount
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="coupon"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                                        Apply
                                    </Button>
                                </div>
                                {couponMessage && (
                                    <p className={`mt-2 text-sm ${couponDiscount > 0 ? 'font-semibold text-green-600' : 'text-destructive'}`}>
                                        {couponMessage}
                                    </p>
                                )}
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600 font-semibold border-t pt-4">
                                    <span>Coupon Discount</span>
                                    <span>- {couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                                </div>
                            )}

                            <div className="border-t pt-4 mt-2 flex justify-between font-bold text-lg">
                                <span>Total Amount</span>
                                <span>{totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</span>
                            </div>
                        </CardContent>
                    </Card>

                     <div className="items-top flex space-x-3">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-0.5" />
                        <div className="grid gap-1.5 leading-none">
                            <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                            I understand and agree to the rules of this hotel and Uttarakhand Getaways' <Link href="/terms" target="_blank" className="text-primary font-semibold hover:underline">Terms of Use</Link> &amp; <Link href="/privacy" target="_blank" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>
                    </div>

                     <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle className="font-semibold">Hotel Policies</AlertTitle>
                      <AlertDescription className="text-xs">
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Valid government-issued photo ID is required at check-in.</li>
                          <li>This property is couple-friendly.</li>
                          <li>Early check-in and late check-out are subject to availability and may be chargeable.</li>
                        </ul>
                      </AlertDescription>
                    </Alert>


                    <Button onClick={handlePayment} size="lg" className="w-full text-lg h-14 bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/50" disabled={isBooking || !termsAccepted}>
                        {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isBooking ? 'Processing...' : `Pay ${totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })} & Book`}
                    </Button>

                     <div className="text-center text-sm text-muted-foreground space-y-2 mt-2">
                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>100% Secure Payments</span>
                        </div>
                        <p className="text-xs flex items-center justify-center gap-2"><HelpCircle className="h-4 w-4" />Need help? Email us at <a href="mailto:support@uttarakhandgetaways.com" className="font-semibold text-primary hover:underline">support@uttarakhandgetaways.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
