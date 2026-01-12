'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import type { Hotel, Room } from '@/lib/types';
import { addBooking } from '@/lib/data';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  hotel: Hotel;
  room: Room;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
}

const paymentSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits.'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be MM/YY.'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV must be 3 digits.'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentDialog({
  isOpen,
  onClose,
  hotel,
  room,
  checkInDate,
  checkOutDate,
  totalAmount,
}: PaymentDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      name: '',
      email: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
        const newBooking = addBooking({
            hotelId: hotel.id,
            roomId: room.id,
            roomType: room.type,
            userId: 'u1', // mock user
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            guests: room.capacity,
            totalPrice: totalAmount,
        });

      toast({
        title: 'Payment Successful!',
        description: `Your booking at ${hotel.name} is confirmed.`,
      });

      setIsProcessing(false);
      onClose();
      router.push(`/booking/success/${newBooking.id}`);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
          <DialogDescription>
            Enter your payment details for {room.type} Room at {hotel.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4 rounded-lg bg-muted/50 p-4">
            <h4 className="font-semibold">Booking Summary</h4>
            <p className="text-sm">
              {hotel.name} - {room.type} Room
            </p>
            <p className="text-sm text-muted-foreground">
              {format(checkInDate, 'PPP')} to {format(checkOutDate, 'PPP')}
            </p>
            <p className="mt-2 text-lg font-bold">
              Total: ₹{totalAmount.toLocaleString()}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="•••• •••• •••• ••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Pay ₹{totalAmount.toLocaleString()}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
