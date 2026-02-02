'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Updates the status of a booking.
 * Since bookings are nested under users, we need both IDs.
 */
export async function updateBookingStatusByAdmin(
  userId: string,
  bookingId: string,
  newStatus: 'CONFIRMED' | 'CANCELLED' | 'PENDING'
) {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
    return { success: false, message: error || 'Admin SDK not initialized' };
  }

  try {
    const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);
    await bookingRef.update({
      status: newStatus,
    });

    revalidatePath('/admin/bookings');
    revalidatePath('/admin');
    
    return { success: true, message: `Booking status updated to ${newStatus}.` };
  } catch (e: any) {
    console.error('Failed to update booking status:', e);
    return { success: false, message: e.message || 'Failed to update status.' };
  }
}

/**
 * Permanently deletes a booking record.
 * @param userId The ID of the user who owns the booking.
 * @param bookingId The unique ID of the booking.
 */
export async function deleteBookingByAdmin(userId: string, bookingId: string) {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
    return { success: false, message: error || 'Admin SDK not initialized' };
  }

  try {
    const bookingRef = adminDb.doc(`users/${userId}/bookings/${bookingId}`);
    await bookingRef.delete();

    revalidatePath('/admin/bookings');
    revalidatePath('/admin');
    
    return { success: true, message: 'Reservation has been permanently purged from the system.' };
  } catch (e: any) {
    console.error('Purge failure:', e);
    return { success: false, message: e.message || 'Failed to delete record.' };
  }
}
