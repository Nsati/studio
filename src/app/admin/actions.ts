'use server';

import { revalidatePath } from 'next/cache';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  // This is a simple way to protect the admin panel.
  // In a production app, consider a more robust authentication system.
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword === 'changeme') {
    // Fail safe if the environment variable is not set or is default.
    console.error("ADMIN_PASSWORD is not set in .env file. Please set it for security.");
    return false;
  }
  return password === adminPassword;
}

export async function revalidateAdminPanel() {
    revalidatePath('/admin');
}

export async function revalidatePublicContent() {
    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/hotels/[slug]', 'page');
}
