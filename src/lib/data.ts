import type { Hotel, Room, City, Booking, User } from './types';
import placeholderImageData from './placeholder-images.json';
import type { ImagePlaceholder } from './placeholder-images';
import { areIntervalsOverlapping } from 'date-fns';

// This is a placeholder for a real data source.
let hotelsData: Hotel[] = [
  {
    id: 'h1',
    slug: 'the-naini-retreat',
    name: 'The Naini Retreat',
    city: 'Nainital',
    description: 'The Naini Retreat, one of the finest hotels in Nainital, is a charming heritage hotel that was once the residence of the Maharaja of Pilibhit. Nestled in the lap of the Himalayas, this palatial building offers a stunning view of the Naini Lake and the surrounding lush green landscape.',
    images: ['hotel-1-1', 'hotel-1-2', 'hotel-1-3'],
    amenities: ['wifi', 'parking', 'restaurant', 'bar', 'spa', 'mountain-view'],
    rating: 4.8,
    rooms: [
      { id: 'r1', hotelId: 'h1', type: 'Deluxe', price: 8000, capacity: 2, totalRooms: 2 },
      { id: 'r2', hotelId: 'h1', type: 'Suite', price: 15000, capacity: 4, totalRooms: 1 },
    ],
  },
  {
    id: 'h2',
    slug: 'shervani-hilltop',
    name: 'Shervani Hilltop',
    city: 'Nainital',
    description: 'Shervani Hilltop, Nainital is a 4-star resort located in the serene and beautiful environs of Nainital. Spread over the lush green mountainside, the resort is a perfect retreat for travelers looking for a peaceful and luxurious stay.',
    images: ['hotel-2-1', 'hotel-2-2'],
    amenities: ['wifi', 'parking', 'restaurant', 'pool', 'garden'],
    rating: 4.5,
    rooms: [
      { id: 'r3', hotelId: 'h2', type: 'Standard', price: 6000, capacity: 2, totalRooms: 20 },
      { id: 'r4', hotelId: 'h2', type: 'Deluxe', price: 9000, capacity: 3, totalRooms: 15 },
    ],
  },
  {
    id: 'h3',
    slug: 'the-manu-maharani',
    name: 'The Manu Maharani',
    city: 'Nainital',
    description: 'The Manu Maharani is a premium hotel in Nainital, offering breathtaking views of the Naini Lake and the valley. With its contemporary architecture and warm hospitality, it promises a memorable stay for both leisure and business travelers.',
    images: ['hotel-3-1'],
    amenities: ['wifi', 'restaurant', 'bar', 'gym', 'spa'],
    rating: 4.9,
    rooms: [
      { id: 'r5', hotelId: 'h3', type: 'Deluxe', price: 12000, capacity: 2, totalRooms: 25 },
      { id: 'r6', hotelId: 'h3', type: 'Suite', price: 20000, capacity: 4, totalRooms: 10 },
    ],
  },
  {
    id: 'h4',
    slug: 'vikram-vintage-inn',
    name: 'Vikram Vintage Inn',
    city: 'Nainital',
    description: 'Experience the charm of a bygone era at Vikram Vintage Inn, a colonial-style hotel that exudes old-world elegance. Surrounded by deodar forests, it provides a tranquil escape from the hustle and bustle of city life.',
    images: ['hotel-4-1'],
    amenities: ['parking', 'restaurant', 'garden', 'heritage'],
    rating: 4.3,
    rooms: [
      { id: 'r7', hotelId: 'h4', type: 'Standard', price: 5000, capacity: 2, totalRooms: 18 },
    ],
  },
  {
    id: 'h5',
    slug: 'jw-marriott-mussoorie',
    name: 'JW Marriott Mussoorie Walnut Grove Resort & Spa',
    city: 'Mussoorie',
    description: 'Nestled amidst the serene Himalayan ranges, JW Marriott Mussoorie Walnut Grove Resort & Spa is a luxury 5-star hotel offering a perfect blend of modern comfort and natural beauty. Enjoy the stunning valley views and world-class amenities.',
    images: ['hotel-5-1', 'hotel-5-2'],
    amenities: ['wifi', 'spa', 'pool', 'gym', 'restaurant', 'bar', 'mountain-view'],
    rating: 4.9,
    rooms: [
        { id: 'r8', hotelId: 'h5', type: 'Deluxe', price: 25000, capacity: 2, totalRooms: 50 },
        { id: 'r9', hotelId: 'h5', type: 'Suite', price: 45000, capacity: 4, totalRooms: 15 },
    ]
  },
  {
    id: 'h6',
    slug: 'jaypee-residency-manor',
    name: 'Jaypee Residency Manor',
    city: 'Mussoorie',
    description: 'Perched on a hilltop, Jaypee Residency Manor offers a 360-degree panoramic view of the mighty Himalayas. This elegant hotel is an ideal destination for a relaxing and rejuvenating holiday.',
    images: ['hotel-6-1'],
    amenities: ['wifi', 'parking', 'restaurant', 'spa', 'pool'],
    rating: 4.6,
    rooms: [
        { id: 'r10', hotelId: 'h6', type: 'Standard', price: 18000, capacity: 2, totalRooms: 30 },
        { id: 'r11', hotelId: 'h6', type: 'Deluxe', price: 22000, capacity: 3, totalRooms: 20 },
    ]
  },
  {
    id: 'h7',
    slug: 'welcomhotel-the-savoy',
    name: 'Welcomhotel by ITC Hotels, The Savoy',
    city: 'Mussoorie',
    description: 'An elegant and historic hotel, The Savoy is a wonderful mix of old-world charm and new-age conveniences. Experience the grandeur of English Gothic architecture and enjoy a luxurious stay.',
    images: ['hotel-7-1'],
    amenities: ['wifi', 'heritage', 'restaurant', 'bar', 'spa'],
    rating: 4.7,
    rooms: [
        { id: 'r12', hotelId: 'h7', type: 'Standard', price: 20000, capacity: 2, totalRooms: 40 },
    ]
  },
  {
    id: 'h8',
    slug: 'rokeby-manor',
    name: 'Rokeby Manor',
    city: 'Mussoorie',
    description: 'A colonial-era estate, Rokeby Manor is a boutique hotel that has been restored to its original 19th-century character. It offers a cozy and intimate atmosphere with personalized service.',
    images: ['hotel-8-1'],
    amenities: ['wifi', 'restaurant', 'library', 'garden'],
    rating: 4.8,
    rooms: [
        { id: 'r13', hotelId: 'h8', type: 'Deluxe', price: 16000, capacity: 2, totalRooms: 12 },
    ]
  },
  {
    id: 'h9',
    slug: 'ananda-in-the-himalayas',
    name: 'Ananda in The Himalayas',
    city: 'Rishikesh',
    description: 'A luxury destination spa resort situated at the Himalayan foothills. Ananda is dedicated to restoring balance and harmonizing energy through a holistic approach, incorporating yoga, meditation, and Ayurveda.',
    images: ['hotel-9-1', 'hotel-9-2'],
    amenities: ['spa', 'yoga', 'pool', 'gym', 'restaurant'],
    rating: 5.0,
    rooms: [
        { id: 'r14', hotelId: 'h9', type: 'Suite', price: 55000, capacity: 2, totalRooms: 20 },
    ]
  },
  {
    id: 'h10',
    slug: 'aloha-on-the-ganges',
    name: 'Aloha on the Ganges',
    city: 'Rishikesh',
    description: 'Located right on the banks of the river Ganges, Aloha on the Ganges is a resort that offers a tranquil and spiritual experience. It\'s the perfect place to relax, rejuvenate, and connect with nature.',
    images: ['hotel-10-1'],
    amenities: ['wifi', 'restaurant', 'pool', 'spa', 'river-view'],
    rating: 4.5,
    rooms: [
        { id: 'r15', hotelId: 'h10', type: 'Standard', price: 7000, capacity: 2, totalRooms: 30 },
        { id: 'r16', hotelId: 'h10', type: 'Deluxe', price: 10000, capacity: 3, totalRooms: 25 },
    ]
  },
  {
    id: 'h11',
    slug: 'taj-rishikesh-resort-spa',
    name: 'Taj Rishikesh Resort & Spa, Uttarakhand',
    city: 'Rishikesh',
    description: 'A serene hideaway on the banks of the majestic Ganga, Taj Rishikesh Resort & Spa is a luxury retreat that offers stunning views and a tranquil atmosphere. It is an architectural tribute to the Garhwal region.',
    images: ['hotel-11-1'],
    amenities: ['wifi', 'spa', 'pool', 'restaurant', 'bar'],
    rating: 4.9,
    rooms: [
        { id: 'r17', hotelId: 'h11', type: 'Deluxe', price: 35000, capacity: 2, totalRooms: 30 },
    ]
  },
  {
    id: 'h12',
    slug: 'the-roseate-ganges',
    name: 'The Roseate Ganges',
    city: 'Rishikesh',
    description: 'An exquisite luxury retreat on the banks of the Ganges, The Roseate Ganges offers an unparalleled experience of nature, spirituality, and hospitality. The villas are designed to provide a private and serene stay.',
    images: ['hotel-12-1'],
    amenities: ['wifi', 'spa', 'pool', 'restaurant'],
    rating: 4.8,
    rooms: [
        { id: 'r18', hotelId: 'h12', type: 'Suite', price: 40000, capacity: 2, totalRooms: 16 },
    ]
  },
   {
    id: 'h13',
    slug: 'haveli-hari-ganga',
    name: 'Haveli Hari Ganga by Leisure Hotels',
    city: 'Haridwar',
    description: 'A heritage haveli located on the banks of the holy Ganges, Haveli Hari Ganga offers a blend of traditional Indian hospitality and modern comforts. Experience the spiritual essence of Haridwar with a stay at this charming hotel.',
    images: ['hotel-13-1'],
    amenities: ['wifi', 'restaurant', 'heritage', 'ghat'],
    rating: 4.4,
    rooms: [
        { id: 'r19', hotelId: 'h13', type: 'Standard', price: 5500, capacity: 2, totalRooms: 20 },
    ]
  },
  {
    id: 'h14',
    slug: 'aalia-on-the-ganges',
    name: 'Aalia on the Ganges',
    city: 'Haridwar',
    description: 'A luxury resort offering a serene and spiritual experience on the banks of the Ganges. Aalia combines the charm of a forest retreat with the comforts of a 5-star hotel.',
    images: ['hotel-14-1'],
    amenities: ['wifi', 'pool', 'spa', 'restaurant', 'river-view'],
    rating: 4.7,
    rooms: [
        { id: 'r20', hotelId: 'h14', type: 'Deluxe', price: 15000, capacity: 2, totalRooms: 12 },
    ]
  },
  {
    id: 'h15',
    slug: 'the-grand-alova',
    name: 'The Grand Alova',
    city: 'Haridwar',
    description: 'The Grand Alova is a contemporary hotel that offers a comfortable and convenient stay in Haridwar. It is located close to the major attractions of the city, making it an ideal choice for pilgrims and tourists.',
    images: ['hotel-15-1'],
    amenities: ['wifi', 'parking', 'restaurant'],
    rating: 4.2,
    rooms: [
        { id: 'r21', hotelId: 'h15', type: 'Standard', price: 4000, capacity: 2, totalRooms: 25 },
    ]
  },
  {
    id: 'h16',
    slug: 'ganga-lahari',
    name: 'Ganga Lahari',
    city: 'Haridwar',
    description: 'Situated on the banks of the Ganges at Har-ki-Pauri, Ganga Lahari offers a spectacular view of the river and the surrounding temples. The hotel has its own private bathing ghat for a holy dip.',
    images: ['hotel-16-1'],
    amenities: ['wifi', 'restaurant', 'ghat'],
    rating: 4.6,
    rooms: [
        { id: 'r22', hotelId: 'h16', type: 'Deluxe', price: 8000, capacity: 2, totalRooms: 16 },
    ]
  },
  {
    id: 'h17',
    slug: 'clifftop-club',
    name: 'Clifftop Club',
    city: 'Auli',
    description: 'Located at an altitude of over 10,000 feet, Clifftop Club is a luxury ski resort that offers breathtaking views of the snow-clad Himalayas. It is a perfect destination for adventure enthusiasts and nature lovers.',
    images: ['hotel-17-1', 'hotel-17-2'],
    amenities: ['restaurant', 'bar', 'skiing', 'mountain-view'],
    rating: 4.5,
    rooms: [
        { id: 'r23', hotelId: 'h17', type: 'Standard', price: 12000, capacity: 2, totalRooms: 20 },
    ]
  },
  {
    id: 'h18',
    slug: 'the-royal-village',
    name: 'The Royal Village',
    city: 'Auli',
    description: 'Experience the rustic charm of a Himalayan village with a stay at The Royal Village. The resort offers comfortable cottages with modern amenities and stunning views of the surrounding mountains.',
    images: ['hotel-18-1'],
    amenities: ['restaurant', 'garden', 'trekking'],
    rating: 4.3,
    rooms: [
        { id: 'r24', hotelId: 'h18', type: 'Standard', price: 9000, capacity: 2, totalRooms: 15 },
    ]
  },
  {
    id: 'h19',
    slug: 'blue-poppy-resorts',
    name: 'Blue Poppy Resorts',
    city: 'Auli',
    description: 'Named after the rare Himalayan blue poppy, this resort is a paradise for nature lovers. Surrounded by lush greenery and offering panoramic views of the Nanda Devi range, it is an ideal place to unwind.',
    images: ['hotel-19-1'],
    amenities: ['restaurant', 'trekking', 'mountain-view'],
    rating: 4.2,
    rooms: [
        { id: 'r25', hotelId: 'h19', type: 'Deluxe', price: 10000, capacity: 3, totalRooms: 10 },
    ]
  },
  {
    id: 'h20',
    slug: 'aahana-the-corbett-wilderness',
    name: 'Aahana The Corbett Wilderness',
    city: 'Jim Corbett',
    description: 'Aahana is a luxury eco-friendly resort located in the heart of Corbett. Spread over a sprawling 13.5 acres, it offers a perfect blend of nature, wildlife, and luxury. The resort is known for its organic farming and commitment to sustainability.',
    images: ['hotel-20-1', 'hotel-20-2'],
    amenities: ['wifi', 'pool', 'spa', 'restaurant', 'safari'],
    rating: 4.9,
    rooms: [
        { id: 'r26', hotelId: 'h20', type: 'Deluxe', price: 18000, capacity: 2, totalRooms: 24 },
        { id: 'r27', hotelId: 'h20', type: 'Suite', price: 28000, capacity: 4, totalRooms: 8 },
    ]
  },
  {
    id: 'h21',
    slug: 'the-riverview-retreat',
    name: 'The Riverview Retreat',
    city: 'Jim Corbett',
    description: 'A riverside retreat that offers a perfect blend of adventure and relaxation. The resort is spread over a large area on the banks of the Kosi river and offers a range of activities for its guests.',
    images: ['hotel-21-1'],
    amenities: ['wifi', 'pool', 'restaurant', 'river-view', 'safari'],
    rating: 4.6,
    rooms: [
        { id: 'r28', hotelId: 'h21', type: 'Standard', price: 9000, capacity: 2, totalRooms: 30 },
    ]
  },
  {
    id: 'h22',
    slug: 'namah-resort',
    name: 'Namah Resort',
    city: 'Jim Corbett',
    description: 'A luxury resort located on the banks of the Kosi river, Namah offers a perfect blend of comfort and nature. The resort has a contemporary design and offers a range of modern amenities.',
    images: ['hotel-22-1', 'hotel-22-2', 'hotel-22-3'],
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'bar'],
    rating: 4.7,
    rooms: [
        { id: 'r29', hotelId: 'h22', type: 'Deluxe', price: 14000, capacity: 2, totalRooms: 20 },
        { id: 'r30', hotelId: 'h22', type: 'Suite', price: 22000, capacity: 3, totalRooms: 10 },
    ]
  }
];

let bookingsData: Booking[] = [
    {
      id: 'b1',
      hotelId: 'h1',
      userId: 'u1',
      roomId: 'r1',
      roomType: 'Deluxe',
      checkIn: new Date('2024-08-10').toISOString(),
      checkOut: new Date('2024-08-12').toISOString(),
      guests: 2,
      totalPrice: 16000,
      customerName: 'Ankit Sharma',
      customerEmail: 'ankit.sharma@example.com',
    },
    {
        id: 'b2',
        hotelId: 'h1',
        userId: 'u2',
        roomId: 'r1',
        roomType: 'Deluxe',
        checkIn: new Date('2024-08-11').toISOString(),
        checkOut: new Date('2024-08-13').toISOString(),
        guests: 2,
        totalPrice: 16000,
        customerName: 'Priya Singh',
        customerEmail: 'priya.singh@example.com',
      }
];

const citiesData: City[] = [
  { name: 'Nainital', image: 'city-nainital' },
  { name: 'Mussoorie', image: 'city-mussoorie' },
  { name: 'Rishikesh', image: 'city-rishikesh' },
  { name: 'Haridwar', image: 'city-haridwar' },
  { name: 'Auli', image: 'city-auli' },
  { name: 'Jim Corbett', image: 'city-jim-corbett' },
];

let placeholderImages: ImagePlaceholder[] = placeholderImageData.placeholderImages;


// --- CITIES ---
export function getCities(): City[] {
  return citiesData;
}

// --- HOTELS ---
export function getHotels(city?: string): Hotel[] {
  if (city) {
    return hotelsData.filter((hotel) => hotel.city === city);
  }
  return hotelsData;
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotelsData.find((hotel) => hotel.slug === slug);
}

export function getHotelById(id: string): Hotel | undefined {
    return hotelsData.find((hotel) => hotel.id === id);
}

export function addHotel(hotel: Omit<Hotel, 'id' | 'slug'>): Hotel {
    const newHotelId = `h${hotelsData.length + 1}`;
    const newHotel: Hotel = {
        ...hotel,
        id: newHotelId,
        slug: hotel.name.toLowerCase().replace(/\s+/g, '-'),
    };
    newHotel.rooms.forEach(room => room.hotelId = newHotelId);

    // Add new image placeholders.
    // This is a mock; in a real app, you'd get URLs from a CDN.
    hotel.images.forEach((imgId, index) => {
        const newImage: ImagePlaceholder = {
            id: imgId,
            description: `Image ${index + 1} for ${hotel.name}`,
            // We use a generic placeholder image URL here
            imageUrl: 'https://picsum.photos/seed/1/600/400',
            imageHint: 'hotel photo'
        };
        // This is not ideal as it modifies the imported JSON data structure in memory.
        // A proper backend would handle this.
        if (!placeholderImages.find(p => p.id === newImage.id)) {
            placeholderImages.push(newImage);
        }
    });

    hotelsData.unshift(newHotel);
    return newHotel;
}

export function updateHotel(hotelId: string, updatedHotelData: Hotel): Hotel | undefined {
    const hotelIndex = hotelsData.findIndex(h => h.id === hotelId);
    if (hotelIndex === -1) {
        return undefined;
    }

    const updatedHotel = {
        ...updatedHotelData,
        slug: updatedHotelData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    hotelsData[hotelIndex] = updatedHotel;
    return updatedHotel;
}

export function deleteHotel(hotelId: string): boolean {
    const initialLength = hotelsData.length;
    hotelsData = hotelsData.filter(h => h.id !== hotelId);
    return hotelsData.length < initialLength;
}


// --- ROOMS ---
// Add a function to get room by ID, useful for payment dialog.
export function getRoomById(roomId: string): Room | undefined {
    for (const hotel of hotelsData) {
        const room = hotel.rooms.find(r => r.id === roomId);
        if (room) return room;
    }
    return undefined;
}

// --- BOOKINGS ---
export function getBookings(): Booking[] {
    return bookingsData.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
}

export function getBookingsForUser(userId: string): Booking[] {
    return bookingsData
        .filter(b => b.userId === userId)
        .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
}


export function getBookingById(id: string): Booking | undefined {
    return bookingsData.find((b) => b.id === id);
}

export function getBookingsForRoom(roomId: string, checkIn: Date, checkOut: Date): Booking[] {
    return bookingsData.filter(booking => {
        if (booking.roomId !== roomId) {
            return false;
        }
        const bookingInterval = {
            start: new Date(booking.checkIn),
            end: new Date(booking.checkOut),
        };
        const selectedInterval = {
            start: checkIn,
            end: checkOut,
        };
        // The intervals overlap if the start of one is before the end of the other,
        // and the end of one is after the start of the other.
        return areIntervalsOverlapping(bookingInterval, selectedInterval);
    });
}


export function addBooking(bookingDetails: Omit<Booking, 'id'>): Booking {
    const newBooking: Booking = {
        ...bookingDetails,
        id: `b${Date.now()}`,
    };
    bookingsData.push(newBooking);
    return newBooking;
}

// Add hotelId to Room type, which is needed when creating a booking
// without having the full hotel object.
// We'll update the data and types to reflect this.
hotelsData.forEach(hotel => {
    hotel.rooms.forEach(room => {
        if (!('hotelId' in room)) {
            (room as any).hotelId = hotel.id;
        }
    });
});

declare module './types' {
    interface Room {
        hotelId: string;
    }
}
