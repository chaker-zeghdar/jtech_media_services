'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    /* `refresh()` after `push()` so the server re-renders with the cookie now
       cleared — without it the layout would keep showing the signed-in header
       from the cached RSC payload until a hard reload. */
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:opacity-50"
    >
      {busy ? '…' : 'تسجيل الخروج'}
    </button>
  );
}
