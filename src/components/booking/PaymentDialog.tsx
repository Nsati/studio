'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Landmark, Wallet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Room, Hotel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const paymentFormSchema = z
  .object({
    name: z.string().min(2, { message: 'Name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    paymentMethod: z.enum(['credit-card', 'upi', 'net-banking']),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    upiId: z.string().optional(),
    bank: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === 'credit-card') {
        return (
          !!data.cardNumber &&
          /^\d{16}$/.test(data.cardNumber) &&
          !!data.expiryDate &&
          /^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate) &&
          !!data.cvv &&
          /^\d{3}$/.test(data.cvv)
        );
      }
      return true;
    },
    {
      message: 'Invalid card details. Please check card number (16 digits), expiry (MM/YY), and CVV (3 digits).',
      path: ['cardNumber'], 
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === 'upi') {
        return !!data.upiId && data.upiId.includes('@');
      }
      return true;
    },
    {
      message: 'Please enter a valid UPI ID.',
      path: ['upiId'],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === 'net-banking') {
        return !!data.bank;
      }
      return true;
    },
    {
      message: 'Please select a bank.',
      path: ['bank'],
    }
  );

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: (bookingId: string) => void;
  room: Room | null;
  hotel: Hotel | null;
}

export function PaymentDialog({
  open,
  onOpenChange,
  onPaymentSuccess,
  room,
  hotel,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      paymentMethod: 'credit-card',
    },
  });

  const paymentMethod = useWatch({
    control: form.control,
    name: 'paymentMethod',
  });

  const handlePayment = (data: PaymentFormValues) => {
    if (!room) return;

    console.log('Payment Data:', data);
    setIsProcessing(true);
    toast({
      title: 'Processing Payment...',
      description: 'Please wait while we securely process your transaction.',
    });

    setTimeout(() => {
      setIsProcessing(false);
      const successfulBookingId = 'b1';
      onPaymentSuccess(successfulBookingId);
      form.reset();
    }, 2500);
  };

  if (!room || !hotel) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Complete Your Booking
          </DialogTitle>
          <DialogDescription>
            Enter your details and choose a payment method for{' '}
            <span className="font-semibold text-primary">{hotel.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="font-semibold mb-2">Booking Summary</h4>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {room.type} Room (1 night)
                </span>
                <span className="font-medium">
                  ₹{room.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-medium">
                  ₹{(room.price * 0.18).toLocaleString()}
                </span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{(room.price * 1.18).toLocaleString()}</span>
              </div>
            </div>

            <h4 className="font-semibold pt-2">Your Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="123-456-7890" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            
            <h4 className="font-semibold pt-4">Payment Method</h4>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <FormItem>
                        <Label
                          htmlFor="credit-card"
                          className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary"
                        >
                          <CreditCard className="h-6 w-6 text-primary" />
                          <div className="grid gap-1.5">
                            <span className="font-semibold">
                              Credit/Debit Card
                            </span>
                          </div>
                          <RadioGroupItem
                            value="credit-card"
                            id="credit-card"
                            className="ml-auto"
                          />
                        </Label>
                      </FormItem>
                      <FormItem>
                        <Label
                          htmlFor="upi"
                          className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary"
                        >
                          <Wallet className="h-6 w-6 text-primary" />
                          <div className="grid gap-1.5">
                            <span className="font-semibold">UPI</span>
                          </div>
                          <RadioGroupItem
                            value="upi"
                            id="upi"
                            className="ml-auto"
                          />
                        </Label>
                      </FormItem>
                      <FormItem>
                        <Label
                          htmlFor="net-banking"
                          className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary"
                        >
                          <Landmark className="h-6 w-6 text-primary" />
                          <div className="grid gap-1.5">
                            <span className="font-semibold">Net Banking</span>
                          </div>
                          <RadioGroupItem
                            value="net-banking"
                            id="net-banking"
                            className="ml-auto"
                          />
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {paymentMethod === 'credit-card' && (
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1111 2222 3333 4444" {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry (MM/YY)</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
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
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="pt-2">
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="yourname@bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
             {paymentMethod === 'net-banking' && (
              <div className="pt-2">
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
                                <SelectItem value="hdfc">HDFC Bank</SelectItem>
                                <SelectItem value="icici">ICICI Bank</SelectItem>
                                <SelectItem value="sbi">State Bank of India</SelectItem>
                                <SelectItem value="axis">Axis Bank</SelectItem>
                                <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}


            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${(room.price * 1.18).toLocaleString()}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
