'use server';

import { revalidatePath } from 'next/cache';
import { addHotel, updateHotel, deleteHotel as deleteHotelData, updateUser, deleteUser as deleteUserData } from '@/lib/data';
import type { Hotel, MockUser, Room } from '@/lib/types';

export async function revalidateAdminPanel() {
    revalidatePath('/admin');
}

export async function addHotelAction(formData: FormData) {
    
    const newHotel: Omit<Hotel, 'id' | 'slug' | 'rooms' | 'rating'> & { rooms: Omit<Room, 'id' | 'hotelId'>[] } = {
        name: formData.get('name') as string,
        city: formData.get('city') as string,
        description: formData.get('description') as string,
        images: formData.get('images')?.toString().split(',').filter(img => img) || [],
        amenities: formData.get('amenities')?.toString().split(',') || [],
        rooms: [],
    };
    
    // Ensure at least one image exists, if not, add a default one.
    if (newHotel.images.length === 0) {
        newHotel.images.push('hotel-1-1');
    }

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
        images: formData.get('images')?.toString().split(',').filter(img => img) || [],
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

export async function updateUserAction(userId: string, formData: FormData) {
  const updatedUserData: Partial<MockUser> = {
    displayName: formData.get('displayName') as string,
    role: formData.get('role') as 'user' | 'admin',
  };
  updateUser(userId, updatedUserData);
  revalidatePath('/admin');
}

export async function deleteUserAction(userId: string) {
  deleteUserData(userId);
  revalidatePath('/admin');
}
