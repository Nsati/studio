'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateAdminPanel() {
    revalidatePath('/admin');
}

export async function revalidatePublicContent() {
    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/hotels/[slug]', 'page');
}
