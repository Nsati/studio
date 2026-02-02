
export interface Hotel {
  name: string;
  city: string;
  description: string;
  address?: string;
  images: string[];
  amenities: string[];
  rating: number;
  minPrice?: number;
  discount?: number;

  // God-Mode Features
  isVerifiedPahadiHost?: boolean;
  isForceClosed?: boolean; // Emergency manual shutdown
  isPremiumListing?: boolean;
  adminNotes?: string;
  
  ecoPractices?: {
    waterSaving: boolean;
    plasticFree: boolean;
    localSourcing: boolean;
  };
  safetyInfo?: {
    nearestHospital: string;
    policeStation: string;
    networkCoverage: 'good' | 'average' | 'poor' | '';
  };
  spiritualAmenities?: string[];
}

export interface Room {
  hotelId: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  price: number;
  capacity: number;
  totalRooms: number;
  availableRooms?: number;
  isInventoryOverridden?: boolean;
}

export interface City {
  id: string;
  name: string;
  image: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  mobile: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  isVip?: boolean;
  lastLogin?: Date;
}

export interface Booking {
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  hotelAddress: string;
  roomId: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'REJECTED';
  createdAt: Date;
  razorpayPaymentId?: string;
  couponCode?: string;
  adminNote?: string;
  isOverridden?: boolean;
}

export interface SystemSettings {
  isBookingEnabled: boolean;
  isPaymentEnabled: boolean;
  isCouponSystemActive: boolean;
  emergencyAlertMessage?: string;
  globalMaintenanceMode: boolean;
}

export interface TourPackage {
  title: string;
  duration: string;
  destinations: string[];
  price: number;
  image: string;
  description: string;
}

export interface Promotion {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
}

export interface Review {
  hotelId: string;
  userId: string;
  authorName: string;
  rating: number;
  text: string;
  title: string;
  createdAt: Date;
}
