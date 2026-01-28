'use client';
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getVibeMatchSuggestionAction } from "./actions";
import { type VibeMatchOutput } from "@/ai/flows/vibe-match-flow";
import { Loader2, Sparkles, Wand2, ThumbsUp, MapPin, Hotel, Calendar, Shield, Mountain } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";


const formSchema = z.object({
    travelVibe: z.enum(['peace', 'adventure']),
    travelerType: z.enum(['solo', 'couple', 'family']),
    atmosphere: z.enum(['spiritual', 'away_from_crowd']),
});

function ResultSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <CardTitle className="font-headline text-2xl mt-4">Finding Your Perfect Vibe...</CardTitle>
                <CardDescription>Our Devbhoomi Dost is looking for the best spots just for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

function ResultDisplay({ result }: { result: VibeMatchOutput }) {
    return (
        <Card className="w-full bg-primary/5 border-primary/20 shadow-lg">
            <CardHeader className="text-center items-center">
                 <div className="p-3 bg-primary rounded-full text-primary-foreground">
                    <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-3xl mt-4">Your Devbhoomi Vibe Match!</CardTitle>
                <CardDescription>Our expert recommendation based on your mood.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center bg-background p-6 rounded-lg border">
                    <p className="text-muted-foreground">We recommend</p>
                    <h3 className="text-4xl font-bold font-headline text-primary">{result.suggestedLocation}</h3>
                </div>
                
                <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-green-600"/> Why it's perfect for you:</h4>
                    <p className="text-muted-foreground italic">"{result.reasoning}"</p>
                </div>

                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex-row items-center gap-3 space-y-0">
                           <Hotel className="h-6 w-6 text-accent" />
                           <CardTitle className="text-lg">Suggested Stay</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="font-semibold text-lg">{result.accommodationType}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center gap-3 space-y-0">
                            <Mountain className="h-6 w-6 text-accent" />
                           <CardTitle className="text-lg">Silent Zone Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="font-semibold text-lg">{result.silentZoneScore} / 10</p>
                           <p className="text-xs text-muted-foreground">{result.silentZoneScore > 7 ? "Pure Himalayan peace" : "A balanced vibe"}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex-row items-center gap-3 space-y-0">
                           <Calendar className="h-6 w-6 text-accent" />
                           <CardTitle className="text-lg">Best Time to Visit</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="font-semibold text-lg">{result.bestTimeToVisit}</p>
                        </CardContent>
                    </Card>
                    {result.devtaConnectTip && (
                        <Card className="sm:col-span-2 bg-amber-50 border-amber-200">
                             <CardHeader className="flex-row items-center gap-3 space-y-0">
                                <Shield className="h-6 w-6 text-amber-600" />
                                <CardTitle className="text-lg text-amber-900">Devta Connect Tip</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-amber-800">{result.devtaConnectTip}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}

export default function VibeMatchPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VibeMatchOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            travelVibe: "peace",
            travelerType: "couple",
            atmosphere: "away_from_crowd",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        const response = await getVibeMatchSuggestionAction(values);
        if (response.success && response.data) {
            setResult(response.data);
        } else {
            setError(response.error || "An unknown error occurred.");
        }
        setIsLoading(false);
    };

    const questions = [
        { name: "travelVibe", label: "What kind of vibe are you looking for?", options: [{value: "peace", label: "Peace & Relaxation"}, {value: "adventure", label: "Adventure & Thrills"}] },
        { name: "travelerType", label: "Who are you traveling with?", options: [{value: "solo", label: "Solo"}, {value: "couple", label: "Couple"}, {value: "family", label: "Family"}] },
        { name: "atmosphere", label: "What's your preferred atmosphere?", options: [{value: "spiritual", label: "Spiritual & Cultural"}, {value: "away_from_crowd", label: "Away from the Crowds"}] },
    ];

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Devbhoomi Vibe Match™</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Tell us your mood, and our AI-powered local expert, "Devbhoomi Dost", will find the perfect Himalayan escape for you.
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-12">
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {questions.map(q => (
                             <Card key={q.name} className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">{q.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Controller
                                        control={form.control}
                                        name={q.name as keyof z.infer<typeof formSchema>}
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                                {q.options.map(opt => (
                                                     <div key={opt.value} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={opt.value} id={`${q.name}-${opt.value}`} />
                                                        <Label htmlFor={`${q.name}-${opt.value}`}>{opt.label}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Wand2 className="mr-2 h-6 w-6" />}
                        {isLoading ? "Finding your vibe..." : "Find My Devbhoomi Escape"}
                    </Button>
                </form>

                {isLoading && <ResultSkeleton />}
                
                {error && (
                    <Card className="w-full border-destructive bg-destructive/10">
                        <CardHeader>
                            <CardTitle className="text-destructive">Oops! Something went wrong.</CardTitle>
                            <CardDescription className="text-destructive">{error}</CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {result && <ResultDisplay result={result} />}
            </div>
        </div>
    );
}
