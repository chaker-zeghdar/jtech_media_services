import type { CategorySlug } from './schemas';

/**
 * Per-category spec-row suggestions for the admin form.
 *
 * Purely an authoring convenience: clicking "+ الشاشة" appends a pre-labelled
 * spec row so the admin only fills in the `value`. It constrains nothing — the
 * specs editor still takes fully custom rows, and nothing on the storefront
 * reads this file.
 *
 * Arabic only, and a plain string rather than `{ar,fr,en}`: these are chips the
 * admin clicks while working in the shop's own language, not storefront copy
 * that gets translated. The labels are the ones already in use in the
 * catalogue, so a suggested row matches what the shop has always written.
 *
 * The same key can legitimately differ by category: `screen` is "الشاشة" on a
 * phone but "الشاشة الداخلية" on a Samsung foldable, which is why this is keyed
 * by category rather than being one flat key→label table.
 */
export const CATEGORY_SPEC_SUGGESTIONS: Record<CategorySlug, { key: string; label: string }[]> = {
  iphone: [
    { key: 'screen', label: 'الشاشة' },
    { key: 'chip', label: 'المعالج' },
    { key: 'camera', label: 'الكاميرا' },
    { key: 'battery', label: 'البطارية' },
    { key: 'sim', label: 'الشريحة' },
  ],
  samsung: [
    { key: 'screen', label: 'الشاشة الداخلية' },
    { key: 'cover', label: 'الشاشة الخارجية' },
    { key: 'battery', label: 'البطارية' },
    { key: 'camera', label: 'الكاميرا' },
    { key: 'ram', label: 'الذاكرة' },
    { key: 'zoom', label: 'الزوم' },
    { key: 'pen', label: 'القلم' },
    { key: 'case', label: 'الهيكل' },
    { key: 'water', label: 'مقاومة الماء' },
    { key: 'health', label: 'الصحة' },
  ],
  android: [
    { key: 'screen', label: 'الشاشة' },
    { key: 'chip', label: 'المعالج' },
    { key: 'camera', label: 'الكاميرا' },
    { key: 'battery', label: 'البطارية' },
    { key: 'charge', label: 'الشحن' },
  ],
  pc: [
    { key: 'cpu', label: 'المعالج' },
    { key: 'gpu', label: 'بطاقة الرسومات' },
    { key: 'screen', label: 'الشاشة' },
    { key: 'battery', label: 'البطارية' },
  ],
  /**
   * Deliberately not empty: a charger, a cable, a case and a pair of earbuds
   * share almost no spec vocabulary, but these nine are every key the accessory
   * catalogue actually used, and offering them beats free-typing each one.
   */
  accessories: [
    { key: 'capacity', label: 'السعة' },
    { key: 'output', label: 'الخرج' },
    { key: 'battery', label: 'البطارية' },
    { key: 'anc', label: 'إلغاء الضجيج' },
    { key: 'audio', label: 'الصوت' },
    { key: 'material', label: 'المادة' },
    { key: 'hardness', label: 'الصلابة' },
    { key: 'length', label: 'الطول' },
    { key: 'speed', label: 'السرعة' },
  ],
};
