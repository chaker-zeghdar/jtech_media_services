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

## What the card expects of the image

- **Transparent background.** The card supplies its own bed; a white rectangle
  inside a rounded card is the one thing that will look wrong.
- **Portrait or square**, roughly 4:5 to 1:1. The card renders it with
  `object-contain` against the card's inline-end, so a landscape shot will just
  sit smaller rather than crop badly.
- **Around 900px on the long edge** is plenty — the card paints it at ~290px on
  desktop, and `next/image` serves a downscale from there.
- The product should read at a glance at ~180px tall. A single hero device beats
  a family shot.

Until a file is listed, the card renders the category's `icon` on a gold-tint
disc instead. That is a deliberate fallback, not a placeholder to be rushed —
the section is complete and shippable without any of these.
