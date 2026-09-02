import sharp from 'sharp';

/**
 * Normalizes a product photo to ONE consistent shape, so the storefront never
 * has to paper over inconsistent source material with `object-fit`.
 *
 * ── Why this exists at all ─────────────────────────────────────────────────
 *
 * "The photo looks wrong in its card" was fixed three times in CSS before this
 * module, and each fix only moved the symptom, because the site shows a
 * product's main photo in two boxes of different shapes — <ProductCard />'s bed
 * and <ProductGallery />'s frame — while the catalogue holds two different
 * KINDS of source image:
 *
 *   cutouts      a product on a flat background (a transparent PNG, or a
 *                studio render on white), usually with a lot of dead margin
 *                baked in — `cover` zooms hard into them
 *   photographs  a raw phone shot, 3:4, product on a desk or a piece of
 *                fabric, no uniform background anywhere — `contain` letterboxes
 *                them and shows bars
 *
 * No single `object-fit` is right for both, which is the whole reason the bug
 * kept coming back. Normalizing the IMAGES makes the question go away: every
 * stored photo becomes a square, so a square box with `contain` fits it exactly
 * and there is nothing left to crop or letterbox.
 *
 * ── The two strategies ─────────────────────────────────────────────────────
 *
 * `inset` — the image has a flat background to trim away. Trim to the product,
 * then centre it on a square canvas with a deliberate {@link MARGIN}. This is
 * what makes a rail of cutouts sit at a consistent size instead of each one
 * being whatever margin its exporter happened to leave.
 *
 * `crop` — a real photograph. There is no flat background to trim and no honest
 * way to know where the product ends, so centre-crop to square instead. A 3:4
 * phone shot loses 12.5% off the top and bottom, which is a far smaller
 * intervention than padding it would be: padding a photograph means baking bars
 * around it, and bars are the exact complaint this module exists to end.
 *
 * ── Idempotent ─────────────────────────────────────────────────────────────
 *
 * Running this over its own output is a no-op in shape: the margin it adds is
 * uniform, so a re-run's trim removes exactly it and the pad puts exactly it
 * back; a square centre-cropped to square is unchanged. That matters because
 * both the batch script and the upload path call it, and a re-run must not
 * shave a little more off the margin each time.
 */

/** Output edge, in pixels. Square, always. */
export const CANVAS = 1200;

/**
 * Fraction of the canvas left empty on EACH side under the `inset` strategy.
 *
 * 7% of 1200 is 84px, so the product occupies the middle 86% of the frame.
 * Sized against the gallery rather than the card, because the gallery is where
 * a photo is painted largest and a mean margin would read as a crop:
 * <ProductGallery /> requests 400px at desktop, where 7% lands at 28 painted px.
 */
export const MARGIN = 0.07;

/**
 * How far a pixel may differ from the sampled corner colour and still count as
 * background. Sharp's own default, kept deliberately rather than lowered.
 *
 * Measured over the 55 images in the live catalogue: at 10 the trim finds every
 * real border (transparent margins and studio white alike, 26–86% of area kept)
 * while leaving every textured photo background at 93–100%. At 1 it misses the
 * slightly noisy white behind `realme-c85` and `infinix-smart-10` and calls
 * them photographs; at 25 it starts eating real photo content, taking
 * `true-earbuds` down to 79.5% with no border there to remove.
 */
export const TRIM_THRESHOLD = 10;

/**
 * Below this share of surviving area, the trim is taken to have found a real
 * border. Paired with {@link MAX_CORNER_SPREAD} — both must agree.
 *
 * The catalogue separates cleanly on either side of it: the most stubborn true
 * cutout keeps 82.8% and the most trimmable true photograph keeps 93.2%, so 90%
 * sits in open space rather than on top of a cluster.
 */
export const CUTOUT_AREA_CEILING = 0.9;

/**
 * Largest per-channel difference allowed between the corner samples for an
 * opaque image to be treated as a cutout. Applied to the best THREE of the four
 * — see {@link spreadOf}.
 *
 * This is the guard that keeps a photograph from being padded. `inset` fills
 * its margin with a flat colour, which is only invisible if the image's own
 * background is flat too; run it on a shot of a product on textured fabric and
 * the flat pad meets visible texture at a hard seam. Corners that agree to
 * within 12 levels mean a studio sweep; a real scene disagrees by far more.
 *
 * Images WITH alpha skip this test — transparency is proof of a cutout, and
 * they pad with transparency rather than a sampled colour, so there is no seam
 * to protect against.
 */
export const MAX_CORNER_SPREAD = 12;

export type NormalizeStrategy = 'inset' | 'crop';

export type NormalizedImage = {
  buffer: Buffer;
  contentType: 'image/webp';
  extension: 'webp';
  width: number;
  height: number;
  strategy: NormalizeStrategy;
  /** Share of the source area the trim kept, 0–1. 1 means it found no border. */
  trimKept: number;
  /** Corner disagreement ignoring the worst corner, 0–255. See `spreadOf`. */
  cornerSpread: number;
  /** Source dimensions AFTER EXIF orientation — see {@link orientedSize}. */
  source: { width: number; height: number; hasAlpha: boolean };
};

/** Fully transparent, for padding a source that already carries alpha. */
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const;

/**
 * The dimensions the image will actually have once EXIF orientation is applied.
 *
 * Not a convenience — a correctness fix. `.metadata()` reports the dimensions as
 * STORED, and does so even through `.rotate()` and even with the `autoOrient`
 * constructor option: a 4032x3024 phone shot tagged orientation 6 reports
 * 4032x3024 from all three while the pipeline actually emits 3024x4032.
 * Computing an `extract` offset from the reported numbers throws
 * "bad extract area" on exactly the files the client uploads most.
 *
 * Orientations 5–8 are the ones that involve a quarter turn.
 */
function orientedSize(meta: sharp.Metadata): { width: number; height: number } {
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const quarterTurned = (meta.orientation ?? 1) >= 5;
  return quarterTurned ? { width: height, height: width } : { width, height };
}

/** Mean RGB of a small square at each of the four corners, alpha over white. */
async function cornerSamples(
  input: Buffer,
  width: number,
  height: number,
): Promise<Array<[number, number, number]>> {
  const probe = Math.max(1, Math.round(Math.min(width, height) * 0.02));
  const spots: Array<[number, number]> = [
    [0, 0],
    [width - probe, 0],
    [0, height - probe],
    [width - probe, height - probe],
  ];

  const samples: Array<[number, number, number]> = [];
  for (const [left, top] of spots) {
    const { data } = await sharp(input)
      .rotate()
      .extract({ left, top, width: probe, height: probe })
      .flatten({ background: '#ffffff' })
      .resize(1, 1, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    samples.push([data[0] ?? 255, data[1] ?? 255, data[2] ?? 255]);
  }
  return samples;
}

/** Largest per-channel spread across a set of samples. */
function rawSpread(samples: Array<[number, number, number]>): number {
  if (samples.length === 0) return 0;
  let spread = 0;
  // Literal indices, not a counter: a `number` index into a tuple widens to
  // `number | undefined` under `noUncheckedIndexedAccess`.
  for (const channel of [0, 1, 2] as const) {
    const values = samples.map((sample) => sample[channel]);
    spread = Math.max(spread, Math.max(...values) - Math.min(...values));
  }
  return spread;
}

/**
 * Corner disagreement, ignoring the single worst corner.
 *
 * Requiring all four to agree is too strict for the marketing renders the
 * client actually uploads: `hoco-w35` is a product on pure white with the
 * brand's wordmark set into the top-left corner, so three corners agree exactly
 * (spread 0) and the fourth reads as black. Taking all four, that image scores
 * 19 and is treated as a photograph, losing the inset margin every other cutout
 * gets.
 *
 * Dropping one outlier is a permissive change, so it was checked against every
 * original in the bucket rather than assumed safe: of 115 objects it moves
 * exactly the two hoco-w35 files, and no photograph — a real scene disagrees in
 * more than one corner, so discarding a single one does not rescue it.
 */
function spreadOf(samples: Array<[number, number, number]>): number {
  if (samples.length <= 3) return rawSpread(samples);
  let best = Infinity;
  for (let drop = 0; drop < samples.length; drop++) {
    best = Math.min(best, rawSpread(samples.filter((_, index) => index !== drop)));
  }
  return best;
}

/**
 * The colour an opaque `inset` pads with: the MEDIAN corner, per channel.
 *
 * Median rather than mean, for the same reason {@link spreadOf} drops an
 * outlier — averaging in `hoco-w35`'s black wordmark corner would tint the
 * whole margin grey and put a visible edge around a product that is on pure
 * white. The median ignores one disagreeing corner outright.
 */
function medianOf(samples: Array<[number, number, number]>): { r: number; g: number; b: number } {
  const median = (channel: 0 | 1 | 2) => {
    const values = samples.map((sample) => sample[channel]).sort((a, b) => a - b);
    if (values.length === 0) return 255;
    const mid = values.length >> 1;
    return values.length % 2 === 0
      ? Math.round(((values[mid - 1] ?? 255) + (values[mid] ?? 255)) / 2)
      : (values[mid] ?? 255);
  };
  return { r: median(0), g: median(1), b: median(2) };
}

/**
 * Turns one source photo into the canonical 1200x1200 WebP.
 *
 * `.rotate()` with no argument, on every pipeline that reads the source, is not
 * optional: the client shoots on a phone, so the catalogue is full of files
 * stored 4032x3024 landscape that are portrait ONLY by EXIF tag. Sharp does not
 * apply that tag unless asked, and a pipeline that skips it crops the wrong
 * axis entirely.
 */
export async function normalizeProductImage(input: Buffer): Promise<NormalizedImage> {
  const meta = await sharp(input).metadata();
  const { width: sourceWidth, height: sourceHeight } = orientedSize(meta);
  const hasAlpha = Boolean(meta.hasAlpha);

  if (sourceWidth === 0 || sourceHeight === 0) {
    throw new Error('Unreadable image: no dimensions.');
  }

  // Trim first: its yield is half the classifier, and the `inset` branch reuses
  // the result rather than trimming a second time.
  let trimmed: Buffer;
  let trimWidth = sourceWidth;
  let trimHeight = sourceHeight;
  try {
    const result = await sharp(input)
      .rotate()
      .trim({ threshold: TRIM_THRESHOLD })
      .toBuffer({ resolveWithObject: true });
    trimmed = result.data;
    trimWidth = result.info.width;
    trimHeight = result.info.height;
  } catch {
    // Sharp throws when a trim would consume the whole image — a frame that is
    // one flat colour end to end. Nothing to trim, and nothing to inset either.
    trimmed = await sharp(input).rotate().toBuffer();
  }

  const trimKept = (trimWidth * trimHeight) / (sourceWidth * sourceHeight);
  const samples = await cornerSamples(input, sourceWidth, sourceHeight);
  const cornerSpread = spreadOf(samples);

  const strategy: NormalizeStrategy =
    hasAlpha || (trimKept < CUTOUT_AREA_CEILING && cornerSpread <= MAX_CORNER_SPREAD)
      ? 'inset'
      : 'crop';

  let pipeline: sharp.Sharp;
  if (strategy === 'crop') {
    // Deliberately the ORIGINAL, not `trimmed`: a photograph that happened to
    // trim a few percent should be cropped from its full frame, not from a
    // slightly nibbled one.
    pipeline = sharp(input).rotate().resize(CANVAS, CANVAS, { fit: 'cover', position: 'centre' });
  } else {
    const inner = Math.round(CANVAS * (1 - 2 * MARGIN));
    const fitted = await sharp(trimmed)
      .resize(inner, inner, { fit: 'inside', withoutEnlargement: false })
      .toBuffer({ resolveWithObject: true });

    const padX = CANVAS - fitted.info.width;
    const padY = CANVAS - fitted.info.height;

    pipeline = sharp(fitted.data).extend({
      top: Math.floor(padY / 2),
      bottom: Math.ceil(padY / 2),
      left: Math.floor(padX / 2),
      right: Math.ceil(padX / 2),
      background: hasAlpha ? TRANSPARENT : { ...medianOf(samples), alpha: 1 },
    });
  }

  // `alphaQuality: 100` because lossy alpha on a cutout's edge produces a
  // visible halo against a bed of a different colour, which is precisely the
  // composite this module promises to keep clean.
  const buffer = await pipeline.webp({ quality: 90, alphaQuality: 100, effort: 4 }).toBuffer();

  return {
    buffer,
    contentType: 'image/webp',
    extension: 'webp',
    width: CANVAS,
    height: CANVAS,
    strategy,
    trimKept,
    cornerSpread,
    source: { width: sourceWidth, height: sourceHeight, hasAlpha },
  };
}
