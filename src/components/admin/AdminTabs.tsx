
'use client';

import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Hotel, Booking } from '@/lib/types';
import { HotelForm } from './HotelForm';
import { cn } from '@/lib/utils';
import { Edit, Trash } from 'lucide-react';

interface AdminTabsProps {
  hotels: Hotel[];
  initialBookings: Booking[];
}

export function AdminTabs({ hotels: initialHotels, initialBookings }: AdminTabsProps) {
    const [bookings, setBookings] = useState(initialBookings);
    const [hotels, setHotels] = useState(initialHotels);

    // This is a simple way to keep the hotels list updated if it changes.
    // In a real app, this would likely be handled by a more robust state management library.
    useEffect(() => {
        setHotels(initialHotels);
    }, [initialHotels]);
    
  return (
    <Tabs defaultValue="hotels" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="hotels">Hotels</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="add-hotel">Add New Hotel</TabsTrigger>
      </TabsList>
      <TabsContent value="hotels">
        <Card>
            <CardHeader>
                <CardTitle>Manage Hotels</CardTitle>
                <CardDescription>{hotels.length} hotels found.</CardDescription>
            </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.city}</TableCell>
                    <TableCell>{hotel.rating}</TableCell>
                    <TableCell>{hotel.rooms.reduce((acc, room) => acc + room.totalRooms, 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="bookings">
        <Card>
            <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
                <CardDescription>{bookings.length} bookings found.</CardDescription>
            </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                   <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.hotelName}</TableCell>
                    <TableCell>{booking.checkIn} - {booking.checkOut}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn({
                          'bg-green-100 text-green-800 border-green-200':
                            booking.status === 'Confirmed',
                          'bg-red-100 text-red-800 border-red-200':
                            booking.status === 'Cancelled',
                        })}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{booking.totalPrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="add-hotel">
        <Card>
          <CardHeader>
            <CardTitle>Add a New Hotel</CardTitle>
            <CardDescription>
              Fill in the details to add a new property to your listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HotelForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
