'use client';

type MetaEventPayload = {
  event_name: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
  event_id: string;
  event_source_url: string;
  value?: number;
  currency?: string;
  user_data?: {
    email?: string;
    phone?: string;
  };
  content_name?: string;
};

export async function sendMetaEvent(payload: MetaEventPayload) {
  try {
    await fetch('/api/meta/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // no-op: tracking failures should never block checkout
  }
}

export function createEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (e.g. HTTP on local network)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
