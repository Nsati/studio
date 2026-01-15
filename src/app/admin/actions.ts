'use server';

import { revalidatePath } from 'next/cache';
import { addHotel, updateHotel, deleteHotel as deleteHotelData } from '@/lib/data';
import type { Hotel, Room } from '@/lib/types';
import shortid from 'shortid';

export async function addHotelAction(formData: FormData) {
    const hotelName = formData.get('name') as string;
    
    // Create a new placeholder ID for the image
    const imageId = `hotel-new-${shortid.generate()}`;

    const newHotel: Omit<Hotel, 'id' | 'slug' | 'rooms' | 'rating'> & { rooms: Omit<Room, 'id' | 'hotelId'>[] } = {
        name: hotelName,
        city: formData.get('city') as string,
        description: formData.get('description') as string,
        images: [imageId],
        amenities: formData.get('amenities')?.toString().split(',') || [],
        rooms: [],
    };
    
    const roomsData = formData.get('rooms') as string;
    if (roomsData) {
        newHotel.rooms = JSON.parse(roomsData);
    }

    addHotel(newHotel as any);
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/search');
}

export async function updateHotelAction(hotelId: string, formData: FormData) {
    const hotelData = {
        id: hotelId,
        name: formData.get('name') as string,
        city: formData.get('city') as string,
        description: formData.get('description') as string,
        amenities: formData.get('amenities')?.toString().split(',') || [],
        images: formData.get('images')?.toString().split(',') || [],
        rating: parseFloat(formData.get('rating') as string),
        // The slug will be regenerated in the updateHotel function
        slug: '', 
        rooms: JSON.parse(formData.get('rooms') as string),
    };

    updateHotel(hotelId, hotelData);
    revalidatePath('/admin');
    revalidatePath(`/hotels/${hotelData.slug}`);
    revalidatePath('/search');
}

export async function deleteHotelAction(hotelId: string) {
    deleteHotelData(hotelId);
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/search');
}
