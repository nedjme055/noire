import {revalidatePath} from 'next/cache';
import {AdminShell} from '@/components/admin/admin-shell';
import {requireAdmin} from '@/lib/auth/guard';
import {getSiteSettings} from '@/lib/queries';
import {prisma} from '@/lib/db/prisma';

async function updateSettings(formData: FormData) {
  'use server';

  await prisma.siteSettings.upsert({
    where: {id: 'main'},
    update: {
      storeName: String(formData.get('storeName') ?? ''),
      storePhone: String(formData.get('storePhone') ?? ''),
      storeWhatsapp: String(formData.get('storeWhatsapp') ?? ''),
      storeAddress: String(formData.get('storeAddress') ?? ''),
      metaPixelId: String(formData.get('metaPixelId') ?? ''),
      metaAccessToken: String(formData.get('metaAccessToken') ?? ''),
      metaTestEventCode: String(formData.get('metaTestEventCode') ?? ''),
      trackingEnabled: formData.get('trackingEnabled') === 'on'
    },
    create: {
      id: 'main',
      storeName: String(formData.get('storeName') ?? 'Noire'),
      storePhone: String(formData.get('storePhone') ?? ''),
      storeWhatsapp: String(formData.get('storeWhatsapp') ?? ''),
      storeAddress: String(formData.get('storeAddress') ?? ''),
      metaPixelId: String(formData.get('metaPixelId') ?? ''),
      metaAccessToken: String(formData.get('metaAccessToken') ?? ''),
      metaTestEventCode: String(formData.get('metaTestEventCode') ?? ''),
      trackingEnabled: formData.get('trackingEnabled') === 'on'
    }
  });

  revalidatePath('/');
}

export default async function AdminSettingsPage({params}: {params: {locale: string}}) {
  await requireAdmin(params.locale);
  const settings = await getSiteSettings();

  return (
    <AdminShell locale={params.locale}>
      <form action={updateSettings} className="card space-y-3 p-4">
        <h1 className="text-xl font-bold">Site settings</h1>
        <input name="storeName" defaultValue={settings.storeName} placeholder="Store name" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <input name="storePhone" defaultValue={settings.storePhone ?? ''} placeholder="Store phone" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <input name="storeWhatsapp" defaultValue={settings.storeWhatsapp ?? ''} placeholder="WhatsApp number" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <input name="storeAddress" defaultValue={settings.storeAddress ?? ''} placeholder="Address" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <input name="metaPixelId" defaultValue={settings.metaPixelId ?? ''} placeholder="Meta Pixel ID" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <input name="metaAccessToken" defaultValue={settings.metaAccessToken ?? ''} placeholder="Meta Access Token" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <input name="metaTestEventCode" defaultValue={settings.metaTestEventCode ?? ''} placeholder="Meta Test Event Code" className="min-h-12 w-full rounded-xl border border-black/15 px-4" />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="trackingEnabled" defaultChecked={settings.trackingEnabled} />
          Enable tracking
        </label>
        <button className="btn-primary w-full" type="submit">Save settings</button>
      </form>
    </AdminShell>
  );
}
