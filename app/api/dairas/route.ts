import { createClient } from '@/lib/supabase/server';

/**
 * `GET /api/dairas?wilaya=5` — the dairas of one wilaya, for the checkout's
 * address picker.
 *
 * A route handler rather than a server action or a static import, for three
 * reasons: 548 dairas is far too much to ship in the bundle for the handful a
 * customer will ever see; `<CheckoutView />` is a client component inside a
 * lazily-mounted dialog, so it cannot read them on the server; and the list is
 * fetched only after a wilaya is chosen, which is at most a few rows.
 *
 * Public and unauthenticated, like the catalogue reads it sits alongside —
 * these are the names of Algerian administrative districts, not customer data.
 * `/api` is outside the middleware matcher, so no admin gate applies here and
 * none should.
 */
export async function GET(request: Request) {
  const wilaya = Number(new URL(request.url).searchParams.get('wilaya'));

  if (!Number.isInteger(wilaya) || wilaya < 1 || wilaya > 58) {
    return Response.json({ error: 'A wilaya code between 1 and 58 is required.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dairas')
    .select('id, name, name_ascii')
    .eq('wilaya_code', wilaya)
    .order('name_ascii');

  if (error) return Response.json({ error: error.message }, { status: 502 });

  return Response.json({ dairas: data ?? [] });
}
