
import { Hotel, Room, City, TourPackage, Review } from './types';

type WithId<T> = T & { id: string };

export const dummyCities: City[] = [
  { id: 'nainital', name: 'Nainital', image: 'city-nainital' },
  { id: 'mussoorie', name: 'Mussoorie', image: 'city-mussoorie' },
  { id: 'rishikesh', name: 'Rishikesh', image: 'city-rishikesh' },
  { id: 'haridwar', name: 'Haridwar', image: 'city-haridwar' },
  { id: 'auli', name: 'Auli', image: 'city-auli' },
  { id: 'jim-corbett', name: 'Jim Corbett', image: 'city-jim-corbett' },
];

export const dummyHotels: WithId<Hotel>[] = [
  {
    id: 'the-naini-retreat',
    name: 'The Naini Retreat',
    city: 'Nainital',
    description: 'A charming hotel offering panoramic views of the Naini Lake.',
    images: ['hotel-1-1'],
    amenities: ['wifi', 'restaurant', 'spa', 'mountain-view'],
    rating: 4.8,
    minPrice: 8000,
    discount: 15,
    mountainSafetyScore: 92,
    landslideRisk: 'Low',
    roadCondition: 'Smooth asphalt',
    networkJio: true,
    networkAirtel: true,
    networkBsnl: false,
    isSnowFriendly: true,
    isElderlySafe: true,
    hasPowerBackup: true,
    nearestAtmKm: 0.5,
    cabFareToCenter: 150,
    balconyWorthIt: true,
    isVerifiedPahadiHost: true
  },
  {
    id: 'jw-marriott-mussoorie',
    name: 'JW Marriott Mussoorie Walnut Grove',
    city: 'Mussoorie',
    description: 'Nestled amidst the serene Himalayas, this 5-star hotel offers a luxurious retreat.',
    images: ['hotel-5-1'],
    amenities: ['wifi', 'restaurant', 'pool', 'spa'],
    rating: 4.9,
    minPrice: 25000,
    discount: 0,
    mountainSafetyScore: 95,
    landslideRisk: 'Low',
    roadCondition: 'Main highway access',
    networkJio: true,
    networkAirtel: true,
    networkBsnl: true,
    isSnowFriendly: true,
    isElderlySafe: true,
    hasPowerBackup: true,
    nearestAtmKm: 1,
    cabFareToCenter: 400,
    balconyWorthIt: true
  },
  {
    id: 'aloha-on-the-ganges',
    name: 'Aloha on the Ganges',
    city: 'Rishikesh',
    description: 'Located right on the banks of the Ganges River.',
    images: ['hotel-10-1'],
    amenities: ['wifi', 'restaurant', 'spa', 'river-view'],
    rating: 4.6,
    minPrice: 10000,
    discount: 10,
    mountainSafetyScore: 88,
    landslideRisk: 'Low',
    roadCondition: 'Good city roads',
    networkJio: true,
    networkAirtel: true,
    networkBsnl: false,
    isSnowFriendly: false,
    isElderlySafe: true,
    hasPowerBackup: true,
    nearestAtmKm: 2,
    cabFareToCenter: 200,
    balconyWorthIt: true
  }
];

export const dummyRooms: WithId<Room>[] = [
  { id: 'nr-std', hotelId: 'the-naini-retreat', type: 'Standard', price: 8000, capacity: 2, totalRooms: 10 },
  { id: 'jw-std', hotelId: 'jw-marriott-mussoorie', type: 'Standard', price: 25000, capacity: 2, totalRooms: 20 },
  { id: 'ag-std', hotelId: 'aloha-on-the-ganges', type: 'Standard', price: 10000, capacity: 2, totalRooms: 15 },
];

export const dummyTourPackages: WithId<TourPackage>[] = [
  {
    id: 'amazing-uttarakhand',
    title: 'Amazing Uttarakhand Tour',
    duration: '6 Nights / 7 Days',
    destinations: ['Haridwar', 'Mussoorie', 'Rishikesh'],
    price: 18000,
    image: 'tour-amazing-uttarakhand',
    description: 'Explore the queen of hills Mussoorie and spiritual city Rishikesh.'
  }
];

export const dummyReviews: WithId<Review>[] = [
  {
    id: 'review-1',
    hotelId: 'the-naini-retreat',
    userId: 'user-123',
    authorName: 'Ravi Verma',
    rating: 5,
    title: 'An unforgettable stay!',
    text: 'The view of Naini Lake from our room was breathtaking.',
    createdAt: new Date('2024-05-15'),
  }
];
