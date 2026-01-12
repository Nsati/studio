

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
import type { Hotel, Booking } from '@/lib/types';
import { HotelForm } from './HotelForm';
import { Edit, Trash, Calendar, Users, Home, IndianRupee } from 'lucide-react';
import { getHotelById } from '@/lib/data';
import { format } from 'date-fns';

interface AdminTabsProps {
  hotels: Hotel[];
  bookings: Booking[];
}

export function AdminTabs({ hotels: initialHotels, bookings: initialBookings }: AdminTabsProps) {
    const [hotels, setHotels] = useState(initialHotels);
    const [bookings, setBookings] = useState(initialBookings);

    useEffect(() => {
        setHotels(initialHotels);
    }, [initialHotels]);

    useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);
    
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
                <CardTitle>View Bookings</CardTitle>
                <CardDescription>{bookings.length} bookings found.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Hotel</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead className="text-right">Total Paid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => {
                            const hotel = getHotelById(booking.hotelId);
                            return (
                                <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="font-medium">{hotel?.name}</div>
                                    <div className="text-sm text-muted-foreground">{booking.roomType} Room</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{booking.customerName}</div>
                                    <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                                </TableCell>
                                <TableCell>
                                     {format(new Date(booking.checkIn), "dd MMM yyyy")} - {format(new Date(booking.checkOut), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell>{booking.guests}</TableCell>
                                <TableCell className="text-right font-medium">₹{booking.totalPrice.toLocaleString()}</TableCell>
                                </TableRow>
                            );
                        })}
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
