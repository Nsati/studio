
'use client';
import { useMemo } from 'react';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { normalizeTimestamp } from '@/lib/firestore-utils';
import type { WithId } from '@/firebase';


export default function BookingChart({ bookings }: { bookings: WithId<Booking>[] | null }) {
    const chartData = useMemo(() => {
        if (!bookings) return [];
        const data: { [key: string]: { date: string; total: number } } = {};
        
        bookings.forEach(booking => {
            const date = normalizeTimestamp(booking.createdAt);
            if (isNaN(date.getTime())) return; // Skip invalid dates
            const day = date.toISOString().split('T')[0];
            if (!data[day]) {
                data[day] = { date: day, total: 0 };
            }
            data[day].total += booking.totalPrice;
        });

        return Object.values(data).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [bookings]);

    const chartConfig = {
      total: {
        label: "Revenue",
        color: "hsl(var(--primary))",
      },
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue from bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
