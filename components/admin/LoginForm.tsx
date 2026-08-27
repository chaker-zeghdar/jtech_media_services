'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { ADMIN_INPUT } from './styles';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });

    if (authError) {
      /* One message for every failure mode. Distinguishing "no such account"
         from "wrong password" turns the form into an account-existence oracle,
         and there is nothing the real admin can do with the distinction that
         this message doesn't already tell them. */
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      setBusy(false);
      return;
    }

    /* `next` comes from the middleware redirect. Only same-origin absolute
       paths are honoured — an attacker-supplied `next=https://evil.example`
       would otherwise turn the login page into an open redirect. */
    const next = params.get('next');
    const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin';

    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">البريد الإلكتروني</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={ADMIN_INPUT}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">كلمة المرور</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={ADMIN_INPUT}
        />
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
      >
        {busy ? '…' : 'دخول'}
      </button>
    </form>
  );
}
