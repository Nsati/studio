export interface Hotel {
  id: string; 
  name: string;
  city: string;
  description: string;
  address?: string;
  images: string[];
  amenities: string[];
  rating: number;
  minPrice?: number;
}

export interface Room {
  id: string; 
  hotelId: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  price: number;
  capacity: number;
  totalRooms: number;
  availableRooms?: number;
}

export interface City {
  id: string; 
  name: string;
  image: string;
}

export interface UserProfile {
  uid: string; // Matches Auth UID
  displayName: string;
  email: string;
  mobile: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active';
}

export interface Booking {
  id?: string; 
  hotelId: string;
  userId: string;
  roomId: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  razorpayPaymentId?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  duration: string;
  destinations: string[];
  price: number;
  image: string;
  description: string;
}

export interface Promotion {
  id: string; // The coupon code, also used as doc ID
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
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
