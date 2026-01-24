/**
 * This file acts as a guard to prevent client-side Firebase modules
 * from ever being imported on the server. If any file that imports this
 * module is accidentally imported into a Server Component, the build will fail.
 */
if (typeof window === 'undefined') {
  throw new Error(
    '🛑 SERVER-SIDE FIREBASE IMPORT: You are importing a client-only Firebase module on the server. Please only import from `@/firebase/client/*` in client components.'
  );
}
