import { Hotel, Room, City } from './types';

export const dummyCities: City[] = [
  { id: 'nainital', name: 'Nainital', image: 'city-nainital' },
  { id: 'mussoorie', name: 'Mussoorie', image: 'city-mussoorie' },
  { id: 'rishikesh', name: 'Rishikesh', image: 'city-rishikesh' },
  { id: 'haridwar', name: 'Haridwar', image: 'city-haridwar' },
  { id: 'auli', name: 'Auli', image: 'city-auli' },
  { id: 'jim-corbett', name: 'Jim Corbett', image: 'city-jim-corbett' },
];

export const dummyHotels: Hotel[] = [
  {
    id: 'the-naini-retreat',
    name: 'The Naini Retreat',
    city: 'Nainital',
    description: 'A charming hotel offering panoramic views of the Naini Lake. Experience colonial heritage and luxury.',
    images: ['hotel-1-1', 'hotel-1-2', 'hotel-1-3'],
    amenities: ['wifi', 'restaurant', 'spa', 'mountain-view', 'parking'],
    rating: 4.8,
  },
  {
    id: 'jw-marriott-mussoorie',
    name: 'JW Marriott Mussoorie Walnut Grove',
    city: 'Mussoorie',
    description: 'Nestled amidst the serene Himalayas, this 5-star hotel offers a luxurious retreat with an indoor pool and spa.',
    images: ['hotel-5-1', 'hotel-5-2'],
    amenities: ['wifi', 'restaurant', 'pool', 'spa', 'gym', 'bar'],
    rating: 4.9,
  },
  {
    id: 'aloha-on-the-ganges',
    name: 'Aloha on the Ganges',
    city: 'Rishikesh',
    description: 'Located right on the banks of the Ganges River, Aloha offers a tranquil setting with spectacular views.',
    images: ['hotel-10-1'],
    amenities: ['wifi', 'restaurant', 'spa', 'river-view', 'yoga'],
    rating: 4.6,
  },
  {
    id: 'aahana-resort',
    name: 'Aahana The Corbett Wilderness',
    city: 'Jim Corbett',
    description: 'An award-winning, eco-friendly resort offering a luxurious stay at the threshold of the Corbett Tiger Reserve.',
    images: ['hotel-20-1', 'hotel-20-2'],
    amenities: ['wifi', 'restaurant', 'pool', 'spa', 'safari'],
    rating: 4.7,
  },
    {
    id: 'shervani-hilltop',
    name: 'Shervani Hilltop',
    city: 'Nainital',
    description: 'A beautiful garden resort located away from the hustle and bustle of the town, offering a peaceful retreat.',
    images: ['hotel-2-1', 'hotel-2-2'],
    amenities: ['wifi', 'restaurant', 'garden', 'parking', 'bar'],
    rating: 4.4,
  },
  {
    id: 'the-savoy',
    name: 'Welcomhotel by ITC, The Savoy',
    city: 'Mussoorie',
    description: 'An elegant and historic hotel that has been a landmark in Mussoorie for over a century, offering a glimpse into the colonial era.',
    images: ['hotel-7-1'],
    amenities: ['wifi', 'restaurant', 'bar', 'heritage', 'spa', 'gym'],
    rating: 4.5,
  },
];

export const dummyRooms: Room[] = [
  // The Naini Retreat
  { id: 'nr-std', hotelId: 'the-naini-retreat', type: 'Standard', price: 8000, capacity: 2, totalRooms: 10 },
  { id: 'nr-dlx', hotelId: 'the-naini-retreat', type: 'Deluxe', price: 12000, capacity: 2, totalRooms: 8 },
  { id: 'nr-ste', hotelId: 'the-naini-retreat', type: 'Suite', price: 18000, capacity: 4, totalRooms: 4 },
  // JW Marriott
  { id: 'jw-std', hotelId: 'jw-marriott-mussoorie', type: 'Standard', price: 25000, capacity: 2, totalRooms: 20 },
  { id: 'jw-dlx', hotelId: 'jw-marriott-mussoorie', type: 'Deluxe', price: 35000, capacity: 3, totalRooms: 15 },
  { id: 'jw-ste', hotelId: 'jw-marriott-mussoorie', type: 'Suite', price: 50000, capacity: 4, totalRooms: 5 },
  // Aloha on the Ganges
  { id: 'ag-std', hotelId: 'aloha-on-the-ganges', type: 'Standard', price: 10000, capacity: 2, totalRooms: 15 },
  { id: 'ag-dlx', hotelId: 'aloha-on-the-ganges', type: 'Deluxe', price: 15000, capacity: 2, totalRooms: 10 },
  // Aahana Resort
  { id: 'ah-std', hotelId: 'aahana-resort', type: 'Standard', price: 18000, capacity: 2, totalRooms: 12 },
  { id: 'ah-dlx', hotelId: 'aahana-resort', type: 'Deluxe', price: 24000, capacity: 3, totalRooms: 10 },
  // Shervani Hilltop
  { id: 'sh-std', hotelId: 'shervani-hilltop', type: 'Standard', price: 7000, capacity: 2, totalRooms: 20 },
  { id: 'sh-dlx', hotelId: 'shervani-hilltop', type: 'Deluxe', price: 9500, capacity: 2, totalRooms: 10 },
  // The Savoy
  { id: 'sv-std', hotelId: 'the-savoy', type: 'Standard', price: 16000, capacity: 2, totalRooms: 25 },
  { id: 'sv-ste', hotelId: 'the-savoy', type: 'Suite', price: 28000, capacity: 4, totalRooms: 10 },
];
