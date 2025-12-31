
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
import { CreditCard, Landmark, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Room, Hotel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!room) return;

    setIsProcessing(true);
    toast({
      title: 'Processing Payment...',
      description: 'Please wait while we securely process your transaction.',
    });

    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, this ID would come from the backend after successful payment and booking.
      const successfulBookingId = 'b1';
      onPaymentSuccess(successfulBookingId);
    }, 2500);
  };

  if (!room || !hotel) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Complete Your Payment
          </DialogTitle>
          <DialogDescription>
            Confirm the details and choose a payment method to complete your booking for{' '}
            <span className="font-semibold text-primary">{hotel.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{room.type} Room (1 night)</span>
                    <span className="font-medium">₹{room.price.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="font-medium">₹{(room.price * 0.18).toLocaleString()}</span>
                </div>
                 <div className="border-t my-2"></div>
                 <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{(room.price * 1.18).toLocaleString()}</span>
                </div>
            </div>

          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-4"
          >
            <Label
              htmlFor="credit-card"
              className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary"
            >
              <CreditCard className="h-6 w-6 text-primary" />
              <div className="grid gap-1.5">
                  <span className="font-semibold">Credit/Debit Card</span>
                  <span className="text-sm text-muted-foreground">Pay with your Visa, Mastercard, or Amex.</span>
              </div>
              <RadioGroupItem value="credit-card" id="credit-card" className="ml-auto"/>
            </Label>
            <Label
              htmlFor="upi"
              className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary"
            >
              <Wallet className="h-6 w-6 text-primary" />
              <div className="grid gap-1.5">
                  <span className="font-semibold">UPI</span>
                  <span className="text-sm text-muted-foreground">Pay with any UPI app like Google Pay or PhonePe.</span>
              </div>
              <RadioGroupItem value="upi" id="upi" className="ml-auto" />
            </Label>
            <Label
              htmlFor="net-banking"
              className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:border-primary"
            >
              <Landmark className="h-6 w-6 text-primary" />
               <div className="grid gap-1.5">
                  <span className="font-semibold">Net Banking</span>
                  <span className="text-sm text-muted-foreground">Pay from your bank account directly.</span>
              </div>
              <RadioGroupItem value="net-banking" id="net-banking" className="ml-auto" />
            </Label>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handlePayment}
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
      </DialogContent>
    </Dialog>
  );
}
