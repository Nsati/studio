// This server action is obsolete as signup is now handled on the client-side
// to avoid dependency on server configuration. This file can be deleted.
'use server';

export async function signupUser() {
  return { success: false, error: 'This function is obsolete.' };
}
