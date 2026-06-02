
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { TourPackage } from '@/lib/types';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { TourPackageUploadSchema } from '../schemas';

/**
 * @fileOverview Production Tour Package Actions.
 * Improved header normalization to handle various CSV naming conventions.
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
        // 1. Normalize headers (strip spaces, lowercase)
        const normalizedRow: any = {};
        Object.keys(rawRow).forEach(key => {
          const k = key.toLowerCase().trim().replace(/\s+/g, '');
          
          // Map variations to schema keys
          if (k === 'cabtype' || k === 'vehicle') normalizedRow['cabType'] = rawRow[key];
          else if (k === 'traveldate' || k === 'date') normalizedRow['travelDate'] = rawRow[key];
          else if (k === 'policytcs' || k === 'tcs') normalizedRow['policy_tcs'] = rawRow[key];
          else if (k === 'policycancellation' || k === 'cancellation') normalizedRow['policy_cancellation'] = rawRow[key];
          else if (k === 'policypayment' || k === 'payment') normalizedRow['policy_payment'] = rawRow[key];
          else if (k === 'policyterms' || k === 'terms') normalizedRow['policy_terms'] = rawRow[key];
          else if (k === 'image' || k === 'img' || k === 'imageurl') normalizedRow['image'] = String(rawRow[key] || '').trim();
          else normalizedRow[k] = rawRow[key];
        });

        // 2. Validate Row
        const validation = TourPackageUploadSchema.safeParse(normalizedRow);
        if (!validation.success) {
          console.warn(`[CSV ERROR] Row "${normalizedRow.title || 'Untitled'}" skipped:`, validation.error.format());
          continue; 
        }

        const pkg = validation.data;
        const packageId = slugify(pkg.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
        const packageRef = adminDb.collection('tourPackages').doc(packageId);

        // 3. Parse JSON strings
        let itinerary = [];
        try { itinerary = pkg.itinerary ? JSON.parse(pkg.itinerary) : []; } catch (e) { itinerary = []; }
        
        let hotels = [];
        try { hotels = pkg.hotels ? JSON.parse(pkg.hotels) : []; } catch (e) { hotels = []; }

        const price = Number(pkg.price) || 0;
        const totalCost = price + (price * (pkg.gst / 100));

        const finalDoc: any = {
          id: packageId,
          title: pkg.title,
          duration: pkg.duration,
          destinations: pkg.destinations.split(',').map(d => d.trim()).filter(Boolean),
          price: price,
          gst: pkg.gst,
          totalCost: totalCost,
          image: pkg.image,
          description: pkg.description,
          persons: pkg.persons,
          rooms: pkg.rooms,
          cabType: pkg.cabType,
          travelDate: pkg.travelDate || '',
          itinerary: itinerary,
          hotels: hotels,
          inclusions: pkg.inclusions ? pkg.inclusions.split(',').map(i => i.trim()).filter(Boolean) : [],
          exclusions: pkg.exclusions ? pkg.exclusions.split(',').map(e => e.trim()).filter(Boolean) : [],
          policies: {
            tcs: pkg.policy_tcs || 'As per govt norms',
            cancellation: pkg.policy_cancellation || 'Standard terms apply',
            payment: pkg.policy_payment || 'Advance payment required',
            terms: pkg.policy_terms || 'Subject to availability'
          }
        };

        batch.set(packageRef, finalDoc);
        processedCount++;
      }

      if (processedCount > 0) {
        await batch.commit();
      }
    }

    revalidatePath('/tour-packages');
    revalidatePath('/admin/tour-packages');
    revalidatePath('/');
    
    return { 
      success: true, 
      message: `Synchronized ${processedCount} itineraries. Check console if any were skipped.` 
    };

  } catch (e: any) {
    console.error("Bulk upload critical failure:", e);
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
        revalidatePath('/admin/tour-packages');
        revalidatePath('/');
        return { success: true, message: 'Expedition has been permanently removed.' };
    } catch (e: any) {
        console.error("Delete failure:", e);
        return { success: false, message: e.message || 'Failed to remove itinerary.' };
    }
}
