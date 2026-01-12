
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
import { Loader2, Landmark, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import type { Hotel, Room } from '@/lib/types';
import { addBooking, getRoomById } from '@/lib/data';
import type { DateRange } from 'react-day-picker';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel;
  room: Room;
  dates: DateRange;
  totalAmount: number;
  guests: number;
}

const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'upi', 'netbanking']),
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  
  // Card fields
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvv: z.string().optional(),

  // UPI field
  upiId: z.string().optional(),

  // Netbanking field
  bank: z.string().optional(),

}).superRefine((data, ctx) => {
    if (data.paymentMethod === 'card') {
        if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
            ctx.addIssue({ code: 'custom', message: 'Card number must be 16 digits.', path: ['cardNumber'] });
        }
        if (!data.expiry || !/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(data.expiry)) {
            ctx.addIssue({ code: 'custom', message: 'Expiry must be MM/YY.', path: ['expiry'] });
        }
        if (!data.cvv || !/^\d{3}$/.test(data.cvv)) {
            ctx.addIssue({ code: 'custom', message: 'CVV must be 3 digits.', path: ['cvv'] });
        }
    }
    if (data.paymentMethod === 'upi') {
        if (!data.upiId || !/^[\w.-]+@[\w.-]+$/.test(data.upiId)) {
            ctx.addIssue({ code: 'custom', message: 'Please enter a valid UPI ID.', path: ['upiId'] });
        }
    }
    if (data.paymentMethod === 'netbanking') {
        if (!data.bank) {
            ctx.addIssue({ code: 'custom', message: 'Please select a bank.', path: ['bank'] });
        }
    }
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const mockBanks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
];

export function PaymentDialog({
  isOpen,
  onClose,
  hotel,
  room,
  dates,
  totalAmount,
  guests,
}: PaymentDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const { from: checkInDate, to: checkOutDate } = dates;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      name: '',
      email: '',
      paymentMethod: 'card',
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    setIsProcessing(true);

    if (!checkInDate || !checkOutDate) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Check-in or check-out date is missing.',
      });
      setIsProcessing(false);
      return;
    }

    // Mock payment processing
    setTimeout(() => {
      const newBooking = addBooking({
        hotelId: hotel.id,
        roomId: room.id,
        roomType: room.type,
        userId: 'u1', // mock user
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: guests,
        totalPrice: totalAmount,
        customerName: data.name,
        customerEmail: data.email,
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
  
  const handleTabChange = (value: string) => {
    setPaymentMethod(value);
    form.setValue('paymentMethod', value as 'card' | 'upi' | 'netbanking');
  }

  if (!checkInDate || !checkOutDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
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
                <Tabs value={paymentMethod} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="card">Card</TabsTrigger>
                        <TabsTrigger value="upi">UPI</TabsTrigger>
                        <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 space-y-4">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
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
                    </div>
                    <TabsContent value="card" className="mt-4 space-y-4">
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
                    </TabsContent>
                    <TabsContent value="upi" className="mt-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="upiId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>UPI ID</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <Input placeholder="yourname@bank" {...field} />
                                        <Button variant="outline" type="button">Verify</Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="text-center text-sm text-muted-foreground">
                            You will receive a payment request on your UPI app.
                        </div>
                    </TabsContent>
                    <TabsContent value="netbanking" className="mt-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="bank"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Bank</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose your bank" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {mockBanks.map(bank => (
                                        <SelectItem key={bank} value={bank}>
                                            <div className="flex items-center gap-2">
                                                <Landmark className="h-4 w-4" />
                                                {bank}
                                            </div>
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="text-center text-sm text-muted-foreground">
                            You will be redirected to your bank's secure portal.
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="pt-4">
                    <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing}
                    >
                    {isProcessing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Securely Pay ₹{totalAmount.toLocaleString()}
                    </Button>
                </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
