// This file is the main entry point for Firebase-related modules.
// It should ONLY export modules that are safe for BOTH server and client environments.

// Export the server-side admin SDK. This is safe because it's only
// initialized and used in server-only environments (API routes, Server Actions).
export { adminDb, adminAuth } from './admin';

// DO NOT export client-side modules from here.
// Client components should import directly from `@/firebase/client/provider`.
