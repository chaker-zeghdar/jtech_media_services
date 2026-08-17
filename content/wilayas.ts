import { z } from 'zod';
import { type Wilaya, parseContent, wilayaSchema } from './schemas';

/**
 * Mirrors table `wilayas` — all 58, including the 10 created in 2019.
 *
 * Fees are grouped into four tiers rather than typed out 58 times, so the
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
];

/** Mirrors table `wilayas`, ordered by code. */
export const wilayas: readonly Wilaya[] = parseContent(
  'content/wilayas.ts',
  z.array(wilayaSchema).length(58, 'Algeria has exactly 58 wilayas'),
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
