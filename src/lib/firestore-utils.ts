
'use client';

import { Timestamp } from 'firebase/firestore';

/**
 * Safely normalizes a value that might be a Firestore Timestamp, a string,
 * a number, or a JavaScript Date into a JavaScript Date object.
 *
 * @param value The value to convert. Can be a Firestore Timestamp, string, number, or Date.
 * @returns A JavaScript Date object. If the input is invalid, it returns an invalid Date.
 */
export function normalizeTimestamp(value: any): Date {
  if (!value) {
    return new Date(NaN); // Return an invalid date for null/undefined input
  }
  // If it's a Firestore Timestamp, it will have a toDate method.
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  // If it's already a Date object, return it.
  if (value instanceof Date) {
    return value;
  }
  // If it's a string or number, try to parse it.
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    // Ensure it's not an invalid date string like "pending"
    if (!isNaN(d.getTime())) {
        return d;
    }
  }
  // Return an invalid date if all else fails.
  return new Date(NaN);
}
