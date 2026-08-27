'use client';

import type { LocalizedText } from '@/content/schemas';
import { ADMIN_INPUT, ADMIN_LABEL } from './styles';

type LocalizedInputProps = {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  /** Tighter presentation, for labels nested inside a spec/variant row. */
  compact?: boolean;
};

const LOCALES = [
  { key: 'ar', label: 'العربية', dir: 'rtl' },
  { key: 'fr', label: 'Français', dir: 'ltr' },
  { key: 'en', label: 'English', dir: 'ltr' },
] as const;

/**
 * Three inputs — ar / fr / en — for one `LocalizedText`.
 *
 * ── The mirroring, and why it is a starting point not a translation ────────
 *
 * `localizedTextSchema` requires all three locales to be non-empty, because
 * the storefront genuinely serves all three and a missing one is a blank on a
 * live page. But this form cannot know the French for an Arabic phrase the
 * admin just invented.
 *
 * So typing in the Arabic field mirrors into `fr`/`en` **only while those still
 * match it** — enough to satisfy the schema and let the admin save, with each
 * field independently editable afterwards. The moment a locale is edited by
 * hand it stops matching, and mirroring stops for it. Divergence is read from
 * the values themselves rather than tracked in a separate `touched` set, so
 * there is no second piece of state to keep in sync with the first.
 *
 * The honest limitation, worth saying out loud to the client rather than
 * hiding: a custom label saved without editing fr/en ships Arabic text on the
 * French and English sites. The alternatives were blocking custom entries
 * outright, or silently writing empty strings that fail validation later — both
 * worse. Suggested spec rows sidestep it entirely by carrying real translations
 * (see content/categoryFields.ts).
 */
export function LocalizedInput({ label, value, onChange, multiline, compact }: LocalizedInputProps) {
  function set(locale: keyof LocalizedText, next: string) {
    if (locale !== 'ar') {
      onChange({ ...value, [locale]: next });
      return;
    }

    // Mirror ar → fr/en for any locale the admin hasn't diverged yet.
    const mirrored = { ...value, ar: next };
    if (value.fr === value.ar) mirrored.fr = next;
    if (value.en === value.ar) mirrored.en = next;
    onChange(mirrored);
  }

  const Field = multiline ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-2">
      <span className={compact ? 'text-xs text-gray-500' : ADMIN_LABEL}>{label}</span>
      <div className={compact ? 'grid gap-2 sm:grid-cols-3' : 'grid gap-3 sm:grid-cols-3'}>
        {LOCALES.map((locale) => (
          <label key={locale.key} className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-gray-500">{locale.label}</span>
            <Field
              dir={locale.dir}
              rows={multiline ? 3 : undefined}
              value={value[locale.key]}
              onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                set(locale.key, event.target.value)
              }
              className={ADMIN_INPUT}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
