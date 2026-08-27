import type { CategorySlug, LocalizedText } from './schemas';

/**
 * Per-category spec-row suggestions for the admin form.
 *
 * Purely an authoring convenience: clicking "+ الشاشة" appends a pre-labelled
 * spec row so the admin only fills in the `value`. It constrains nothing — the
 * specs editor still takes fully custom rows, and nothing on the storefront
 * reads this file.
 *
 * ── Why the labels are copied, not written ─────────────────────────────────
 *
 * Every label below was lifted from the spec rows already live in the
 * catalogue (read back out of `products.specs` in Supabase, which is where the
 * original `content/products.ts` values landed at migration). Inventing fresh
 * translations for keys that already have shop-approved ones is how two
 * spellings of "الشاشة" end up in the same table.
 *
 * Note the same key can legitimately differ by category: `screen` is "الشاشة"
 * on a phone but "الشاشة الداخلية" on a Samsung foldable, and `battery` is
 * "Autonomy" on an iPhone but "Battery" on a Galaxy. That is why this is keyed
 * by category rather than being one flat key→label table.
 */
export const CATEGORY_SPEC_SUGGESTIONS: Record<
  CategorySlug,
  { key: string; label: LocalizedText }[]
> = {
  iphone: [
    { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' } },
    { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' } },
    { key: 'camera', label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' } },
    { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' } },
    { key: 'sim', label: { ar: 'الشريحة', fr: 'SIM', en: 'SIM' } },
  ],
  samsung: [
    { key: 'screen', label: { ar: 'الشاشة الداخلية', fr: 'Écran interne', en: 'Inner display' } },
    { key: 'cover', label: { ar: 'الشاشة الخارجية', fr: 'Écran externe', en: 'Cover display' } },
    { key: 'battery', label: { ar: 'البطارية', fr: 'Batterie', en: 'Battery' } },
    { key: 'camera', label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' } },
    { key: 'ram', label: { ar: 'الذاكرة', fr: 'Mémoire', en: 'Memory' } },
    { key: 'zoom', label: { ar: 'الزوم', fr: 'Zoom', en: 'Zoom' } },
    { key: 'pen', label: { ar: 'القلم', fr: 'Stylet', en: 'Stylus' } },
    { key: 'case', label: { ar: 'الهيكل', fr: 'Boîtier', en: 'Case' } },
    { key: 'water', label: { ar: 'مقاومة الماء', fr: 'Étanchéité', en: 'Water resistance' } },
    { key: 'health', label: { ar: 'الصحة', fr: 'Santé', en: 'Health' } },
  ],
  android: [
    { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' } },
    { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' } },
    { key: 'camera', label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' } },
    { key: 'battery', label: { ar: 'البطارية', fr: 'Batterie', en: 'Battery' } },
    { key: 'charge', label: { ar: 'الشحن', fr: 'Charge', en: 'Charging' } },
  ],
  pc: [
    { key: 'cpu', label: { ar: 'المعالج', fr: 'Processeur', en: 'Processor' } },
    { key: 'gpu', label: { ar: 'بطاقة الرسومات', fr: 'Carte graphique', en: 'Graphics' } },
    { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' } },
    { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' } },
  ],
  /**
   * Deliberately not empty, unlike the sketch in the brief. A charger, a cable,
   * a case and a pair of earbuds share almost no spec vocabulary, so there is
   * no useful "accessories" set — but these nine are every key the existing
   * accessory catalogue actually uses, and offering them beats free-typing an
   * Arabic label and then hand-translating it into two more locales.
   */
  accessories: [
    { key: 'capacity', label: { ar: 'السعة', fr: 'Capacité', en: 'Capacity' } },
    { key: 'output', label: { ar: 'الخرج', fr: 'Sortie', en: 'Output' } },
    { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' } },
    { key: 'anc', label: { ar: 'إلغاء الضجيج', fr: 'Réduction de bruit', en: 'Noise cancelling' } },
    { key: 'audio', label: { ar: 'الصوت', fr: 'Audio', en: 'Audio' } },
    { key: 'material', label: { ar: 'المادة', fr: 'Matière', en: 'Material' } },
    { key: 'hardness', label: { ar: 'الصلابة', fr: 'Dureté', en: 'Hardness' } },
    { key: 'length', label: { ar: 'الطول', fr: 'Longueur', en: 'Length' } },
    { key: 'speed', label: { ar: 'السرعة', fr: 'Débit', en: 'Speed' } },
  ],
};
