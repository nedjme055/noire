import {revalidatePath} from 'next/cache';
import {AdminShell} from '@/components/admin/admin-shell';
import {requireAdmin} from '@/lib/auth/guard';
import {prisma} from '@/lib/db/prisma';

async function updateShipping(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const homePriceDzd = Number(formData.get('homePriceDzd'));
  const stopdeskPriceDzd = Number(formData.get('stopdeskPriceDzd'));
  await prisma.shippingWilaya.update({where: {id}, data: {homePriceDzd, stopdeskPriceDzd}});
  revalidatePath('/');
}

export default async function AdminShippingPage({params}: {params: {locale: string}}) {
  await requireAdmin(params.locale);
  const wilayas = await prisma.shippingWilaya.findMany({orderBy: {code: 'asc'}});

  return (
    <AdminShell locale={params.locale}>
      <section className="space-y-2">
        <h1 className="text-xl font-bold">Shipping by wilaya</h1>
        {wilayas.map((wilaya) => (
          <form key={wilaya.id} action={updateShipping} className="card flex flex-wrap items-center gap-2 p-3">
            <input type="hidden" name="id" value={wilaya.id} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{wilaya.code} - {wilaya.nameEn}</p>
              <p className="text-xs text-black/60">{wilaya.nameFr} | {wilaya.nameAr}</p>
            </div>
            <label className="space-y-1">
              <span className="block text-[11px] font-semibold text-black/60">A domicile</span>
              <input
                name="homePriceDzd"
                type="number"
                defaultValue={wilaya.homePriceDzd}
                className="min-h-12 w-28 rounded-xl border border-black/15 px-3"
                aria-label="A domicile price"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-semibold text-black/60">Stop desk</span>
              <input
                name="stopdeskPriceDzd"
                type="number"
                defaultValue={wilaya.stopdeskPriceDzd}
                className="min-h-12 w-28 rounded-xl border border-black/15 px-3"
                aria-label="Stop desk price"
              />
            </label>
            <button className="btn-primary" type="submit">Save</button>
          </form>
        ))}
      </section>
    </AdminShell>
  );
}
