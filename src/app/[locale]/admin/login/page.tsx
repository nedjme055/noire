import {redirect} from 'next/navigation';
import {AdminLoginForm} from '@/components/admin/admin-login-form';
import {getAuthSession} from '@/lib/auth/session';

export default async function AdminLoginPage({params}: {params: {locale: string}}) {
  const session = await getAuthSession();
  if (session?.user?.id) {
    redirect(`/${params.locale}/admin/products`);
  }

  return <AdminLoginForm locale={params.locale} />;
}
