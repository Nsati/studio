
export interface Hotel {
  name: string;
  city: string;
  description: string;
  address?: string;
  images: string[];
  amenities: string[];
  rating: number;
  minPrice: number;
  discount: number;

  // Smart Uttarakhand Features
  mountainSafetyScore: number;
  landslideRisk: 'Low' | 'Medium' | 'High';
  roadCondition: string;
  networkJio: boolean;
  networkAirtel: boolean;
  networkBsnl: boolean;
  isSnowFriendly: boolean;
  isElderlySafe: boolean;
  hasPowerBackup: boolean;
  nearestAtmKm: number;
  cabFareToCenter: number;
  balconyWorthIt: boolean;
  
  isVerifiedPahadiHost?: boolean;
  
  ecoPractices?: {
    waterSaving: boolean;
    plasticFree: boolean;
    localSourcing: boolean;
  };
  safetyInfo?: {
    nearestHospital?: string;
    policeStation?: string;
    networkCoverage?: 'good' | 'average' | 'poor' | '';
  };
  spiritualAmenities?: string[];
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

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  mobile: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'suspended';
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  roomType: string;
  checkIn: any;
  checkOut: any;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  createdAt: any;
  
  weatherRiskAccepted: boolean;
  splitPayment: boolean;
  earlyCheckInRequested: boolean;
}

export interface City {
  id: string;
  name: string;
  image: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  distance: string;
  travelTime: string;
}

export interface HotelDetail {
  city: string;
  hotelName: string;
  category: string;
  roomType: string;
  mealPlan: string;
}

export interface TourPackage {
  id: string;
  title: string;
  duration: string;
  destinations: string[];
  price: number; // Base Price
  gst: number;
  totalCost: number;
  image: string;
  description: string;
  
  // Advanced Fields for user requirements
  persons: number;
  rooms: number;
  cabType: string;
  travelDate?: string;
  
  itinerary: ItineraryDay[];
  hotels: HotelDetail[];
  inclusions: string[];
  exclusions: string[];
  
  policies: {
    tcs: string;
    cancellation: string;
    payment: string;
    terms: string;
  };
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  hotelId: string;
  userId: string;
  authorName: string;
  rating: number;
  text: string;
  title: string;
  createdAt: any;
}
