
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { TourPackage } from '@/lib/types';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { TourPackageUploadSchema, type TourPackageUploadData } from '../schemas';

/**
 * @fileOverview Production Tour Package Actions.
 * Normalizes headers and ensures robust CSV image processing.
 */

export async function bulkUploadTourPackages(data: any[]) {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
    return { success: false, message: error || "Admin SDK not initialized" };
  }

  try {
    const chunkSize = 400;
    let processedCount = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const batch = adminDb.batch();

      for (const rawRow of chunk) {
        // Normalize keys to lowercase to handle CSV headers like "Image", "IMAGE", etc.
        const normalizedRow: any = {};
        Object.keys(rawRow).forEach(key => {
          normalizedRow[key.toLowerCase()] = rawRow[key];
        });

        const validation = TourPackageUploadSchema.safeParse(normalizedRow);
        if (!validation.success) {
          console.warn(`Skipping invalid row: ${normalizedRow.title || 'Untitled'}`, validation.error.message);
          continue; 
        }

        const pkg = validation.data;
        const packageId = slugify(pkg.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
        const packageRef = adminDb.collection('tourPackages').doc(packageId);

        let itinerary = [];
        try { itinerary = pkg.itinerary ? (typeof pkg.itinerary === 'string' ? JSON.parse(pkg.itinerary) : pkg.itinerary) : []; } catch (e) { itinerary = []; }
        
        let hotels = [];
        if (pkg.hotels) {
          try { hotels = typeof pkg.hotels === 'string' ? JSON.parse(pkg.hotels) : pkg.hotels; } catch (e) { hotels = []; }
        }

        const totalCost = pkg.price + (pkg.price * (pkg.gst / 100));

        const finalDoc: any = {
          id: packageId,
          title: pkg.title || '',
          duration: pkg.duration || '',
          destinations: pkg.destinations ? (Array.isArray(pkg.destinations) ? pkg.destinations : pkg.destinations.split(',').map(d => d.trim()).filter(Boolean)) : [],
          price: pkg.price || 0,
          gst: pkg.gst || 0,
          totalCost: totalCost || 0,
          image: pkg.image || 'hero',
          description: pkg.description || '',
          persons: pkg.persons || 2,
          rooms: pkg.rooms || 1,
          cabType: pkg.cabType || 'Sedan',
          travelDate: pkg.travelDate || '',
          itinerary: itinerary,
          hotels: hotels,
          inclusions: pkg.inclusions ? (Array.isArray(pkg.inclusions) ? pkg.inclusions : pkg.inclusions.split(',').map(i => i.trim()).filter(Boolean)) : [],
          exclusions: pkg.exclusions ? (Array.isArray(pkg.exclusions) ? pkg.exclusions : pkg.exclusions.split(',').map(e => e.trim()).filter(Boolean)) : [],
          policies: {
            tcs: pkg.policy_tcs || 'As per govt norms',
            cancellation: pkg.policy_cancellation || 'Standard T&C apply',
            payment: pkg.policy_payment || 'Advance required',
            terms: pkg.policy_terms || 'Standard terms apply'
          }
        };

        batch.set(packageRef, finalDoc);
        processedCount++;
      }

      await batch.commit();
    }

    revalidatePath('/tour-packages');
    revalidatePath('/');
    
    return { success: true, message: `Successfully synchronized ${processedCount} travel itineraries.` };

  } catch (e: any) {
    console.error("Bulk upload failure:", e);
    return { success: false, message: e.message || 'Cloud synchronization failed.' };
  }
}

export async function saveTourPackageAction(packageId: string, data: any) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Admin SDK not initialized" };

    try {
        const packageRef = adminDb.collection('tourPackages').doc(packageId);
        const sanitizedData = JSON.parse(JSON.stringify(data));
        await packageRef.set(sanitizedData, { merge: true });
        revalidatePath('/tour-packages');
        revalidatePath(`/tour-packages/${packageId}`);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function deleteTourPackageAction(packageId: string) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Admin SDK not initialized" };

    try {
        await adminDb.collection('tourPackages').doc(packageId).delete();
        revalidatePath('/tour-packages');
        revalidatePath('/');
        return { success: true, message: 'Expedition has been permanently removed.' };
    } catch (e: any) {
        console.error("Delete failure:", e);
        return { success: false, message: e.message || 'Failed to remove itinerary.' };
    }
}
