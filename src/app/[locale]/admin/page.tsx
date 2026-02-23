import {redirect} from 'next/navigation';

export default function AdminRoot({params}: {params: {locale: string}}) {
  redirect(`/${params.locale}/admin/products`);
}
