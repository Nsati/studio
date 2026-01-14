

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

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'admin' | 'user';
}


export interface Booking {
  id: string;
  hotelId: string;
  userId: string; // Assuming a user system
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
}
