import { z } from 'zod';
import { type Wilaya, parseContent, wilayaSchema } from './schemas';

/**
 * Mirrors table `wilayas` — all 69.
 *
 * Algeria went from 48 to 58 wilayas in 2019, and from 58 to 69 in 2026 when
 * the decentralisation decree split 11 new ones out of existing wilayas. Both
 * expansions are reflected here.
 *
 * ── This file is NOT dead ─────────────────────────────────────────────────
 *
 * `submitOrder` reads fees from the DATABASE, and a comment there says so. But
 * `<CheckoutView />` still imports this list to populate the wilaya dropdown —
 * so a wilaya missing here is a wilaya a customer cannot select, no matter what
 * the database holds. It has to stay in step with the table.
 *
 * Fees are grouped into four tiers rather than typed out 69 times, so the
 * *reason* a fee differs stays visible. The exported value is still a flat list
 * of rows identical in shape to what Supabase will return.
 *
 *   local    — Batna itself, delivered by the shop
 *   standard — the headline rate quoted on the homepage: 350 desk / 600 home
 *   extended — high plateaus and the near south
 *   sahara   — the deep south, where the carriers charge substantially more
 */
const FEE_TIERS = {
  local: { deskFee: 200, homeFee: 350 },
  standard: { deskFee: 350, homeFee: 600 },
  extended: { deskFee: 450, homeFee: 750 },
  sahara: { deskFee: 600, homeFee: 1000 },
} as const;

type Tier = keyof typeof FEE_TIERS;

/** [code, Arabic name, French name, tier] */
const WILAYA_ROWS: ReadonlyArray<readonly [number, string, string, Tier]> = [
  [1, 'أدرار', 'Adrar', 'sahara'],
  [2, 'الشلف', 'Chlef', 'standard'],
  [3, 'الأغواط', 'Laghouat', 'extended'],
  [4, 'أم البواقي', 'Oum El Bouaghi', 'standard'],
  [5, 'باتنة', 'Batna', 'local'],
  [6, 'بجاية', 'Béjaïa', 'standard'],
  [7, 'بسكرة', 'Biskra', 'standard'],
  [8, 'بشار', 'Béchar', 'sahara'],
  [9, 'البليدة', 'Blida', 'standard'],
  [10, 'البويرة', 'Bouira', 'standard'],
  [11, 'تمنراست', 'Tamanrasset', 'sahara'],
  [12, 'تبسة', 'Tébessa', 'standard'],
  [13, 'تلمسان', 'Tlemcen', 'standard'],
  [14, 'تيارت', 'Tiaret', 'standard'],
  [15, 'تيزي وزو', 'Tizi Ouzou', 'standard'],
  [16, 'الجزائر', 'Alger', 'standard'],
  [17, 'الجلفة', 'Djelfa', 'extended'],
  [18, 'جيجل', 'Jijel', 'standard'],
  [19, 'سطيف', 'Sétif', 'standard'],
  [20, 'سعيدة', 'Saïda', 'standard'],
  [21, 'سكيكدة', 'Skikda', 'standard'],
  [22, 'سيدي بلعباس', 'Sidi Bel Abbès', 'standard'],
  [23, 'عنابة', 'Annaba', 'standard'],
  [24, 'قالمة', 'Guelma', 'standard'],
  [25, 'قسنطينة', 'Constantine', 'standard'],
  [26, 'المدية', 'Médéa', 'standard'],
  [27, 'مستغانم', 'Mostaganem', 'standard'],
  [28, 'المسيلة', "M'Sila", 'standard'],
  [29, 'معسكر', 'Mascara', 'standard'],
  [30, 'ورقلة', 'Ouargla', 'extended'],
  [31, 'وهران', 'Oran', 'standard'],
  [32, 'البيض', 'El Bayadh', 'extended'],
  [33, 'إليزي', 'Illizi', 'sahara'],
  [34, 'برج بوعريريج', 'Bordj Bou Arreridj', 'standard'],
  [35, 'بومرداس', 'Boumerdès', 'standard'],
  [36, 'الطارف', 'El Tarf', 'standard'],
  [37, 'تندوف', 'Tindouf', 'sahara'],
  [38, 'تيسمسيلت', 'Tissemsilt', 'standard'],
  [39, 'الوادي', 'El Oued', 'extended'],
  [40, 'خنشلة', 'Khenchela', 'standard'],
  [41, 'سوق أهراس', 'Souk Ahras', 'standard'],
  [42, 'تيبازة', 'Tipaza', 'standard'],
  [43, 'ميلة', 'Mila', 'standard'],
  [44, 'عين الدفلى', 'Aïn Defla', 'standard'],
  [45, 'النعامة', 'Naâma', 'extended'],
  [46, 'عين تموشنت', 'Aïn Témouchent', 'standard'],
  [47, 'غرداية', 'Ghardaïa', 'extended'],
  [48, 'غليزان', 'Relizane', 'standard'],
  [49, 'المغير', "El M'Ghair", 'extended'],
  [50, 'المنيعة', 'El Meniaa', 'sahara'],
  [51, 'أولاد جلال', 'Ouled Djellal', 'extended'],
  [52, 'برج باجي مختار', 'Bordj Baji Mokhtar', 'sahara'],
  [53, 'بني عباس', 'Béni Abbès', 'sahara'],
  [54, 'تيميمون', 'Timimoun', 'sahara'],
  [55, 'تقرت', 'Touggourt', 'extended'],
  [56, 'جانت', 'Djanet', 'sahara'],
  [57, 'عين صالح', 'In Salah', 'sahara'],
  [58, 'عين قزام', 'In Guezzam', 'sahara'],
  /* The 11 wilayas created by the 2026 decentralisation decree, each split out
     of an existing wilaya. Their tier is inherited from that "mother" wilaya,
     which is what the SQL migration seeded the database with — so the two
     agree. These are a STARTING POINT, not confirmed carrier pricing: a new
     wilaya may well cost differently to reach than the one it was carved from.
     Re-check them against the courier's rate card. */
  [59, 'أفلو', 'Aflou', 'extended'],            // ← 3  Laghouat
  [60, 'بريكة', 'Barika', 'local'],             // ← 5  Batna
  [61, 'القنطرة', 'El Kantara', 'standard'],    // ← 7  Biskra
  [62, 'بئر العاتر', 'Bir El Ater', 'standard'], // ← 12 Tébessa
  [63, 'العريشة', 'El Aricha', 'standard'],     // ← 13 Tlemcen
  [64, 'قصر الشلالة', 'Ksar Chellala', 'standard'], // ← 14 Tiaret
  [65, 'عين وسارة', 'Aïn Oussera', 'extended'], // ← 17 Djelfa
  [66, 'مسعد', 'Messaad', 'extended'],          // ← 17 Djelfa
  [67, 'قصر البخاري', 'Ksar El Boukhari', 'standard'], // ← 26 Médéa
  [68, 'بوسعادة', 'Bou Saâda', 'standard'],     // ← 28 M'Sila
  [69, 'الأبيض سيدي الشيخ', 'El Abiodh Sidi Cheikh', 'extended'], // ← 32 El Bayadh
];

/** Mirrors table `wilayas`, ordered by code. */
export const wilayas: readonly Wilaya[] = parseContent(
  'content/wilayas.ts',
  z.array(wilayaSchema).length(69, 'Algeria has exactly 69 wilayas'),
  WILAYA_ROWS.map(([code, nameAr, nameFr, tier]) => ({
    code,
    nameAr,
    nameFr,
    ...FEE_TIERS[tier],
  })),
);

export function getWilaya(code: number): Wilaya | undefined {
  return wilayas.find((wilaya) => wilaya.code === code);
}

/** Cheapest and dearest home-delivery fee — used for the "من X" delivery copy. */
export const homeFeeRange = {
  min: Math.min(...wilayas.map((w) => w.homeFee)),
  max: Math.max(...wilayas.map((w) => w.homeFee)),
};

export const deskFeeRange = {
  min: Math.min(...wilayas.map((w) => w.deskFee)),
  max: Math.max(...wilayas.map((w) => w.deskFee)),
};
