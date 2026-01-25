
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Please select a rating').max(5),
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  text: z.string().min(20, 'Review must be at least 20 characters long.'),
});

interface WriteReviewFormProps {
  hotelId: string;
  userId: string;
  userHasReviewed: boolean;
}

export function WriteReviewForm({ hotelId, userId, userHasReviewed }: WriteReviewFormProps) {
  const firestore = useFirestore();
  const { userProfile } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      text: '',
    },
  });

  const currentRating = form.watch('rating');

  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!firestore || !userProfile) return;
    setIsLoading(true);

    const reviewRef = doc(firestore, 'hotels', hotelId, 'reviews', userId);

    try {
      await setDoc(reviewRef, {
        ...values,
        id: userId,
        hotelId,
        userId,
        authorName: userProfile.displayName,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not submit your review. Please try again.',
      });
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (userHasReviewed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thank You for Your Review!</CardTitle>
          <CardDescription>You have already submitted a review for this hotel.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>Share your experience with other travelers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            (hoverRating || currentRating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground/50'
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'A wonderful mountain retreat!'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your stay. What did you like? What could be improved?"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
