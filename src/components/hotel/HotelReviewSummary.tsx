'use client';

import { useState, useEffect } from 'react';
import type { Review } from '@/lib/types';
import { summarizeReviews, type SummarizeReviewsOutput } from '@/ai/flows/summarize-reviews';
import { Skeleton } from '../ui/skeleton';
import { ThumbsUp, ThumbsDown, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

function ReviewSummarySkeleton() {
    return (
        <div className="space-y-6">
             <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-3/4" />
            </div>
        </div>
    )
}

export function HotelReviewSummary({ reviews, hotelName }: { reviews: Review[], hotelName: string }) {
    const [summary, setSummary] = useState<SummarizeReviewsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!reviews || reviews.length === 0) {
            setIsLoading(false);
            return;
        }

        const reviewTexts = reviews.map(r => r.text);
        
        summarizeReviews({ reviews: reviewTexts, hotelName })
            .then(result => {
                setSummary(result);
            })
            .catch(err => {
                console.error("Failed to summarize reviews:", err);
                setError("AI summary could not be generated at this time.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [reviews, hotelName]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        AI Review Summary
                    </CardTitle>
                     <CardDescription>Our AI is analyzing the reviews...</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewSummarySkeleton />
                </CardContent>
            </Card>
        );
    }

    if (error || !summary || (summary.pros.length === 0 && summary.cons.length === 0)) {
        // Don't render the component if there's an error or no summary/reviews
        return null; 
    }

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Bot className="h-6 w-6" />
                    AI Review Summary
                </CardTitle>
                <CardDescription>A quick glance at what guests are saying.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {summary.pros.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2 mb-3 text-green-700">
                            <ThumbsUp className="h-5 w-5"/>
                            What Guests Loved
                        </h4>
                        <ul className="space-y-2 list-inside">
                            {summary.pros.map((pro, index) => (
                                <li key={`pro-${index}`} className="flex items-start">
                                    <span className="text-sm">{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
               
                {summary.cons.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2 mb-3 text-amber-700">
                             <ThumbsDown className="h-5 w-5" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-2 list-inside">
                            {summary.cons.map((con, index) => (
                                <li key={`con-${index}`} className="flex items-start">
                                    <span className="text-sm">{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
