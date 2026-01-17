'use client';

import React from 'react';
import type { Hotel } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card } from '../ui/card';
import { dummyHotels } from '@/lib/dummy-data';
import { Star } from 'lucide-react';

export function HotelList() {
    const hotels = dummyHotels;

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight">Hotel Management</h2>
                <p className="text-muted-foreground">
                    Viewing all hotels. (Editing is disabled when using dummy data).
                </p>
            </div>
            <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hotels?.map((hotel) => (
                           <TableRow key={hotel.id}>
                                <TableCell className="font-medium">{hotel.name}</TableCell>
                                <TableCell>{hotel.city}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        {hotel.rating}
                                    </div>
                                </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
