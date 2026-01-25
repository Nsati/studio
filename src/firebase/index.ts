// This is now a barrel file. All initialization happens in FirebaseClientProvider.
// It re-exports all the necessary hooks and context providers for the rest of the app.
export * from './provider';
export * from './client-provider';
export * from './errors';
export * from './error-emitter';
export * from './hooks';

// Note: firebaseApp, auth, and firestore instances are no longer exported from here.
// They must be accessed via the hooks (useFirebaseApp, useAuth, useFirestore)
// from within components wrapped in FirebaseClientProvider.
