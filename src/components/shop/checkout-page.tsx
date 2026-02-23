'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/shop/cart-provider';
import { formatDzd } from '@/lib/utils';
import { createEventId, sendMetaEvent } from '@/lib/meta/client';

type CheckoutWilaya = {
  code: string;
  name: string;
  homePriceDzd: number;
  stopdeskPriceDzd: number;
};

export function CheckoutPageClient({
  locale,
  wilayas,
}: {
  locale: string;
  wilayas: CheckoutWilaya[];
}) {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    wilayaCode: wilayas[0]?.code ?? '',
    commune: '',
    address: '',
    notes: '',
    deliveryMethod: 'home' as 'home' | 'stopdesk',
  });

  const selectedWilaya = useMemo(
    () => wilayas.find((w) => w.code === form.wilayaCode),
    [form.wilayaCode, wilayas]
  );

  const deliveryOptionPrice = useMemo(
    () =>
      form.deliveryMethod === 'stopdesk'
        ? selectedWilaya?.stopdeskPriceDzd ?? 0
        : selectedWilaya?.homePriceDzd ?? 0,
    [form.deliveryMethod, selectedWilaya]
  );

  const total = subtotal + deliveryOptionPrice;

  const submit = async () => {
    if (items.length === 0) return;
    if (!form.customerName || !form.phone || !form.wilayaCode || !form.commune || !form.address) {
      setError(t('missingFields'));
      return;
    }

    setLoading(true);
    setError('');
    const eventId = createEventId();

    sendMetaEvent({
      event_name: 'InitiateCheckout',
      event_id: eventId,
      event_source_url: window.location.href,
      value: total,
      currency: 'DZD',
      user_data: { email: form.email, phone: form.phone },
    });

    if ((window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', { value: total, currency: 'DZD' }, { eventID: eventId });
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, locale, eventId, items }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: t('failed') }));
      setError(data.error || t('failed'));
      setLoading(false);
      return;
    }

    const data = await res.json();

    sendMetaEvent({
      event_name: 'Purchase',
      event_id: eventId,
      event_source_url: window.location.href,
      value: total,
      currency: 'DZD',
      user_data: { email: form.email, phone: form.phone },
    });

    if ((window as any).fbq) {
      (window as any).fbq('track', 'Purchase', { value: total, currency: 'DZD' }, { eventID: eventId });
    }

    clearCart();
    setLoading(false);
    router.push(`/${locale}/order-success/${data.orderId}`);
  };

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="container-mobile py-10">
      {/* Header with step indicator */}
      <div className="mb-8 text-center">
        <h1 className="section-heading">{t('title')}</h1>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">1</span>
          <div className="h-px w-12 bg-black/20" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-[11px] font-medium text-black/40">2</span>
          <div className="h-px w-12 bg-black/10" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-[11px] font-medium text-black/30">✓</span>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-5 pb-24">
        {/* Contact section */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-black/40">
            Contact Information
          </legend>
          <div className="relative">
            <input
              className="input-field peer pt-5"
              placeholder=" "
              value={form.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              id="checkout-name"
            />
            <label htmlFor="checkout-name" className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-black/35 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wider">
              {t('fullName')}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <input
                className="input-field peer pt-5"
                placeholder=" "
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                id="checkout-phone"
              />
              <label htmlFor="checkout-phone" className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-black/35 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wider">
                {t('phone')}
              </label>
            </div>
            <div className="relative">
              <input
                className="input-field peer pt-5"
                placeholder=" "
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                id="checkout-email"
              />
              <label htmlFor="checkout-email" className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-black/35 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wider">
                {t('email')}
              </label>
            </div>
          </div>
        </fieldset>

        {/* Shipping address */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-black/40">
            Shipping Address
          </legend>
          <select
            className="input-field"
            value={form.wilayaCode}
            onChange={(e) => set('wilayaCode', e.target.value)}
          >
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <input
                className="input-field peer pt-5"
                placeholder=" "
                value={form.commune}
                onChange={(e) => set('commune', e.target.value)}
                id="checkout-commune"
              />
              <label htmlFor="checkout-commune" className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-black/35 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wider">
                {t('commune')}
              </label>
            </div>
            <div className="relative">
              <input
                className="input-field peer pt-5"
                placeholder=" "
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                id="checkout-address"
              />
              <label htmlFor="checkout-address" className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-black/35 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wider">
                {t('address')}
              </label>
            </div>
          </div>
          <textarea
            className="input-field min-h-20 py-3"
            placeholder={t('notes')}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </fieldset>

        {/* Delivery method */}
        <fieldset>
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black/40">
            {t('deliveryMethod')}
          </legend>
          <div className="space-y-2">
            <label className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 transition-all ${form.deliveryMethod === 'home' ? 'border-black bg-black/[0.02]' : 'border-black/10 hover:border-black/25'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${form.deliveryMethod === 'home' ? 'border-black' : 'border-black/20'}`}>
                  {form.deliveryMethod === 'home' && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
                </div>
                <span className="text-[13px] font-medium">{t('deliveryHome')}</span>
              </div>
              <span className="text-[13px] font-semibold text-black/70">{formatDzd(selectedWilaya?.homePriceDzd ?? 0, locale)}</span>
              <input type="radio" name="deliveryMethod" className="sr-only" checked={form.deliveryMethod === 'home'} onChange={() => set('deliveryMethod', 'home')} />
            </label>
            <label className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 transition-all ${form.deliveryMethod === 'stopdesk' ? 'border-black bg-black/[0.02]' : 'border-black/10 hover:border-black/25'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${form.deliveryMethod === 'stopdesk' ? 'border-black' : 'border-black/20'}`}>
                  {form.deliveryMethod === 'stopdesk' && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
                </div>
                <span className="text-[13px] font-medium">{t('deliveryStopdesk')}</span>
              </div>
              <span className="text-[13px] font-semibold text-black/70">{formatDzd(selectedWilaya?.stopdeskPriceDzd ?? 0, locale)}</span>
              <input type="radio" name="deliveryMethod" className="sr-only" checked={form.deliveryMethod === 'stopdesk'} onChange={() => set('deliveryMethod', 'stopdesk')} />
            </label>
          </div>
        </fieldset>

        {/* Order summary */}
        <div className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-5 space-y-2.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-black/45">{t('subtotal')}</span>
            <span className="font-medium">{formatDzd(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-black/45">{t('shipping')}</span>
            <span className="font-medium">{formatDzd(deliveryOptionPrice, locale)}</span>
          </div>
          <div className="h-px bg-black/[0.06]" />
          <div className="flex justify-between text-[15px] font-semibold">
            <span>{t('total')}</span>
            <span>{formatDzd(total, locale)}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary fixed left-0 right-0 z-50 w-full px-4 py-3.5 bottom-[calc(env(safe-area-inset-bottom)+72px)] sm:static sm:mt-4 sm:rounded-lg sm:px-0 sm:py-3.5"
          onClick={submit}
          disabled={loading}
        >
          {loading ? t('placing') : t('placeOrder')}
        </button>
        {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
