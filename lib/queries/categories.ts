import { z } from 'zod';
import { type Category, categorySchema, parseContent } from '@/content/schemas';
import { supabase } from '@/lib/supabase';

/**
 * Reads table `categories`, replacing the old `content/categories.ts` literal.
 *
 * Rows still go through `categorySchema`, so a bad row fails loudly here with
 * the same message shape the static file used to produce at import time —
 * moving the data to Supabase changed *where* rows come from, not whether they
 * are validated.
 */

/** One row as Supabase returns it — snake_case, nullable columns. */
type CategoryRow = {
  slug: string;
  name: unknown;
  tagline: unknown;
  icon: string;
  image: string | null;
  image_crop: unknown;
  position: number;
  has_battery_health: boolean;
};

/** snake_case column names → the camelCase shape `categorySchema` expects. */
function fromRow(row: CategoryRow): unknown {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    icon: row.icon,
    // `undefined`, not `null`: both are optional in the schema, and zod's
    // `.optional()` rejects an explicit null.
    image: row.image ?? undefined,
    imageCrop: row.image_crop ?? undefined,
    position: row.position,
    hasBatteryHealth: row.has_battery_health,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('position');
  if (error) throw new Error(`getCategories: ${error.message}`);
  return parseContent('categories (supabase)', z.array(categorySchema), data.map(fromRow));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}
