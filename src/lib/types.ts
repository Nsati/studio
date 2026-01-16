import type { Timestamp } from 'firebase/firestore';

export interface Hotel {
  id: string; // Firestore document ID
  slug: string;
  name: string;
  city: string;
  description: string;
  images: string[];
  amenities: string[];
  rating: number;
  rooms?: Room[]; // This will be a subcollection
}

export interface Room {
  id: string; // Firestore document ID
  hotelId: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  price: number;
  capacity: number;
  totalRooms: number;
}

export interface City {
  id: string; // Firestore document ID
  name: string;
  image: string;
}

export interface UserProfile {
  uid: string; // Matches Auth UID
  displayName: string;
  email: string;
  role: 'user' | 'admin';
}


export interface Booking {
  id?: string; // Firestore document ID
  hotelId: string;
  userId: string;
  roomId: string;
  roomType: string;
  checkIn: Timestamp | string;
  checkOut: Timestamp | string;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  status: 'LOCKED' | 'CONFIRMED' | 'CANCELLED';
  expiresAt?: Timestamp; // For locked bookings
  createdAt: Timestamp;
}

// This mock type is no longer used for primary auth state.
export type MockUser = {
    uid: string;
    displayName: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    photoURL?: string | null;
};
