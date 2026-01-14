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
  userId: string; // This will be the Firebase Auth UID
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
}
