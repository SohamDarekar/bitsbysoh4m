import { redirect } from 'next/navigation';

export default function AdminPage() {
  const adminUrl = process.env.NEXT_PUBLIC_GHOST_ADMIN_URL;

  if (!adminUrl) {
    throw new Error('NEXT_PUBLIC_GHOST_ADMIN_URL is not configured.');
  }

  redirect(adminUrl);
}
