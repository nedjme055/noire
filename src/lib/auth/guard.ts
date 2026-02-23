import {redirect} from 'next/navigation';
import {getAuthSession} from './session';

export async function requireAdmin(locale: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/${locale}/admin/login`);
  }

  return session;
}
