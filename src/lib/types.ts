
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

export interface User {
  displayName: string;
  email: string;
  role: 'admin' | 'user';
}
