# Category cutouts

One transparent-background PNG (or WebP) per category, shown in the lower half of
the browse card in `شنو راك تقلّب عليه؟` / "What are you looking for?".

Drop the file here, then add the path to `content/categories.ts`:

```ts
{
  slug: 'iphone',
  icon: 'iphone',
  position: 1,
  image: '/categories/iphone.png',   // <- this line
  name: { … },
  tagline: { … },
}
```

That is the whole change. No component edits, no config.

## Expected filenames

| Slug          | File                            |
| ------------- | ------------------------------- |
| `iphone`      | `/categories/iphone.png`        |
| `samsung`     | `/categories/samsung.png`       |
| `android`     | `/categories/android.png`       |
| `pc`          | `/categories/pc.png`            |
| `accessories` | `/categories/accessories.png`   |

## Optional: the zoomed crop

By default the cutout renders whole, sitting on the card's bottom edge. To get
the other treatment the reference uses — zoomed in so the product bleeds past the
card's sides and bottom — add `imageCrop` alongside the path:

```ts
image: '/categories/iphone.png',
imageCrop: { scale: 2.8, focusY: '4%' },
```

`scale` is the zoom; `focusY` is the point it happens about, as a percentage down
the artwork (small values keep the top of the product in frame). Both are tuned
per file, because the right zoom depends on how much empty margin a given cutout
leaves around its subject — not on the design.

**A cropped card needs a much bigger file.** The card paints a zoomed image at
`300px × scale`, so at `scale: 2.8` it is painting ~840px wide and wants ~1700px
on the long edge to stay sharp on a retina screen. A 370px file that looks fine
uncropped will look soft here — that is the file, not the crop.

## What the card expects of the image

- **Transparent background.** The card supplies its own bed; a white rectangle
  inside a rounded card is the one thing that will look wrong.
- **Portrait or square**, roughly 4:5 to 1:1. The card renders it with
  `object-contain` against the card's inline-end, so a landscape shot will just
  sit smaller rather than crop badly.
- **Around 900px on the long edge** is plenty for an uncropped card — it paints
  at ~300px on desktop and `next/image` serves a downscale from there. A cropped
  card wants ~1700px; see above.
- The product should read at a glance at ~180px tall. A single hero device beats
  a family shot.

Until a file is listed, the card renders the category's `icon` on a gold-tint
disc instead. That is a deliberate fallback, not a placeholder to be rushed —
the section is complete and shippable without any of these.
