'use client';

import {useState} from 'react';
import {signIn} from 'next-auth/react';

export function AdminLoginForm({locale}: {locale: string}) {
  const [email, setEmail] = useState('admin@noire.dz');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <form
      className="card mx-auto w-full max-w-md space-y-3 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false
        });
        setLoading(false);

        if (res?.error) {
          setError('Invalid credentials');
          return;
        }

        window.location.href = `/${locale}/admin/products`;
      }}
    >
      <h1 className="text-xl font-bold">Admin Login</h1>
      <input className="min-h-12 w-full rounded-xl border border-black/15 px-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="min-h-12 w-full rounded-xl border border-black/15 px-4" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
