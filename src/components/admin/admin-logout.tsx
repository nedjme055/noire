'use client';

import {signOut} from 'next-auth/react';

export function AdminLogout({locale}: {locale: string}) {
  return (
    <button
      type="button"
      className="btn-secondary min-h-10 px-3 py-2 text-sm"
      onClick={() => signOut({callbackUrl: `/${locale}/admin/login`})}
    >
      Logout
    </button>
  );
}
