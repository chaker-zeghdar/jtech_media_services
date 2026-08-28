'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { saveProduct } from '@/app/(admin)/admin/actions';
import { CATEGORY_SPEC_SUGGESTIONS } from '@/content/categoryFields';
import type { Category, CategorySlug } from '@/content/schemas';
import { badgeSchema, slugify, stockStatusSchema } from '@/content/schemas';
import { saveInputSchema } from '@/lib/admin/productInput';
import type { AdminProduct } from '@/lib/queries/admin';
import { colourHexFor } from '@/content/colours';
import { ColourPicker } from './ColourPicker';
import { ImageUploader } from './ImageUploader';
import { stableSlug } from './slug';
import {
  ADMIN_BTN_DANGER,
  ADMIN_BTN_GHOST,
  ADMIN_BTN_PRIMARY,
  ADMIN_CARD,
  ADMIN_CHIP,
  ADMIN_INPUT,
  ADMIN_LABEL,
} from './styles';

type VariantDraft = {
  id: string;
  colourHex: string;
  colourLabel: string;
  storage: string;
  price: string;
  compareAt: string;
  stock: string;
  images: string[];
};

type SpecDraft = { label: string; value: string };
type HighlightDraft = { value: string; unit: string; label: string };

const newVariant = (): VariantDraft => ({
  // Minted here rather than server-side, which is what lets the whole payload
  // validate against `productVariantSchema` (it requires an `id`) before it is
  // ever sent. A lowercase uuid satisfies the schema's kebab-case slug regex.
  id: crypto.randomUUID(),
  /* No default colour. `#000000` used to make "never touched it" look exactly
     like "chose black", which is how a `white` variant ended up painted black. */
  colourHex: colourHexFor(''),
  colourLabel: '',
  storage: '',
  price: '',
  compareAt: '',
  stock: 'in-stock',
  images: [],
});

function toDrafts(product: AdminProduct | null): {
  variants: VariantDraft[];
  specs: SpecDraft[];
  highlights: HighlightDraft[];
} {
  if (!product) return { variants: [newVariant()], specs: [], highlights: [] };
  return {
    variants: product.variants.map((variant) => ({
      id: variant.id,
      colourHex: variant.colour.hex,
      colourLabel: variant.colour.label,
      storage: variant.storage ?? '',
      price: String(variant.price),
      compareAt: variant.compareAt === null ? '' : String(variant.compareAt),
      stock: variant.stock,
      images: [...variant.images],
    })),
    specs: product.specs.map((spec) => ({ label: spec.label, value: spec.value })),
    highlights: product.highlights.map((h) => ({ ...h, unit: h.unit ?? '' })),
  };
}

export function ProductForm({
  product,
  categories,
}: {
  product: AdminProduct | null;
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initial = useMemo(() => toDrafts(product), [product]);

  const [slug, setSlug] = useState(product?.slug ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [categorySlug, setCategorySlug] = useState<string>(product?.category ?? categories[0]?.slug ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [badges, setBadges] = useState<string[]>(product?.badges ?? []);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [bestseller, setBestseller] = useState(product?.bestseller ?? false);
  const [published, setPublished] = useState(product?.published ?? false);
  const [batteryHealth, setBatteryHealth] = useState(
    product?.batteryHealthPercent === null || product?.batteryHealthPercent === undefined
      ? ''
      : String(product.batteryHealthPercent),
  );
  const [specs, setSpecs] = useState<SpecDraft[]>(initial.specs);
  const [highlights, setHighlights] = useState<HighlightDraft[]>(initial.highlights);
  const [variants, setVariants] = useState<VariantDraft[]>(initial.variants);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  /**
   * The category-conditional field, driven by the DATA not by the slug.
   *
   * `categories.has_battery_health` is a column, so adding a sixth category
   * that wants the field is a row edit, not a code change — which is why there
   * is no `if (category === 'iphone')` anywhere in this file.
   */
  const selectedCategory = categories.find((entry) => entry.slug === categorySlug);
  const showBatteryHealth = selectedCategory?.hasBatteryHealth ?? false;

  const suggestions = CATEGORY_SPEC_SUGGESTIONS[categorySlug as CategorySlug] ?? [];

  function changeCategory(next: string) {
    setCategorySlug(next);
    /* Clear the reading when the new category doesn't have the concept.
       Keeping it would leave a battery-health number silently attached to, say,
       a laptop — invisible in the form, still in the database, and shipped to
       the storefront the next time anything reads that row. */
    const category = categories.find((entry) => entry.slug === next);
    if (!category?.hasBatteryHealth) setBatteryHealth('');
  }

  function patchVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  /**
   * The slug follows the name until the admin takes it over.
   *
   * Same "mirror until diverged" rule the old <LocalizedInput /> used for
   * ar→fr/en: divergence is read from the values themselves — the slug is still
   * being auto-filled exactly while it equals `slugify(previous name)` — so
   * there is no separate "touched" flag to keep in sync. Typing in the slug by
   * hand breaks that equality once and for all.
   *
   * `slugify` returns "" for Arabic-only input, and an empty auto-fill would
   * both look broken and fail `slugSchema`. So a blank result leaves the field
   * alone for the admin to fill in; it never clears what is already there.
   */
  function changeName(next: string) {
    const wasAuto = slug === slugify(name);
    setName(next);
    if (!wasAuto) return;
    const suggested = slugify(next);
    if (suggested) setSlug(suggested);
  }

  function buildPayload() {
    return {
      id: product?.id ?? null,
      published,
      product: {
        slug: slug.trim(),
        brand: brand.trim(),
        category: categorySlug,
        badges,
        featured,
        bestseller,
        name: name.trim(),
        // Optional in the schema now; an untouched field sends nothing rather
        // than an empty string.
        description: description.trim() || undefined,
        /* `key` is derived, not typed — the admin never sees it. `stableSlug`
           rather than bare `slugify` because an Arabic label slugifies to "",
           which would fail `slugSchema` against a field that isn't on screen to
           correct. */
        specs: specs.map((spec) => ({
          key: stableSlug(spec.label, 'spec'),
          label: spec.label.trim(),
          value: spec.value.trim(),
        })),
        highlights: highlights.map((h) => ({
          value: h.value.trim(),
          unit: h.unit.trim() === '' ? null : h.unit.trim(),
          label: h.label.trim(),
        })),
        batteryHealthPercent:
          showBatteryHealth && batteryHealth.trim() !== '' ? Number(batteryHealth) : null,
        variants: variants.map((variant) => ({
          id: variant.id,
          colour: {
            // Derived from the colour name for the same reason as `spec.key`.
            // Deterministic, so two variants named "أسود" share a colour slug
            // and group correctly in `variantsForColour()`.
            slug: stableSlug(variant.colourLabel, 'colour'),
            /* Re-derived at save rather than trusting the draft's stored hex.
               The picker already keeps them together, but this makes a stale or
               hand-edited hex unrepresentable rather than merely unlikely. */
            hex: colourHexFor(variant.colourLabel),
            label: variant.colourLabel.trim(),
          },
          storage: variant.storage.trim() === '' ? null : variant.storage.trim(),
          price: Number(variant.price),
          compareAt: variant.compareAt.trim() === '' ? null : Number(variant.compareAt),
          stock: variant.stock,
          images: variant.images,
        })),
      },
    };
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    setSaved(false);

    /* The same schema the server re-runs and the storefront renders through.
       Running it here first turns "compareAt must be greater than price" from a
       500 into an inline message, without the client being the thing that
       actually decides. */
    const parsed = saveInputSchema.safeParse(buildPayload());

    if (!parsed.success) {
      setErrors(
        parsed.error.issues.map((issue) => `${issue.path.join(' › ') || 'النموذج'}: ${issue.message}`),
      );
      return;
    }

    startTransition(async () => {
      try {
        const { id } = await saveProduct(parsed.data);
        /* Explicit confirmation. Success used to be signalled only by a URL
           change, which on an EDIT (same route, same URL) is no signal at all —
           the admin pressed save and nothing visibly happened. */
        setSaved(true);
        router.push(`/admin/products/${id}`);
        router.refresh();
      } catch (err) {
        setErrors([err instanceof Error ? err.message : 'فشل الحفظ']);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-24">
      {/* ---- Basics ---- */}
      <section className={ADMIN_CARD}>
        <h2 className="text-lg font-semibold">الأساسيات</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={ADMIN_LABEL}>المعرّف (slug)</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              dir="ltr"
              placeholder="iphone-16-pro"
              className={ADMIN_INPUT}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={ADMIN_LABEL}>العلامة التجارية</span>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} dir="ltr" className={ADMIN_INPUT} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={ADMIN_LABEL}>القسم</span>
            <select value={categorySlug} onChange={(e) => changeCategory(e.target.value)} className={ADMIN_INPUT}>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name.ar} ({category.slug})
                </option>
              ))}
            </select>
          </label>

          {showBatteryHealth ? (
            <label className="flex flex-col gap-1.5">
              <span className={ADMIN_LABEL}>صحة البطارية %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(e.target.value)}
                dir="ltr"
                placeholder="100"
                className={ADMIN_INPUT}
              />
              <span className="text-xs text-gray-500">
                يظهر هذا الحقل لأن هذا القسم مفعّل عليه صحة البطارية.
              </span>
            </label>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5">
          {([
            ['منشور', published, setPublished],
            ['مميّز (الواجهة)', featured, setFeatured],
            ['الأكثر مبيعاً', bestseller, setBestseller],
          ] as const).map(([label, value, set]) => (
            <label key={label} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className={ADMIN_LABEL}>الشارات</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {badgeSchema.options.map((badge) => (
              <label key={badge} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={badges.includes(badge)}
                  onChange={(e) =>
                    setBadges((current) =>
                      e.target.checked ? [...current, badge] : current.filter((b) => b !== badge),
                    )
                  }
                />
                {badge}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* ---- Copy ---- */}
      <section className={ADMIN_CARD}>
        <h2 className="text-lg font-semibold">النصوص</h2>
        <div className="mt-4 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className={ADMIN_LABEL}>الاسم</span>
            {/* `dir="auto"` rather than a fixed direction: product names are
                routinely mixed, like "آيفون 16 برو" or "MacBook Air M4", and the
                browser picks per the first strong character in what was
                actually typed. */}
            <input
              value={name}
              onChange={(e) => changeName(e.target.value)}
              dir="auto"
              className={ADMIN_INPUT}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={ADMIN_LABEL}>الوصف</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              dir="auto"
              rows={3}
              className={ADMIN_INPUT}
            />
            <span className="text-xs text-gray-500">اختياري.</span>
          </label>
        </div>
      </section>

      {/* ---- Specs ---- */}
      {/* Optional, and empty for most products — collapsed unless it already
          has rows, so a new product isn't a wall of fields nobody fills in.
          <details> rather than a state toggle: it keeps the section in the
          document (so browser find-in-page and form validation still reach it)
          and needs no JavaScript. */}
      <details open={specs.length > 0} className={ADMIN_CARD}>
        <summary className="cursor-pointer text-lg font-semibold">
          المواصفات{' '}
          <span className="text-sm font-normal text-gray-500">
            (اختياري{specs.length > 0 ? ` — ${specs.length}` : ''})
          </span>
        </summary>

        {suggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">إضافة سريعة:</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.key}
                type="button"
                className={ADMIN_CHIP}
                onClick={() =>
                  setSpecs((current) => [
                    ...current,
                    { label: suggestion.label, value: '' },
                  ])
                }
              >
                + {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-4">
          {specs.map((spec, index) => (
            <div key={index} className="rounded-lg border border-gray-300 p-3">
              {/* No "key" field. It is derived from the label on save — it was
                  never information the admin had, only a shape the schema
                  wanted. */}
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">التسمية</span>
                  <input
                    value={spec.label}
                    dir="auto"
                    placeholder="الشاشة"
                    onChange={(e) =>
                      setSpecs((c) => c.map((sp, i) => (i === index ? { ...sp, label: e.target.value } : sp)))
                    }
                    className={ADMIN_INPUT}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">القيمة</span>
                  <input
                    value={spec.value}
                    dir="ltr"
                    placeholder='6.3" ProMotion 120 Hz'
                    onChange={(e) =>
                      setSpecs((c) => c.map((s, i) => (i === index ? { ...s, value: e.target.value } : s)))
                    }
                    className={ADMIN_INPUT}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setSpecs((c) => c.filter((_, i) => i !== index))}
                  className="self-end rounded border border-red-300 px-3 py-2 text-xs text-red-700"
                >
                  حذف
                </button>
              </div>

            </div>
          ))}

          <button
            type="button"
            className={ADMIN_BTN_GHOST}
            onClick={() => setSpecs((c) => [...c, { label: '', value: '' }])}
          >
            + مواصفة مخصّصة
          </button>
        </div>
      </details>

      {/* ---- Highlights ---- */}
      <details open={highlights.length > 0} className={ADMIN_CARD}>
        <summary className="cursor-pointer text-lg font-semibold">
          الأرقام البارزة{' '}
          <span className="text-sm font-normal text-gray-500">
            (اختياري{highlights.length > 0 ? ` — ${highlights.length}` : ''})
          </span>
        </summary>
        <p className="mt-1 text-xs text-gray-500">تظهر في البطاقة المميّزة فقط (48 · MP · الكاميرا).</p>

        <div className="mt-4 flex flex-col gap-4">
          {highlights.map((highlight, index) => (
            <div key={index} className="rounded-lg border border-gray-300 p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">القيمة</span>
                  <input
                    value={highlight.value}
                    dir="ltr"
                    onChange={(e) =>
                      setHighlights((c) => c.map((h, i) => (i === index ? { ...h, value: e.target.value } : h)))
                    }
                    className={ADMIN_INPUT}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">التسمية</span>
                  <input
                    value={highlight.label}
                    dir="auto"
                    placeholder="الكاميرا"
                    onChange={(e) =>
                      setHighlights((c) => c.map((h, i) => (i === index ? { ...h, label: e.target.value } : h)))
                    }
                    className={ADMIN_INPUT}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">الوحدة (اختياري)</span>
                  <input
                    value={highlight.unit}
                    dir="ltr"
                    onChange={(e) =>
                      setHighlights((c) => c.map((h, i) => (i === index ? { ...h, unit: e.target.value } : h)))
                    }
                    className={ADMIN_INPUT}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setHighlights((c) => c.filter((_, i) => i !== index))}
                  className="self-end rounded border border-red-300 px-3 py-2 text-xs text-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className={ADMIN_BTN_GHOST}
            onClick={() => setHighlights((c) => [...c, { value: '', unit: '', label: '' }])}
          >
            + رقم بارز
          </button>
        </div>
      </details>

      {/* ---- Variants ---- */}
      <section className={ADMIN_CARD}>
        <h2 className="text-lg font-semibold">النسخ</h2>
        <p className="mt-1 text-xs text-gray-500">
          كل نسخة = لون + سعة + سعر. الصورة الأولى في كل نسخة هي صورة البطاقة.
        </p>

        <div className="mt-4 flex flex-col gap-5">
          {variants.map((variant, index) => (
            <div key={variant.id} className="rounded-lg border border-gray-300 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">النسخة {index + 1}</h3>
                <button
                  type="button"
                  disabled={variants.length === 1}
                  onClick={() => setVariants((c) => c.filter((_, i) => i !== index))}
                  className={`${ADMIN_BTN_DANGER} !px-3 !py-1.5 !text-xs`}
                >
                  حذف النسخة
                </button>
              </div>

              {/* The colour's slug AND its hex are both derived from the name
                  now — neither is a field. See <ColourPicker />. */}
              <div className="mt-4">
                <ColourPicker
                  label={variant.colourLabel}
                  onChange={({ label, hex }) =>
                    patchVariant(index, { colourLabel: label, colourHex: hex })
                  }
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">السعة (اختياري)</span>
                  <input
                    value={variant.storage}
                    dir="ltr"
                    placeholder="256 GB"
                    onChange={(e) => patchVariant(index, { storage: e.target.value })}
                    className={ADMIN_INPUT}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">السعر (دج)</span>
                  <input
                    type="number"
                    min={0}
                    value={variant.price}
                    dir="ltr"
                    onChange={(e) => patchVariant(index, { price: e.target.value })}
                    className={ADMIN_INPUT}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">السعر قبل الخصم (اختياري)</span>
                  <input
                    type="number"
                    min={0}
                    value={variant.compareAt}
                    dir="ltr"
                    onChange={(e) => patchVariant(index, { compareAt: e.target.value })}
                    className={ADMIN_INPUT}
                  />
                  {/* Mirrors productVariantSchema's own .refine, surfaced as you
                      type rather than only at submit. */}
                  {variant.compareAt.trim() !== '' &&
                  Number(variant.compareAt) <= Number(variant.price) ? (
                    <span className="text-xs text-red-700">
                      يجب أن يكون أكبر من السعر الحالي.
                    </span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">التوفّر</span>
                  <select
                    value={variant.stock}
                    onChange={(e) => patchVariant(index, { stock: e.target.value })}
                    className={ADMIN_INPUT}
                  >
                    {stockStatusSchema.options.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4">
                <span className="text-xs text-gray-500">الصور</span>
                <div className="mt-2">
                  <ImageUploader
                    images={variant.images}
                    onChange={(images) => patchVariant(index, { images })}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className={ADMIN_BTN_GHOST}
            onClick={() => setVariants((c) => [...c, newVariant()])}
          >
            + نسخة
          </button>
        </div>
      </section>

      {saved ? (
        <p
          role="status"
          dir="auto"
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          تم الحفظ.{' '}
          {published
            ? 'المنتج منشور وظاهر في المتجر.'
            : 'المنتج محفوظ كمسودة — لن يظهر في المتجر حتى تفعّل «منشور».'}
        </p>
      ) : null}

      {errors.length > 0 ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">تعذّر الحفظ:</p>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-gray-300 bg-white/95 px-6 py-4 backdrop-blur">
        {/* Back to the product LIST, not the dashboard — cancelling an edit
            should land where the edit started. */}
        <Link href="/admin/products" className={ADMIN_BTN_GHOST}>
          إلغاء
        </Link>
        {/* The default for a NEW product is unpublished, which is the safe
            default — but nothing said so, so a product could be filled in,
            saved successfully, and then 404 on its own storefront URL with no
            explanation. This states it where the decision is made. */}
        {!published ? (
          <span dir="auto" className="text-xs text-gold-text">
            مسودة — لن يظهر في المتجر.
          </span>
        ) : null}
        <button type="submit" disabled={pending} className={ADMIN_BTN_PRIMARY}>
          {pending ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
      </div>
    </form>
  );
}
