// This file has been simplified to prevent circular dependency build errors.
// Components and hooks should import directly from their source files
// (e.g., '@/firebase/auth/use-user') instead of from this central file.

// Export the client provider for use in the root layout
export { FirebaseClientProvider } from './client-provider';

// Export the base context hooks for convenience. These are safe to export as
// they only depend on the provider and don't create loops.
export { useFirebaseApp, useFirestore, useAuth } from './provider';
export { useMemoFirebase } from './firestore/use-memo-firebase';

// DO NOT re-export custom hooks like useUser, useDoc, useCollection here.
// Doing so creates circular dependencies that break the Next.js build on
// case-sensitive filesystems (like the deployment server).
