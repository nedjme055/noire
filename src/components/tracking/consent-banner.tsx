'use client';

import {useState} from 'react';

const KEY = 'noire-tracking-consent';

export function ConsentBanner() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(KEY) !== null;
  });

  if (hidden) return null;

  return (
    <div className="safe-py fixed bottom-16 left-3 right-3 z-50 rounded-2xl border border-black/20 bg-white p-4 shadow-soft sm:bottom-4 sm:left-auto sm:right-4 sm:w-96">
      <p className="text-sm leading-6 text-black/80">
        We use analytics and Meta tracking to improve ads and checkout conversion.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            localStorage.setItem(KEY, 'denied');
            setHidden(true);
          }}
        >
          Decline
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            localStorage.setItem(KEY, 'granted');
            window.dispatchEvent(new Event('tracking-consent-updated'));
            setHidden(true);
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export function hasConsent() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === 'granted';
}
