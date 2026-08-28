'use client';

import { COLOUR_PRESETS, colourHexFor, findColourPreset } from '@/content/colours';
import { ADMIN_INPUT } from './styles';

/**
 * One control for a variant's colour, replacing the free-text name and the raw
 * hex input that used to sit beside it.
 *
 * Those two were independent, and the form defaulted the hex to `#000000` — so
 * an admin who typed "white" and never opened the colour picker saved a white
 * phone painted black, which is exactly what a live product had. Here the name
 * and the hex are set together by one click and cannot disagree.
 *
 * The custom escape hatch still exists, because the shop will eventually stock
 * a colour no preset covers. It takes a name only: the swatch is derived from
 * that name (`colourHexFor`), falling back to a neutral grey. An unrecognised
 * colour shows as grey rather than as a confidently wrong colour, and the admin
 * is never asked for a hex code.
 */
export function ColourPicker({
  label,
  onChange,
}: {
  label: string;
  onChange: (next: { label: string; hex: string }) => void;
}) {
  const preset = findColourPreset(label);
  // "Custom" once something is typed that no preset matches.
  const isCustom = label.trim().length > 0 && !preset;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-500">اللون</span>

      <div className="flex flex-wrap gap-2">
        {COLOUR_PRESETS.map((option) => {
          const selected = preset?.slug === option.slug;
          return (
            <button
              key={option.slug}
              type="button"
              aria-pressed={selected}
              title={option.label}
              onClick={() => onChange({ label: option.label, hex: option.hex })}
              className={`inline-flex items-center gap-2 rounded-full border py-1.5 pe-3 ps-1.5 text-xs transition-colors ${
                selected ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-5 w-5 shrink-0 rounded-full border border-gray-300"
                style={{ backgroundColor: option.hex }}
              />
              {option.label}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={isCustom}
          onClick={() => onChange({ label: '', hex: colourHexFor('') })}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            isCustom ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'
          }`}
        >
          لون آخر (مخصص)
        </button>
      </div>

      {/* Only for the rare colour no preset covers. The hex is derived from
          whatever is typed, so there is still nothing to keep in sync. */}
      {isCustom || label.trim().length === 0 ? (
        <label className="mt-1 flex items-center gap-2">
          <span className="sr-only">اسم اللون</span>
          <span
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-full border border-gray-300"
            style={{ backgroundColor: colourHexFor(label) }}
          />
          <input
            value={label}
            dir="auto"
            placeholder="اكتب اسم اللون"
            onChange={(event) =>
              onChange({ label: event.target.value, hex: colourHexFor(event.target.value) })
            }
            className={ADMIN_INPUT}
          />
        </label>
      ) : null}
    </div>
  );
}
