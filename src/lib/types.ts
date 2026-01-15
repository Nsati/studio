export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  description: string;
  images: string[];
  amenities: string[];
  rating: number;
  rooms: Room[];
}

export interface Room {
  id: string;
  hotelId: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  price: number;
  capacity: number;
  totalRooms: number;
}

export interface City {
  name: string;
  image: string;
}

export interface UserProfile {
  id: string; // Should match Firebase Auth UID
  displayName: string;
  email: string;
  role: 'admin' | 'user';
}


export interface Booking {
  id: string;
  hotelId: string;
  userId: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  status: 'LOCKED' | 'CONFIRMED' | 'CANCELLED';
  expiresAt?: string; // For locked bookings
}

// Mock user type for frontend-only state
export type MockUser = {
    uid: string;
    displayName: string;
    email: string;
    password?: string; // This is for mock purposes only. NEVER store plain text passwords in a real app.
    role: 'user' | 'admin';
    photoURL?: string | null;
};
