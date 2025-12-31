
import type { Hotel, Room, City, Booking } from './types';

const roomsData: Room[] = [
  { id: 'r1', type: 'Standard', price: 3000, capacity: 2, totalRooms: 10 },
  { id: 'r2', type: 'Deluxe', price: 5000, capacity: 2, totalRooms: 5 },
  { id: 'r3', type: 'Suite', price: 8000, capacity: 4, totalRooms: 3 },
];

let hotelsData: Hotel[] = [
  // Nainital (4)
  {
    id: '1',
    slug: 'the-naini-retreat',
    name: 'The Naini Retreat',
    city: 'Nainital',
    description: 'Perched atop the Ayarpatta hill, The Naini Retreat offers a breathtaking view of the Naini Lake. A palace-turned-hotel, it combines historical architecture with modern luxury.',
    images: ['hotel-1-1', 'hotel-1-2', 'hotel-1-3'],
    amenities: ['wifi', 'spa', 'restaurant', 'bar', 'parking'],
    rating: 4.8,
    rooms: roomsData,
  },
  {
    id: '2',
    slug: 'shervani-hilltop',
    name: 'Shervani Hilltop',
    city: 'Nainital',
    description: 'Nestled amidst a lush green landscape, Shervani Hilltop is a serene retreat with stunning views and cozy cottages.',
    images: ['hotel-2-1', 'hotel-2-2'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'garden'],
    rating: 4.5,
    rooms: roomsData,
  },
  {
    id: '3',
    slug: 'the-manu-maharani',
    name: 'The Manu Maharani',
    city: 'Nainital',
    description: 'A luxurious hotel offering panoramic views of the Naini Valley and the surrounding peaks, known for its exceptional service.',
    images: ['hotel-3-1'],
    amenities: ['wifi', 'spa', 'gym', 'restaurant', 'bar'],
    rating: 4.7,
    rooms: roomsData,
  },
  {
    id: '4',
    slug: 'vikram-vintage-inn',
    name: 'Vikram Vintage Inn',
    city: 'Nainital',
    description: 'A charming inn with a vintage feel, offering a peaceful stay away from the city crowd.',
    images: ['hotel-4-1'],
    amenities: ['wifi', 'restaurant', 'parking', 'game-room'],
    rating: 4.3,
    rooms: roomsData,
  },
  // Mussoorie (4)
  {
    id: '5',
    slug: 'jw-marriott-mussoorie',
    name: 'JW Marriott Mussoorie Walnut Grove',
    city: 'Mussoorie',
    description: 'A five-star resort set in the heart of the Himalayas, offering unparalleled luxury, a serene spa, and multiple fine dining options.',
    images: ['hotel-5-1', 'hotel-5-2'],
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar'],
    rating: 4.9,
    rooms: roomsData,
  },
  {
    id: '6',
    slug: 'jaypee-residency-manor',
    name: 'Jaypee Residency Manor',
    city: 'Mussoorie',
    description: 'Sitting on a unique hilltop, this hotel offers a 360-degree panoramic view of the mighty Himalayas.',
    images: ['hotel-6-1'],
    amenities: ['wifi', 'pool', 'spa', 'restaurant', 'bar'],
    rating: 4.6,
    rooms: roomsData,
  },
  {
    id: '7',
    slug: 'welcomhotel-the-savoy',
    name: 'Welcomhotel The Savoy',
    city: 'Mussoorie',
    description: 'An elegant and historic hotel that has been a landmark in Mussoorie for over a century, exuding old-world charm.',
    images: ['hotel-7-1'],
    amenities: ['wifi', 'spa', 'restaurant', 'bar', 'heritage'],
    rating: 4.8,
    rooms: roomsData,
  },
  {
    id: '8',
    slug: 'rokeby-manor',
    name: 'Rokeby Manor',
    city: 'Mussoorie',
    description: 'A quaint English-style manor offering a cozy and intimate experience with classic decor and stunning valley views.',
    images: ['hotel-8-1'],
    amenities: ['wifi', 'restaurant', 'library', 'spa'],
    rating: 4.7,
    rooms: roomsData,
  },
  // Rishikesh (4)
  {
    id: '9',
    slug: 'ananda-in-the-himalayas',
    name: 'Ananda in the Himalayas',
    city: 'Rishikesh',
    description: 'A world-renowned luxury spa resort, offering traditional wellness practices in a majestic Himalayan setting.',
    images: ['hotel-9-1', 'hotel-9-2'],
    amenities: ['wifi', 'spa', 'pool', 'yoga', 'restaurant'],
    rating: 5.0,
    rooms: roomsData,
  },
  {
    id: '10',
    slug: 'aloha-on-the-ganges',
    name: 'Aloha on the Ganges',
    city: 'Rishikesh',
    description: 'Located right on the banks of the Ganges River, this resort is a perfect spot for relaxation and spiritual rejuvenation.',
    images: ['hotel-10-1'],
    amenities: ['wifi', 'pool', 'spa', 'yoga', 'river-view'],
    rating: 4.6,
    rooms: roomsData,
  },
  {
    id: '11',
    slug: 'taj-rishikesh-resort-spa',
    name: 'Taj Rishikesh Resort & Spa',
    city: 'Rishikesh',
    description: 'A hideaway resort built on a cliffside, offering stunning views of the Ganges and the surrounding mountains.',
    images: ['hotel-11-1'],
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant'],
    rating: 4.9,
    rooms: roomsData,
  },
  {
    id: '12',
    slug: 'the-roseate-ganges',
    name: 'The Roseate Ganges',
    city: 'Rishikesh',
    description: 'An exquisite luxury retreat on the banks of the river Ganga, with avant-garde villas and serene meditation spots.',
    images: ['hotel-12-1'],
    amenities: ['wifi', 'pool', 'spa', 'restaurant', 'yoga'],
    rating: 4.8,
    rooms: roomsData,
  },
  // Haridwar (4)
  {
    id: '13',
    slug: 'haveli-hari-ganga',
    name: 'Haveli Hari Ganga',
    city: 'Haridwar',
    description: 'A beautiful heritage haveli on the banks of the Ganga, featuring its own private bathing ghat.',
    images: ['hotel-13-1'],
    amenities: ['wifi', 'restaurant', 'yoga', 'ghat', 'heritage'],
    rating: 4.5,
    rooms: roomsData,
  },
  {
    id: '14',
    slug: 'aalia-on-the-ganges',
    name: 'Aalia on the Ganges',
    city: 'Haridwar',
    description: 'A luxurious resort offering opulent villas, a tranquil spa, and a host of adventure activities.',
    images: ['hotel-14-1'],
    amenities: ['wifi', 'pool', 'spa', 'adventure', 'restaurant'],
    rating: 4.7,
    rooms: roomsData,
  },
  {
    id: '15',
    slug: 'the-grand-alova',
    name: 'The Grand Alova',
    city: 'Haridwar',
    description: 'A modern hotel offering comfortable stays and easy access to Haridwar\'s main attractions.',
    images: ['hotel-15-1'],
    amenities: ['wifi', 'restaurant', 'parking', 'ac'],
    rating: 4.2,
    rooms: roomsData,
  },
  {
    id: '16',
    slug: 'ganga-lahari',
    name: 'Ganga Lahari',
    city: 'Haridwar',
    description: 'Located at Har-ki-Pauri, this hotel offers direct views of the evening Ganga Aarti from its rooms.',
    images: ['hotel-16-1'],
    amenities: ['wifi', 'restaurant', 'ghat', 'river-view'],
    rating: 4.6,
    rooms: roomsData,
  },
  // Auli (3)
  {
    id: '17',
    slug: 'clifftop-club',
    name: 'Clifftop Club',
    city: 'Auli',
    description: 'India\'s second-highest resort, offering unparalleled views of the snow-capped Himalayas and direct access to ski slopes.',
    images: ['hotel-17-1', 'hotel-17-2'],
    amenities: ['wifi', 'restaurant', 'skiing', 'mountain-view'],
    rating: 4.4,
    rooms: roomsData,
  },
  {
    id: '18',
    slug: 'the-royal-village',
    name: 'The Royal Village',
    city: 'Auli',
    description: 'Experience a rustic stay in cozy cottages with stunning views of Nanda Devi peak.',
    images: ['hotel-18-1'],
    amenities: ['restaurant', 'bonfire', 'mountain-view'],
    rating: 4.1,
    rooms: roomsData,
  },
  {
    id: '19',
    slug: 'blue-poppy-resorts',
    name: 'Blue Poppy Resorts',
    city: 'Auli',
    description: 'A comfortable resort offering guided treks and adventure activities in the beautiful meadows of Auli.',
    images: ['hotel-19-1'],
    amenities: ['restaurant', 'trekking', 'adventure'],
    rating: 4.0,
    rooms: roomsData,
  },
  // Jim Corbett (3)
  {
    id: '20',
    slug: 'aahana-the-corbett-wilderness',
    name: 'Aahana The Corbett Wilderness',
    city: 'Jim Corbett',
    description: 'An eco-friendly luxury resort known for its lush green surroundings and proximity to the Corbett National Park.',
    images: ['hotel-20-1', 'hotel-20-2'],
    amenities: ['wifi', 'pool', 'spa', 'safari', 'restaurant'],
    rating: 4.8,
    rooms: roomsData,
  },
  {
    id: '21',
    slug: 'the-riverview-retreat',
    name: 'The Riverview Retreat',
    city: 'Jim Corbett',
    description: 'A sprawling resort by the Kosi river, offering a perfect blend of nature and luxury.',
    images: ['hotel-21-1'],
    amenities: ['wifi', 'pool', 'restaurant', 'river-view', 'safari'],
    rating: 4.5,
    rooms: roomsData,
  },
  {
    id: '22',
    slug: 'namah-resort',
    name: 'Namah Resort',
    city: 'Jim Corbett',
    description: 'A premium resort offering modern amenities, fine dining, and curated wildlife experiences.',
    images: ['hotel-22-1', 'hotel-22-2', 'hotel-22-3'],
    amenities: ['wifi', 'pool', 'gym', 'spa', 'safari'],
    rating: 4.7,
    rooms: roomsData,
  },
];

const citiesData: City[] = [
  { name: 'Nainital', image: 'city-nainital' },
  { name: 'Mussoorie', image: 'city-mussoorie' },
  { name: 'Rishikesh', image: 'city-rishikesh' },
  { name: 'Haridwar', image: 'city-haridwar' },
  { name: 'Auli', image: 'city-auli' },
  { name: 'Jim Corbett', image: 'city-jim-corbett' },
];

let bookingsData: Booking[] = [
    {
      id: 'b1',
      hotelName: 'The Naini Retreat',
      hotelCity: 'Nainital',
      hotelImage: 'hotel-1-1',
      roomType: 'Deluxe',
      checkIn: '2024-08-10',
      checkOut: '2024-08-12',
      guests: 2,
      totalPrice: 10000,
      status: 'Confirmed',
    },
    {
      id: 'b2',
      hotelName: 'JW Marriott Mussoorie Walnut Grove',
      hotelCity: 'Mussoorie',
      hotelImage: 'hotel-5-1',
      roomType: 'Suite',
      checkIn: '2024-09-05',
      checkOut: '2024-09-10',
      guests: 2,
      totalPrice: 40000,
      status: 'Confirmed',
    },
    {
      id: 'b3',
      hotelName: 'Aahana The Corbett Wilderness',
      hotelCity: 'Jim Corbett',
      hotelImage: 'hotel-20-1',
      roomType: 'Standard',
      checkIn: '2024-07-20',
      checkOut: '2024-07-22',
      guests: 2,
      totalPrice: 6000,
      status: 'Cancelled',
    },
  ];

// --- Data Access Functions ---

export function getHotels(city?: string): Hotel[] {
  if (city) {
    return hotelsData.filter((hotel) => hotel.city.toLowerCase() === city.toLowerCase());
  }
  return hotelsData;
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotelsData.find((hotel) => hotel.slug === slug);
}

export function getCities(): City[] {
  return citiesData;
}

export function getBookings(): Booking[] {
    return bookingsData;
}

export function getBookingById(id: string): Booking | undefined {
    return bookingsData.find((booking) => booking.id === id);
}

export function updateBookingStatus(id: string, status: 'Confirmed' | 'Cancelled' | 'Pending'): Booking | undefined {
    const bookingIndex = bookingsData.findIndex((booking) => booking.id === id);
    if (bookingIndex !== -1) {
        bookingsData[bookingIndex].status = status;
        return bookingsData[bookingIndex];
    }
    return undefined;
}

export function addHotel(hotel: Omit<Hotel, 'id' | 'slug'>): Hotel {
    const newHotel: Hotel = {
        ...hotel,
        id: (hotelsData.length + 1).toString(),
        slug: hotel.name.toLowerCase().replace(/\s+/g, '-'),
    };
    hotelsData.unshift(newHotel);
    return newHotel;
}
