// This file has been simplified to prevent circular dependency build errors.
// Components and hooks should import directly from their source files
// (e.g., '@/firebase/auth/use-user') instead of from this file.

// Export the client provider for use in the root layout
export { FirebaseClientProvider } from './client-provider';

// Export the base context hooks
export { useFirebaseApp, useFirestore, useAuth } from './provider';
