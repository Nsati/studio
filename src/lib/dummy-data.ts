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
    isVerifiedPahadiHost: true,
    ecoPractices: { waterSaving: true, plasticFree: true, localSourcing: true },
    safetyInfo: { nearestHospital: 'Nainital District Hospital', policeStation: 'Mallital PS', networkCoverage: 'good' },
    spiritualAmenities: ['silent-zone', 'sunrise-view']
  }
];

export const dummyRooms: WithId<Room>[] = [
  { id: 'nr-std', hotelId: 'the-naini-retreat', type: 'Standard', price: 8000, capacity: 2, totalRooms: 10 },
];

export const dummyTourPackages: WithId<TourPackage>[] = [
  {
    id: 'amazing-uttarakhand',
    title: 'Amazing Uttarakhand Tour',
    duration: '6 Nights / 7 Days',
    destinations: ['Haridwar', 'Mussoorie', 'Rishikesh'],
    price: 18000,
    gst: 5,
    totalCost: 18900,
    image: 'hero',
    description: 'Explore the queen of hills Mussoorie and spiritual city Rishikesh.',
    persons: 2,
    rooms: 1,
    cabType: 'Sedan (Swift Dzire)',
    itinerary: [
      { day: 1, title: 'Arrival in Haridwar', description: 'Check-in and evening Ganga Aarti ceremony.', distance: '220km', travelTime: '5 hrs' },
      { day: 2, title: 'Transfer to Mussoorie', description: 'Scenic drive to the Queen of Hills.', distance: '85km', travelTime: '3 hrs' }
    ],
    hotels: [
      { city: 'Haridwar', hotelName: 'Ganga View', category: '3 Star', roomType: 'Standard', mealPlan: 'Breakfast Only' }
    ],
    inclusions: ['Stay', 'Breakfast', 'Cab', 'Driver', 'Tolls'],
    exclusions: ['Lunch', 'Entry Tickets'],
    policies: {
      tcs: '5% TCS as per govt norms.',
      cancellation: '30 days before: 10% charge.',
      payment: '25% advance to book.',
      terms: 'ID proof is mandatory.'
    }
  }
];

export const dummyReviews: WithId<Review>[] = [];
