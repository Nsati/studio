
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { TourPackage } from '@/lib/types';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { TourPackageUploadSchema, type TourPackageUploadData } from '../schemas';

/**
 * @fileOverview Production Tour Package Actions.
 * Hardened with batch chunking to handle large datasets without crashing.
 */

export async function bulkUploadTourPackages(data: TourPackageUploadData[]) {
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

      for (const row of chunk) {
        const validation = TourPackageUploadSchema.safeParse(row);
        if (!validation.success) {
          console.warn(`Skipping invalid row: ${row.title}`, validation.error.message);
          continue; 
        }

        const pkg = validation.data;
        const packageId = slugify(pkg.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
        const packageRef = adminDb.collection('tourPackages').doc(packageId);

        let itinerary = [];
        try { itinerary = JSON.parse(pkg.itinerary); } catch (e) { itinerary = []; }
        
        let hotels = [];
        if (pkg.hotels) {
          try { hotels = JSON.parse(pkg.hotels); } catch (e) { hotels = []; }
        }

        const totalCost = pkg.price + (pkg.price * (pkg.gst / 100));

        const finalDoc: TourPackage = {
          id: packageId,
          title: pkg.title,
          duration: pkg.duration,
          destinations: pkg.destinations.split(',').map(d => d.trim()).filter(Boolean),
          price: pkg.price,
          gst: pkg.gst,
          totalCost,
          image: pkg.image,
          description: pkg.description,
          persons: pkg.persons,
          rooms: pkg.rooms,
          cabType: pkg.cabType,
          travelDate: pkg.travelDate,
          itinerary,
          hotels,
          inclusions: pkg.inclusions.split(',').map(i => i.trim()).filter(Boolean),
          exclusions: pkg.exclusions.split(',').map(e => e.trim()).filter(Boolean),
          policies: {
            tcs: pkg.policy_tcs,
            cancellation: pkg.policy_cancellation,
            payment: pkg.policy_payment,
            terms: pkg.policy_terms
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
        await packageRef.set(data, { merge: true });
        
        revalidatePath('/tour-packages');
        revalidatePath(`/tour-packages/${packageId}`);
        revalidatePath('/');
        
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
