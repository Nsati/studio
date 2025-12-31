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
  type: 'Standard' | 'Deluxe' | 'Suite';
  price: number;
  capacity: number;
  totalRooms: number;
}

export interface City {
  name: string;
  image: string;
}

export interface Booking {
  id: string;
  hotelName: string;
  hotelCity: string;
  hotelImage: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'Confirmed' | 'Cancelled' | 'Pending';
}
