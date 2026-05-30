'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { TourPackage } from '@/lib/types';
import slugify from 'slugify';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

/**
 * @fileOverview Production Tour Package Actions.
 * Now includes cache revalidation to ensure frontend updates instantly.
 */

export const TourPackageUploadSchema = z.object({
  title: z.string().min(5),
  duration: z.string().min(3),
  destinations: z.string(), // comma separated
  price: z.coerce.number().min(1),
  gst: z.coerce.number().default(5),
  image: z.string().min(1),
  description: z.string().min(20),
  persons: z.coerce.number().min(1),
  rooms: z.coerce.number().min(1),
  cabType: z.string(),
  travelDate: z.string().optional(),
  itinerary: z.string(), 
  hotels: z.string().optional(),
  inclusions: z.string(), // comma separated
  exclusions: z.string(), // comma separated
  policy_tcs: z.string(),
  policy_cancellation: z.string(),
  policy_payment: z.string(),
  policy_terms: z.string(),
});

export type TourPackageUploadData = z.infer<typeof TourPackageUploadSchema>;

export async function bulkUploadTourPackages(data: TourPackageUploadData[]) {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
    return { success: false, message: error || "Admin SDK not initialized" };
  }

  const batch = adminDb.batch();

  try {
    for (const row of data) {
      const validation = TourPackageUploadSchema.safeParse(row);
      if (!validation.success) {
        throw new Error(`Invalid data for package "${row.title}": ${validation.error.message}`);
      }

      const pkg = validation.data;
      const packageId = slugify(pkg.title, { lower: true, strict: true });
      const packageRef = adminDb.collection('tourPackages').doc(packageId);

      let itinerary = [];
      try { itinerary = JSON.parse(pkg.itinerary); } catch (e) { throw new Error(`Itinerary JSON error in "${pkg.title}"`); }
      
      let hotels = [];
      if (pkg.hotels) {
        try { hotels = JSON.parse(pkg.hotels); } catch (e) { throw new Error(`Hotels JSON error in "${pkg.title}"`); }
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
    }

    await batch.commit();
    
    // Force revalidate frontend routes
    revalidatePath('/tour-packages');
    revalidatePath('/');
    
    return { success: true, message: `Successfully synchronized ${data.length} travel itineraries to the cloud.` };

  } catch (e: any) {
    console.error("Bulk upload failure:", e);
    return { success: false, message: e.message || 'Cloud synchronization failed.' };
  }
}

/**
 * Server action to save or update a single package with cache invalidation.
 */
export async function saveTourPackageAction(packageId: string, data: any) {
    const { adminDb, error } = getFirebaseAdmin();
    if (error || !adminDb) return { success: false, message: "Admin SDK not initialized" };

    try {
        const packageRef = adminDb.collection('tourPackages').doc(packageId);
        await packageRef.set(data, { merge: true });
        
        // REVALIDATION: This ensures the frontend shows new data instantly
        revalidatePath('/tour-packages');
        revalidatePath(`/tour-packages/${packageId}`);
        revalidatePath('/');
        
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
