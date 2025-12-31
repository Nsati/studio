'use client';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  DocumentData,
  Firestore,
} from 'firebase/firestore';
import type { Hotel, Room, City, Booking } from './types';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';

// This is a placeholder for a real city data source.
// In a real app, this might come from a static file or a small collection.
const citiesData: City[] = [
  { name: 'Nainital', image: 'city-nainital' },
  { name: 'Mussoorie', image: 'city-mussoorie' },
  { name: 'Rishikesh', image: 'city-rishikesh' },
  { name: 'Haridwar', image: 'city-haridwar' },
  { name: 'Auli', image: 'city-auli' },
  { name: 'Jim Corbett', image: 'city-jim-corbett' },
];

export function getCities(): City[] {
  return citiesData;
}

// --- HOTELS ---
export async function getHotels(db: Firestore, city?: string): Promise<Hotel[]> {
  let hotelsQuery = query(collection(db, 'hotels'));
  if (city) {
    hotelsQuery = query(collection(db, 'hotels'), where('city', '==', city));
  }

  const snapshot = await getDocs(hotelsQuery);
  if (snapshot.empty) {
    return [];
  }

  const hotelsPromises = snapshot.docs.map(async (hotelDoc) => {
    const hotelData = {
      ...hotelDoc.data(),
      id: hotelDoc.id,
      slug: hotelDoc.data().slug || hotelDoc.id,
    } as Hotel;

    // Fetch rooms for each hotel
    const roomsSnapshot = await getDocs(collection(db, 'hotels', hotelDoc.id, 'rooms'));
    hotelData.rooms = roomsSnapshot.docs.map(roomDoc => ({ ...roomDoc.data(), id: roomDoc.id })) as Room[];
    return hotelData;
  });
  
  const hotels = await Promise.all(hotelsPromises);
  return hotels;
}

export async function getHotelBySlug(db: Firestore, slug: string): Promise<Hotel | undefined> {
    const q = query(collection(db, "hotels"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // Fallback to checking by ID if slug is not found
        const docRefById = doc(db, 'hotels', slug);
        const docSnapById = await getDoc(docRefById);
        if (!docSnapById.exists()) {
          return undefined;
        }
        
        const hotelDataById = { ...docSnapById.data(), id: docSnapById.id, slug: docSnapById.data().slug || docSnapById.id } as Hotel;
        const roomsSnapshotById = await getDocs(collection(db, 'hotels', docSnapById.id, 'rooms'));
        hotelDataById.rooms = roomsSnapshotById.docs.map(roomDoc => ({ ...roomDoc.data(), id: roomDoc.id } as Room));
        return hotelDataById;
    }

    const hotelDoc = querySnapshot.docs[0];
    const hotelData = { ...hotelDoc.data(), id: hotelDoc.id, slug: hotelDoc.data().slug || hotelDoc.id } as Hotel;

    // Fetch rooms
    const roomsSnapshot = await getDocs(collection(db, 'hotels', hotelDoc.id, 'rooms'));
    hotelData.rooms = roomsSnapshot.docs.map(roomDoc => ({ ...roomDoc.data(), id: roomDoc.id } as Room));
    
    return hotelData;
}

export function addHotel(db: Firestore, hotel: Omit<Hotel, 'id' | 'slug'>): Promise<any> {
    const newHotel = {
        ...hotel,
        slug: hotel.name.toLowerCase().replace(/\s+/g, '-'),
        rooms: [], // Rooms will be added as a subcollection, not in the main doc
    };
    const hotelCollection = collection(db, 'hotels');
    const hotelPromise = addDocumentNonBlocking(hotelCollection, newHotel);

    hotelPromise.then(docRef => {
        if(!docRef) return;
        const roomsCollection = collection(db, 'hotels', docRef.id, 'rooms');
        hotel.rooms.forEach(room => {
            addDocumentNonBlocking(roomsCollection, { ...room, hotelId: docRef.id });
        });
    });

    return hotelPromise;
}


// --- BOOKINGS ---
export async function getBookings(db: Firestore, userId: string): Promise<Booking[]> {
    if (!userId) return [];
    const bookingsQuery = query(collection(db, `users/${userId}/bookings`));
    const snapshot = await getDocs(bookingsQuery);
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Booking[];
}

export async function getBookingById(db: Firestore, userId: string, bookingId: string): Promise<Booking | undefined> {
    if (!userId || !bookingId) return undefined;
    const docRef = doc(db, `users/${userId}/bookings`, bookingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Booking;
    }
    return undefined;
}


export function createBooking(db: Firestore, userId: string, bookingData: Omit<Booking, 'id'>) {
    if (!userId) throw new Error("User not authenticated");
    const bookingCollection = collection(db, `users/${userId}/bookings`);
    return addDocumentNonBlocking(bookingCollection, bookingData);
}

export function updateBookingStatus(db: Firestore, userId: string, bookingId: string, status: 'Confirmed' | 'Cancelled' | 'Pending') {
    if (!userId) throw new Error("User not authenticated");
    const docRef = doc(db, `users/${userId}/bookings`, bookingId);
    return updateDocumentNonBlocking(docRef, { status });
}
