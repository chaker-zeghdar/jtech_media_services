# Product photos

Drop transparent-background PNGs (or WebP) in this folder, then list the path in
`content/products.ts` under the matching variant's `images` array:

```ts
{
  id: 'iphone-16-pro-desert-256',
  // …
  images: ['/products/iphone-16-pro.png'],
}
```

That is the whole change. No component edits, no config.

## Currently expected filenames

Every product ships with `images: []` today, which makes `<ProductImage />`
render its branded empty state (gray bed + JTECH mark at 12% + product name)
instead of a broken image. The homepage was composed around these six cutouts —
adding them fills the visually prominent slots:

| File                                | Product slug            | Where it appears           |
| ----------------------------------- | ----------------------- | -------------------------- |
| `iphone-16-pro.png`                 | `iphone-16-pro`         | Hero **and** featured block |
| `galaxy-z-fold-8.png`               | `galaxy-z-fold-8`       | Range rail, best sellers   |
| `galaxy-z-fold-8-ultra.png`         | `galaxy-z-fold-8-ultra` | Range rail                 |
| `galaxy-z-flip-8.png`               | `galaxy-z-flip-8`       | Range rail, best sellers   |
| `galaxy-watch-ultra-2.png`          | `galaxy-watch-ultra-2`  | Range rail                 |
| `galaxy-watch-9.png`                | `galaxy-watch-9`        | Range rail, best sellers   |

## Requirements

- **Transparent background.** The image sits directly on the `#F5F5F7` bed and
  gets `drop-shadow(0 24px 28px rgba(0,0,0,.14))`; a white box behind the product
  makes that shadow look like a mistake.
- **Square-ish framing**, product centred, ~10% breathing room on every side.
  The beds are `aspect-square` (hero, featured, quick view) and `aspect-[4/5]`
  (cards), and the image is `object-contain`.
- **At least 1200px on the long edge** for the hero shot, 800px for cards.
  `next/image` generates AVIF and WebP at the sizes each slot requests, so a
  single large source is enough — don't pre-resize.
- **No shadows or reflections baked in.** The component adds the shadow, and a
  second one underneath reads as a halo, which the brief rules out.
