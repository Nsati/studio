// Export the client provider for use in the root layout
export { FirebaseClientProvider } from './client-provider';

// Export the context hooks for use in components
export { useFirebaseApp, useFirestore, useAuth } from './provider';

// Export the custom hooks that build on top of the context hooks
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
