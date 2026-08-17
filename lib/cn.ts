type ClassValue = string | number | false | null | undefined;

/**
 * Minimal class joiner. Deliberately not `clsx` — this is the whole feature set
 * the project needs and it keeps the dependency list honest.
 */
export function cn(...values: ClassValue[]): string {
  let out = '';
  for (const value of values) {
    if (!value && value !== 0) continue;
    out = out ? `${out} ${value}` : String(value);
  }
  return out;
}
