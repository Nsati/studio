
'use server';

import { getFirebaseAdmin } from '@/firebase/admin';
import type { TourPackage } from '@/lib/types';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { TourPackageUploadSchema } from '../schemas';

/**
 * @fileOverview Super-Robust Tour Package Bulk Upload.
 * Features: Deep Header Normalization, Smart Price Cleaning, and Error Resilience.
 */

export async function bulkUploadTourPackages(data: any[]) {
  const { adminDb, error } = getFirebaseAdmin();
  if (error || !adminDb) {
    return { success: false, message: error || "Admin SDK not initialized" };
  }

  try {
    const chunkSize = 400;
    let processedCount = 0;
    let errorLog: string[] = [];

    // Helper: Clean currency/numeric strings
    const cleanNumeric = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return Number(String(val).replace(/[^0-9.]/g, '')) || 0;
    };

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const batch = adminDb.batch();

      for (const rawRow of chunk) {
        // 1. Master Normalization (Deep Synonym Mapping)
        const normalizedRow: any = {};
        Object.keys(rawRow).forEach(key => {
          const k = key.toLowerCase().trim().replace(/[\s_]+/g, '');
          const val = rawRow[key];
          
          if (['title', 'packagetitle', 'tourname', 'name', 'itineraryname'].includes(k)) normalizedRow['title'] = val;
          else if (['duration', 'days', 'nights', 'stay'].includes(k)) normalizedRow['duration'] = val;
          else if (['destinations', 'destination', 'cities', 'places', 'covered'].includes(k)) normalizedRow['destinations'] = val;
          else if (['price', 'cost', 'amount', 'baseprice'].includes(k)) normalizedRow['price'] = cleanNumeric(val);
          else if (['gst', 'tax'].includes(k)) normalizedRow['gst'] = cleanNumeric(val) || 5;
          else if (['image', 'img', 'imageurl', 'photo', 'picture'].includes(k)) normalizedRow['image'] = String(val || '').trim();
          else if (['description', 'summary', 'overview', 'about'].includes(k)) normalizedRow['description'] = val;
          else if (['persons', 'pax', 'adults', 'capacity'].includes(k)) normalizedRow['persons'] = cleanNumeric(val) || 2;
          else if (['rooms', 'units', 'accommodation'].includes(k)) normalizedRow['rooms'] = cleanNumeric(val) || 1;
          else if (['cabtype', 'vehicle', 'transport', 'car'].includes(k)) normalizedRow['cabType'] = val;
          else if (['traveldate', 'date', 'scheduled'].includes(k)) normalizedRow['travelDate'] = val;
          else if (['itinerary', 'daywise'].includes(k)) normalizedRow['itinerary'] = val;
          else if (['hotels', 'stays'].includes(k)) normalizedRow['hotels'] = val;
          else if (['inclusions', 'inclusive'].includes(k)) normalizedRow['inclusions'] = val;
          else if (['exclusions', 'exclusive'].includes(k)) normalizedRow['exclusions'] = val;
          else if (['tcs', 'policytcs'].includes(k)) normalizedRow['policy_tcs'] = val;
          else if (['cancellation', 'policycancellation'].includes(k)) normalizedRow['policy_cancellation'] = val;
          else if (['payment', 'policypayment'].includes(k)) normalizedRow['policy_payment'] = val;
          else if (['terms', 'policyterms'].includes(k)) normalizedRow['policy_terms'] = val;
          else normalizedRow[k] = val;
        });

        // 2. Schema Validation with Fallbacks
        const validation = TourPackageUploadSchema.safeParse(normalizedRow);
        if (!validation.success) {
          console.warn(`[CSV SKIP] Row "${normalizedRow.title || 'Untitled'}" validation failed:`, validation.error.format());
          errorLog.push(normalizedRow.title || 'Unknown');
          continue; 
        }

        const pkg = validation.data;
        const packageId = slugify(pkg.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 5);
        const packageRef = adminDb.collection('tourPackages').doc(packageId);

        // 3. Smart Parsing for JSON strings (Itinerary/Hotels)
        let itinerary = [];
        try { 
            itinerary = typeof pkg.itinerary === 'string' && pkg.itinerary.startsWith('[') 
                ? JSON.parse(pkg.itinerary) 
                : []; 
        } catch (e) { itinerary = []; }
        
        let hotels = [];
        try { 
            hotels = typeof pkg.hotels === 'string' && pkg.hotels.startsWith('[') 
                ? JSON.parse(pkg.hotels) 
                : []; 
        } catch (e) { hotels = []; }

        const price = Number(pkg.price) || 0;
        const totalCost = price + (price * (pkg.gst / 100));

        const finalDoc: any = {
          id: packageId,
          title: pkg.title,
          duration: pkg.duration,
          destinations: String(pkg.destinations).split(/[,|•]/).map(d => d.trim()).filter(Boolean),
          price: price,
          gst: pkg.gst,
          totalCost: totalCost,
          image: pkg.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
          description: pkg.description,
          persons: pkg.persons,
          rooms: pkg.rooms,
          cabType: pkg.cabType || 'Sedan',
          travelDate: pkg.travelDate || '',
          itinerary: itinerary,
          hotels: hotels,
          inclusions: pkg.inclusions ? String(pkg.inclusions).split(/[,|•]/).map(i => i.trim()).filter(Boolean) : [],
          exclusions: pkg.exclusions ? String(pkg.exclusions).split(/[,|•]/).map(e => e.trim()).filter(Boolean) : [],
          policies: {
            tcs: pkg.policy_tcs || 'As per govt norms',
            cancellation: pkg.policy_cancellation || 'Standard terms apply',
            payment: pkg.policy_payment || 'Advance payment required',
            terms: pkg.policy_terms || 'Subject to availability'
          },
          createdAt: new Date().toISOString()
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
    
    const message = errorLog.length > 0 
        ? `Sync Complete. ${processedCount} uploaded. ${errorLog.length} skipped (check logs for: ${errorLog.slice(0, 3).join(', ')}...)`
        : `Himalayan Grid Synchronized: ${processedCount} itineraries established.`;

    return { success: true, message };

  } catch (e: any) {
    console.error("[CRITICAL UPLOAD ERROR]:", e);
    return { success: false, message: `Cloud Node Error: ${e.message}` };
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
