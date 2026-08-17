import { z } from 'zod';
import { type CategorySlug, type Product, parseContent, productSchema } from './schemas';

/**
 * Mirrors tables `products` + `product_variants`.
 *
 * ── Product images ────────────────────────────────────────────────────────────
 * Six products carry photos; everything else has `images: []`, which is a valid
 * state — <ProductImage /> renders the branded empty state (gray bed + JTECH mark
 * + product name) rather than a broken <img> or a gray rectangle.
 *
 * ⚠️ THE SUPPLIED CUTOUTS ARE LOW RESOLUTION. They were extracted from the
 * client's Instagram posts:
 *
 *   iphone-16-pro.png          520×677   ← the only one usable above ~250px
 *   galaxy-z-fold-8-ultra.png  173×261
 *   galaxy-z-fold-8.png        150×256
 *   galaxy-z-flip-8.png        186×201
 *   galaxy-watch-ultra-2.png   157×185
 *   galaxy-watch-9.png         111×179
 *
 * They prove the layout and are fine to show the client; they are NOT launch
 * assets and must not be upscaled — upscaling adds artefacts, not detail. The
 * hero deliberately stays on the empty state for this reason (see Hero.tsx), and
 * the mosaic renders them well below their intrinsic size.
 *
 * One known compromise: only one shot exists per product, so every colour variant
 * of the iPhone 16 Pro points at the same white-titanium photo. Per-colour shots
 * replace them when the client's photographs arrive.
 *
 * To add a photo: drop a PNG into `public/products/` and list its path on the
 * matching variant. Nothing else changes. See README.md § "Adding product photos".
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Prices are DZD integers reflecting Batna market rates.
 */
const PRODUCTS_INPUT = [
  /* ------------------------------------------------------------------ iPhone */
  {
    slug: 'iphone-16-pro',
    brand: 'Apple',
    category: 'iphone',
    badges: ['new', 'bestseller'],
    featured: true,
    bestseller: true,
    name: { ar: 'آيفون 16 برو', fr: 'iPhone 16 Pro', en: 'iPhone 16 Pro' },
    description: {
      ar: 'التيتانيوم، معالج A18 Pro، وكاميرا 48 ميغابيكسل تصوّر بجودة سينمائية. هذا هو الآيفون اللي كنت تستنى فيه.',
      fr: 'Titane, puce A18 Pro et un capteur 48 Mpx qui filme comme une caméra de cinéma. L’iPhone que vous attendiez.',
      en: 'Titanium, the A18 Pro chip and a 48MP sensor that shoots like a cinema camera. The iPhone worth waiting for.',
    },
    highlights: [
      {
        value: '48',
        unit: 'MP',
        label: { ar: 'الكاميرا الرئيسية', fr: 'Capteur principal', en: 'Main camera' },
      },
      { value: 'A18', unit: 'Pro', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' } },
      {
        value: '12',
        unit: 'MP',
        label: { ar: 'كاميرا السيلفي', fr: 'Caméra frontale', en: 'Front camera' },
      },
      {
        value: '3',
        unit: null,
        label: { ar: 'عدسات خلفية', fr: 'Objectifs arrière', en: 'Rear lenses' },
      },
    ],
    specs: [
      {
        key: 'screen',
        label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' },
        value: '6.3" ProMotion 120 Hz',
      },
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'A18 Pro' },
      {
        key: 'camera',
        label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' },
        value: '48 MP + 48 MP + 12 MP',
      },
      {
        key: 'battery',
        label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' },
        value: '27 h',
      },
      { key: 'sim', label: { ar: 'الشريحة', fr: 'SIM', en: 'SIM' }, value: 'Nano-SIM + eSIM' },
    ],
    variants: [
      {
        id: 'iphone-16-pro-desert-256',
        colour: {
          slug: 'desert-titanium',
          hex: '#BFA48F',
          label: { ar: 'تيتانيوم صحراوي', fr: 'Titane désert', en: 'Desert Titanium' },
        },
        storage: '256 GB',
        price: 289000,
        compareAt: 305000,
        stock: 'in-stock',
        images: ['/products/iphone-16-pro.png'],
      },
      {
        id: 'iphone-16-pro-natural-256',
        colour: {
          slug: 'natural-titanium',
          hex: '#C2BCB2',
          label: { ar: 'تيتانيوم طبيعي', fr: 'Titane naturel', en: 'Natural Titanium' },
        },
        storage: '256 GB',
        price: 289000,
        compareAt: null,
        stock: 'in-stock',
        images: ['/products/iphone-16-pro.png'],
      },
      {
        id: 'iphone-16-pro-black-512',
        colour: {
          slug: 'black-titanium',
          hex: '#3B3B3D',
          label: { ar: 'تيتانيوم أسود', fr: 'Titane noir', en: 'Black Titanium' },
        },
        storage: '512 GB',
        price: 329000,
        compareAt: null,
        stock: 'low-stock',
        images: ['/products/iphone-16-pro.png'],
      },
      {
        id: 'iphone-16-pro-white-256',
        colour: {
          slug: 'white-titanium',
          hex: '#F2F1ED',
          label: { ar: 'تيتانيوم أبيض', fr: 'Titane blanc', en: 'White Titanium' },
        },
        storage: '256 GB',
        price: 289000,
        compareAt: null,
        stock: 'in-stock',
        images: ['/products/iphone-16-pro.png'],
      },
    ],
  },
  {
    slug: 'iphone-16-pro-max',
    brand: 'Apple',
    category: 'iphone',
    badges: ['new'],
    featured: false,
    bestseller: true,
    name: { ar: 'آيفون 16 برو ماكس', fr: 'iPhone 16 Pro Max', en: 'iPhone 16 Pro Max' },
    description: {
      ar: 'أكبر شاشة وأطوى بطارية في تاريخ الآيفون. إذا راك تصوّر بزاف ولا تلعب، هذا هو.',
      fr: 'Le plus grand écran et la meilleure autonomie jamais vus sur un iPhone. Pour ceux qui filment ou jouent beaucoup.',
      en: 'The biggest screen and longest battery Apple has shipped. For heavy shooters and heavy gamers.',
    },
    highlights: [],
    specs: [
      {
        key: 'screen',
        label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' },
        value: '6.9" ProMotion 120 Hz',
      },
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'A18 Pro' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' }, value: '33 h' },
    ],
    variants: [
      {
        id: 'iphone-16-pro-max-desert-256',
        colour: {
          slug: 'desert-titanium',
          hex: '#BFA48F',
          label: { ar: 'تيتانيوم صحراوي', fr: 'Titane désert', en: 'Desert Titanium' },
        },
        storage: '256 GB',
        price: 339000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'iphone-16-pro-max-black-512',
        colour: {
          slug: 'black-titanium',
          hex: '#3B3B3D',
          label: { ar: 'تيتانيوم أسود', fr: 'Titane noir', en: 'Black Titanium' },
        },
        storage: '512 GB',
        price: 379000,
        compareAt: null,
        stock: 'low-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'iphone-16',
    brand: 'Apple',
    category: 'iphone',
    badges: ['bestseller'],
    featured: false,
    bestseller: true,
    name: { ar: 'آيفون 16', fr: 'iPhone 16', en: 'iPhone 16' },
    description: {
      ar: 'زر التحكم في الكاميرا، معالج A18، وألوان جديدة. أحسن آيفون بالنسبة للسعر.',
      fr: 'Commande de caméra, puce A18 et de nouvelles couleurs. Le meilleur rapport qualité-prix de la gamme.',
      en: 'Camera Control, the A18 chip and fresh colours. The best value in the lineup.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.1" OLED' },
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'A18' },
      {
        key: 'camera',
        label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' },
        value: '48 MP + 12 MP',
      },
    ],
    variants: [
      {
        id: 'iphone-16-ultramarine-128',
        colour: {
          slug: 'ultramarine',
          hex: '#4C6EA8',
          label: { ar: 'أزرق بحري', fr: 'Outremer', en: 'Ultramarine' },
        },
        storage: '128 GB',
        price: 219000,
        compareAt: 232000,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'iphone-16-teal-256',
        colour: {
          slug: 'teal',
          hex: '#A8C8C0',
          label: { ar: 'أزرق مخضر', fr: 'Sarcelle', en: 'Teal' },
        },
        storage: '256 GB',
        price: 245000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'iphone-16-black-128',
        colour: {
          slug: 'black',
          hex: '#35363A',
          label: { ar: 'أسود', fr: 'Noir', en: 'Black' },
        },
        storage: '128 GB',
        price: 219000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'iphone-15',
    brand: 'Apple',
    category: 'iphone',
    badges: ['promo'],
    featured: false,
    bestseller: false,
    name: { ar: 'آيفون 15', fr: 'iPhone 15', en: 'iPhone 15' },
    description: {
      ar: 'الجزيرة الديناميكية وكاميرا 48 ميغابيكسل بسعر ولّى معقول بزاف.',
      fr: 'Dynamic Island et capteur 48 Mpx, à un prix devenu vraiment raisonnable.',
      en: 'Dynamic Island and a 48MP sensor, at a price that has finally become sensible.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.1" OLED' },
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'A16 Bionic' },
    ],
    variants: [
      {
        id: 'iphone-15-blue-128',
        colour: {
          slug: 'blue',
          hex: '#D3E0E4',
          label: { ar: 'أزرق فاتح', fr: 'Bleu', en: 'Blue' },
        },
        storage: '128 GB',
        price: 178000,
        compareAt: 195000,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'iphone-15-black-128',
        colour: {
          slug: 'black',
          hex: '#35363A',
          label: { ar: 'أسود', fr: 'Noir', en: 'Black' },
        },
        storage: '128 GB',
        price: 178000,
        compareAt: 195000,
        stock: 'low-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'iphone-13',
    brand: 'Apple',
    category: 'iphone',
    badges: ['promo'],
    featured: false,
    bestseller: false,
    name: { ar: 'آيفون 13', fr: 'iPhone 13', en: 'iPhone 13' },
    description: {
      ar: 'باقي قوي، باقي يقبل التحديثات، وسعره ولّى في المتناول. مدخل مثالي لعالم آبل.',
      fr: 'Toujours performant, toujours mis à jour, et enfin abordable. L’entrée idéale dans l’écosystème Apple.',
      en: 'Still fast, still getting updates, and now genuinely affordable. The best way into the Apple ecosystem.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.1" OLED' },
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'A15 Bionic' },
    ],
    variants: [
      {
        id: 'iphone-13-midnight-128',
        colour: {
          slug: 'midnight',
          hex: '#25282C',
          label: { ar: 'أسود منتصف الليل', fr: 'Minuit', en: 'Midnight' },
        },
        storage: '128 GB',
        price: 128000,
        compareAt: 142000,
        stock: 'in-stock',
        images: [],
      },
    ],
  },

  /* ----------------------------------------------------------------- Samsung */
  {
    slug: 'galaxy-z-fold-8',
    brand: 'Samsung',
    category: 'samsung',
    badges: ['new'],
    featured: false,
    bestseller: true,
    name: { ar: 'غالاكسي Z فولد 8', fr: 'Galaxy Z Fold 8', en: 'Galaxy Z Fold 8' },
    description: {
      ar: 'تليفون وتابليت في جهاز واحد. تحلّه تلقى شاشة 7.6 بوصة تخدم عليها كي اللابتوب.',
      fr: 'Un téléphone et une tablette dans un seul appareil. Déplié : 7,6 pouces où l’on travaille comme sur un portable.',
      en: 'A phone and a tablet in one. Unfolded it gives you 7.6 inches you can actually work on.',
    },
    highlights: [],
    specs: [
      {
        key: 'screen',
        label: { ar: 'الشاشة الداخلية', fr: 'Écran interne', en: 'Inner display' },
        value: '7.6" 120 Hz',
      },
      {
        key: 'cover',
        label: { ar: 'الشاشة الخارجية', fr: 'Écran externe', en: 'Cover display' },
        value: '6.3" 120 Hz',
      },
      { key: 'ram', label: { ar: 'الذاكرة', fr: 'Mémoire', en: 'Memory' }, value: '12 GB RAM' },
    ],
    variants: [
      {
        id: 'galaxy-z-fold-8-silver-256',
        colour: {
          slug: 'silver-shadow',
          hex: '#B8BABE',
          label: { ar: 'فضي', fr: 'Argent', en: 'Silver Shadow' },
        },
        storage: '256 GB',
        price: 425000,
        compareAt: null,
        stock: 'in-stock',
        images: ['/products/galaxy-z-fold-8.png'],
      },
      {
        id: 'galaxy-z-fold-8-navy-512',
        colour: {
          slug: 'navy',
          hex: '#2C3A52',
          label: { ar: 'كحلي', fr: 'Bleu marine', en: 'Navy' },
        },
        storage: '512 GB',
        price: 468000,
        compareAt: null,
        stock: 'low-stock',
        images: ['/products/galaxy-z-fold-8.png'],
      },
    ],
  },
  {
    slug: 'galaxy-z-fold-8-ultra',
    brand: 'Samsung',
    category: 'samsung',
    badges: ['new', 'last-units'],
    featured: false,
    bestseller: false,
    name: {
      ar: 'غالاكسي Z فولد 8 ألترا',
      fr: 'Galaxy Z Fold 8 Ultra',
      en: 'Galaxy Z Fold 8 Ultra',
    },
    description: {
      ar: 'النسخة الكبيرة: كاميرا 200 ميغابيكسل وقلم S Pen داخل الجهاز. أقوى قابل للطي في السوق.',
      fr: 'La version XL : capteur 200 Mpx et S Pen intégré. Le pliable le plus abouti du marché.',
      en: 'The XL version: a 200MP sensor and an integrated S Pen. The most capable foldable on the market.',
    },
    highlights: [],
    specs: [
      {
        key: 'screen',
        label: { ar: 'الشاشة الداخلية', fr: 'Écran interne', en: 'Inner display' },
        value: '8.0" 120 Hz',
      },
      {
        key: 'camera',
        label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' },
        value: '200 MP',
      },
      { key: 'pen', label: { ar: 'القلم', fr: 'Stylet', en: 'Stylus' }, value: 'S Pen' },
    ],
    variants: [
      {
        id: 'galaxy-z-fold-8-ultra-titanium-512',
        colour: {
          slug: 'titanium-black',
          hex: '#43454A',
          label: { ar: 'تيتانيوم أسود', fr: 'Titane noir', en: 'Titanium Black' },
        },
        storage: '512 GB',
        price: 498000,
        compareAt: null,
        stock: 'low-stock',
        images: ['/products/galaxy-z-fold-8-ultra.png'],
      },
    ],
  },
  {
    slug: 'galaxy-z-flip-8',
    brand: 'Samsung',
    category: 'samsung',
    badges: ['bestseller'],
    featured: false,
    bestseller: true,
    name: { ar: 'غالاكسي Z فليب 8', fr: 'Galaxy Z Flip 8', en: 'Galaxy Z Flip 8' },
    description: {
      ar: 'يتطوى ويدخل جيبك بلا ما تحس بيه، والشاشة الخارجية تخليك تصوّر سيلفي بالكاميرا الأصلية.',
      fr: 'Il se plie et disparaît dans la poche, et l’écran externe permet de faire des selfies avec le capteur principal.',
      en: 'Folds down and vanishes into a pocket, and the cover screen lets you shoot selfies on the main camera.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.7" 120 Hz' },
      {
        key: 'cover',
        label: { ar: 'الشاشة الخارجية', fr: 'Écran externe', en: 'Cover display' },
        value: '3.4"',
      },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Batterie', en: 'Battery' }, value: '4000 mAh' },
    ],
    variants: [
      {
        id: 'galaxy-z-flip-8-blue-256',
        colour: {
          slug: 'blue',
          hex: '#4A6FA5',
          label: { ar: 'أزرق', fr: 'Bleu', en: 'Blue' },
        },
        storage: '256 GB',
        price: 235000,
        compareAt: 249000,
        stock: 'in-stock',
        images: ['/products/galaxy-z-flip-8.png'],
      },
      {
        id: 'galaxy-z-flip-8-coral-256',
        colour: {
          slug: 'coral-red',
          hex: '#D9584E',
          label: { ar: 'أحمر مرجاني', fr: 'Rouge corail', en: 'Coral Red' },
        },
        storage: '256 GB',
        price: 235000,
        compareAt: null,
        stock: 'in-stock',
        images: ['/products/galaxy-z-flip-8.png'],
      },
      {
        id: 'galaxy-z-flip-8-mint-512',
        colour: {
          slug: 'mint',
          hex: '#B7CFC0',
          label: { ar: 'أخضر نعناعي', fr: 'Menthe', en: 'Mint' },
        },
        storage: '512 GB',
        price: 268000,
        compareAt: null,
        stock: 'low-stock',
        images: ['/products/galaxy-z-flip-8.png'],
      },
    ],
  },
  {
    slug: 'galaxy-s25-ultra',
    brand: 'Samsung',
    category: 'samsung',
    badges: ['bestseller'],
    featured: false,
    bestseller: true,
    name: { ar: 'غالاكسي S25 ألترا', fr: 'Galaxy S25 Ultra', en: 'Galaxy S25 Ultra' },
    description: {
      ar: 'كاميرا 200 ميغابيكسل وزوم 100x، وقلم S Pen. الأندرويد الكامل بلا نقصان.',
      fr: 'Capteur 200 Mpx, zoom 100x et S Pen. L’Android complet, sans compromis.',
      en: 'A 200MP sensor, 100x zoom and the S Pen. Android with nothing left out.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.9" 120 Hz' },
      { key: 'camera', label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' }, value: '200 MP' },
      { key: 'zoom', label: { ar: 'الزوم', fr: 'Zoom', en: 'Zoom' }, value: '100x' },
    ],
    variants: [
      {
        id: 'galaxy-s25-ultra-black-256',
        colour: {
          slug: 'titanium-black',
          hex: '#43454A',
          label: { ar: 'تيتانيوم أسود', fr: 'Titane noir', en: 'Titanium Black' },
        },
        storage: '256 GB',
        price: 355000,
        compareAt: 372000,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'galaxy-s25-ultra-gray-512',
        colour: {
          slug: 'titanium-gray',
          hex: '#8E9095',
          label: { ar: 'تيتانيوم رمادي', fr: 'Titane gris', en: 'Titanium Gray' },
        },
        storage: '512 GB',
        price: 392000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'galaxy-watch-ultra-2',
    brand: 'Samsung',
    category: 'samsung',
    badges: ['new'],
    featured: false,
    bestseller: false,
    name: { ar: 'غالاكسي ووتش ألترا 2', fr: 'Galaxy Watch Ultra 2', en: 'Galaxy Watch Ultra 2' },
    description: {
      ar: 'هيكل تيتانيوم، مقاومة للماء 100 متر، وبطارية توصل 100 ساعة. مصنوعة للرياضة الحقيقية.',
      fr: 'Boîtier titane, étanche à 100 m et jusqu’à 100 h d’autonomie. Faite pour le sport, pas pour la vitrine.',
      en: 'Titanium case, 100m water resistance and up to 100 hours of battery. Built for actual training.',
    },
    highlights: [],
    specs: [
      { key: 'case', label: { ar: 'الهيكل', fr: 'Boîtier', en: 'Case' }, value: '47 mm Titanium' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' }, value: '100 h' },
      { key: 'water', label: { ar: 'مقاومة الماء', fr: 'Étanchéité', en: 'Water resistance' }, value: '10 ATM' },
    ],
    variants: [
      {
        id: 'galaxy-watch-ultra-2-gray-47',
        colour: {
          slug: 'titanium-gray',
          hex: '#7D7F84',
          label: { ar: 'تيتانيوم رمادي', fr: 'Titane gris', en: 'Titanium Gray' },
        },
        storage: '47 mm',
        price: 86000,
        compareAt: null,
        stock: 'in-stock',
        images: ['/products/galaxy-watch-ultra-2.png'],
      },
      {
        id: 'galaxy-watch-ultra-2-white-47',
        colour: {
          slug: 'titanium-white',
          hex: '#E3E2DE',
          label: { ar: 'تيتانيوم أبيض', fr: 'Titane blanc', en: 'Titanium White' },
        },
        storage: '47 mm',
        price: 86000,
        compareAt: null,
        stock: 'low-stock',
        images: ['/products/galaxy-watch-ultra-2.png'],
      },
    ],
  },
  {
    slug: 'galaxy-watch-9',
    brand: 'Samsung',
    category: 'samsung',
    badges: ['bestseller'],
    featured: false,
    bestseller: true,
    name: { ar: 'غالاكسي ووتش 9', fr: 'Galaxy Watch 9', en: 'Galaxy Watch 9' },
    description: {
      ar: 'تقيس النبض والنوم والضغط، وتخلّي التليفون في جيبك. تتوافق مع كل أندرويد.',
      fr: 'Pouls, sommeil, tension — et le téléphone reste dans la poche. Compatible avec tous les Android.',
      en: 'Heart rate, sleep and blood pressure tracking, so your phone can stay in your pocket. Works with any Android.',
    },
    highlights: [],
    specs: [
      { key: 'case', label: { ar: 'الهيكل', fr: 'Boîtier', en: 'Case' }, value: '44 mm' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' }, value: '40 h' },
      { key: 'health', label: { ar: 'الصحة', fr: 'Santé', en: 'Health' }, value: 'ECG + BIA' },
    ],
    variants: [
      {
        id: 'galaxy-watch-9-silver-44',
        colour: {
          slug: 'silver',
          hex: '#C9CBCF',
          label: { ar: 'فضي', fr: 'Argent', en: 'Silver' },
        },
        storage: '44 mm',
        price: 52000,
        compareAt: 58000,
        stock: 'in-stock',
        images: ['/products/galaxy-watch-9.png'],
      },
      {
        id: 'galaxy-watch-9-graphite-40',
        colour: {
          slug: 'graphite',
          hex: '#4A4B4F',
          label: { ar: 'رمادي غرافيت', fr: 'Graphite', en: 'Graphite' },
        },
        storage: '40 mm',
        price: 48000,
        compareAt: null,
        stock: 'in-stock',
        images: ['/products/galaxy-watch-9.png'],
      },
    ],
  },
  {
    slug: 'galaxy-a56',
    brand: 'Samsung',
    category: 'samsung',
    badges: [],
    featured: false,
    bestseller: false,
    name: { ar: 'غالاكسي A56', fr: 'Galaxy A56', en: 'Galaxy A56' },
    description: {
      ar: 'سامسونغ بسعر معقول: شاشة AMOLED، بطارية تدوم يومين، و6 سنين تحديثات.',
      fr: 'Le Samsung au bon prix : écran AMOLED, deux jours d’autonomie et six ans de mises à jour.',
      en: 'The sensible Samsung: an AMOLED screen, two days of battery and six years of updates.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.7" AMOLED' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Batterie', en: 'Battery' }, value: '5000 mAh' },
    ],
    variants: [
      {
        id: 'galaxy-a56-graphite-256',
        colour: {
          slug: 'graphite',
          hex: '#3F4145',
          label: { ar: 'رمادي غرافيت', fr: 'Graphite', en: 'Graphite' },
        },
        storage: '8 GB / 256 GB',
        price: 68000,
        compareAt: 74000,
        stock: 'in-stock',
        images: [],
      },
    ],
  },

  /* ----------------------------------------------------------------- Android */
  {
    slug: 'redmi-note-13',
    brand: 'Xiaomi',
    category: 'android',
    badges: ['bestseller', 'promo'],
    featured: false,
    bestseller: true,
    name: { ar: 'ريدمي نوت 13', fr: 'Redmi Note 13', en: 'Redmi Note 13' },
    description: {
      ar: 'الأكثر مبيعاً عندنا وما شي بلا سبب: كاميرا 108 ميغابيكسل وبطارية تكمّل معك اليومين.',
      fr: 'Notre meilleure vente, et ce n’est pas un hasard : capteur 108 Mpx et deux jours d’autonomie.',
      en: 'Our best seller, and not by accident: a 108MP camera and two days of battery.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.67" AMOLED' },
      { key: 'camera', label: { ar: 'الكاميرا', fr: 'Caméra', en: 'Camera' }, value: '108 MP' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Batterie', en: 'Battery' }, value: '5000 mAh' },
    ],
    variants: [
      {
        id: 'redmi-note-13-black-128',
        colour: {
          slug: 'midnight-black',
          hex: '#2A2C31',
          label: { ar: 'أسود', fr: 'Noir', en: 'Midnight Black' },
        },
        storage: '8 GB / 128 GB',
        price: 44500,
        compareAt: 49000,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'redmi-note-13-teal-256',
        colour: {
          slug: 'ocean-teal',
          hex: '#2E6D6E',
          label: { ar: 'أزرق محيطي', fr: 'Bleu océan', en: 'Ocean Teal' },
        },
        storage: '8 GB / 256 GB',
        price: 51000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'redmi-note-14-pro',
    brand: 'Xiaomi',
    category: 'android',
    badges: ['new'],
    featured: false,
    bestseller: false,
    name: { ar: 'ريدمي نوت 14 برو', fr: 'Redmi Note 14 Pro', en: 'Redmi Note 14 Pro' },
    description: {
      ar: 'شاشة منحنية، شحن 67 واط، وحماية IP68. قريب من الفلاڨشيب بنص السعر.',
      fr: 'Écran incurvé, charge 67 W et certification IP68. Du flagship à moitié prix.',
      en: 'A curved screen, 67W charging and IP68. Flagship feel at half the price.',
    },
    highlights: [],
    specs: [
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.67" AMOLED' },
      { key: 'charge', label: { ar: 'الشحن', fr: 'Charge', en: 'Charging' }, value: '67 W' },
    ],
    variants: [
      {
        id: 'redmi-note-14-pro-purple-256',
        colour: {
          slug: 'lavender',
          hex: '#8A7BB8',
          label: { ar: 'بنفسجي', fr: 'Lavande', en: 'Lavender' },
        },
        storage: '8 GB / 256 GB',
        price: 62000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'poco-x7-pro',
    brand: 'Poco',
    category: 'android',
    badges: [],
    featured: false,
    bestseller: false,
    name: { ar: 'بوكو X7 برو', fr: 'Poco X7 Pro', en: 'Poco X7 Pro' },
    description: {
      ar: 'إذا تلعب ببزاف: معالج Dimensity 8400 وشحن 90 واط يعمّر البطارية في 40 دقيقة.',
      fr: 'Pour les joueurs : Dimensity 8400 et charge 90 W qui remplit la batterie en 40 minutes.',
      en: 'For gamers: a Dimensity 8400 and 90W charging that fills the battery in 40 minutes.',
    },
    highlights: [],
    specs: [
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'Dimensity 8400' },
      { key: 'charge', label: { ar: 'الشحن', fr: 'Charge', en: 'Charging' }, value: '90 W' },
    ],
    variants: [
      {
        id: 'poco-x7-pro-yellow-256',
        colour: {
          slug: 'poco-yellow',
          hex: '#E0B33C',
          label: { ar: 'أصفر', fr: 'Jaune', en: 'Yellow' },
        },
        storage: '8 GB / 256 GB',
        price: 58000,
        compareAt: 63000,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'honor-x9c',
    brand: 'Honor',
    category: 'android',
    badges: [],
    featured: false,
    bestseller: false,
    name: { ar: 'هونور X9c', fr: 'Honor X9c', en: 'Honor X9c' },
    description: {
      ar: 'شاشة ما تتكسّرش بساهل وبطارية 6600 مللي أمبير. مصنوع باش يعيش معك سنين.',
      fr: 'Un écran qui résiste vraiment et une batterie de 6600 mAh. Conçu pour durer.',
      en: 'A screen that genuinely survives drops and a 6600mAh battery. Built to last years.',
    },
    highlights: [],
    specs: [
      { key: 'battery', label: { ar: 'البطارية', fr: 'Batterie', en: 'Battery' }, value: '6600 mAh' },
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.78" AMOLED' },
    ],
    variants: [
      {
        id: 'honor-x9c-black-256',
        colour: {
          slug: 'black',
          hex: '#2C2E33',
          label: { ar: 'أسود', fr: 'Noir', en: 'Black' },
        },
        storage: '8 GB / 256 GB',
        price: 51000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },

  /* ---------------------------------------------------------------- Computers */
  {
    slug: 'macbook-air-m4',
    brand: 'Apple',
    category: 'pc',
    badges: ['new'],
    featured: false,
    bestseller: true,
    name: { ar: 'ماكبوك إير M4', fr: 'MacBook Air M4', en: 'MacBook Air M4' },
    description: {
      ar: 'خفيف، بلا مروحة، وبطارية تكمّل نهار كامل من الخدمة. أحسن لابتوب للطلبة والمصممين.',
      fr: 'Léger, sans ventilateur, une journée entière d’autonomie. Le meilleur portable pour les étudiants et les créatifs.',
      en: 'Light, fanless, and a full working day of battery. The best laptop for students and designers.',
    },
    highlights: [],
    specs: [
      { key: 'chip', label: { ar: 'المعالج', fr: 'Puce', en: 'Chip' }, value: 'Apple M4' },
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '13.6" Liquid Retina' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' }, value: '18 h' },
    ],
    variants: [
      {
        id: 'macbook-air-m4-sky-256',
        colour: {
          slug: 'sky-blue',
          hex: '#B4C4D8',
          label: { ar: 'أزرق سماوي', fr: 'Bleu ciel', en: 'Sky Blue' },
        },
        storage: '16 GB / 256 GB',
        price: 268000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'macbook-air-m4-midnight-512',
        colour: {
          slug: 'midnight',
          hex: '#2E3641',
          label: { ar: 'أسود منتصف الليل', fr: 'Minuit', en: 'Midnight' },
        },
        storage: '16 GB / 512 GB',
        price: 312000,
        compareAt: null,
        stock: 'low-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'hp-victus-15',
    brand: 'HP',
    category: 'pc',
    badges: ['bestseller'],
    featured: false,
    bestseller: false,
    name: { ar: 'HP فيكتوس 15', fr: 'HP Victus 15', en: 'HP Victus 15' },
    description: {
      ar: 'كارت RTX 4050 وشاشة 144 هرتز. يلعب كل الألعاب الحالية بلا مشاكل.',
      fr: 'RTX 4050 et écran 144 Hz. Il fait tourner tous les jeux du moment sans broncher.',
      en: 'An RTX 4050 and a 144Hz screen. It runs everything current without complaining.',
    },
    highlights: [],
    specs: [
      { key: 'gpu', label: { ar: 'كارت الڨرافيك', fr: 'Carte graphique', en: 'Graphics' }, value: 'RTX 4050 6 GB' },
      { key: 'cpu', label: { ar: 'المعالج', fr: 'Processeur', en: 'Processor' }, value: 'Core i5-13420H' },
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '15.6" 144 Hz' },
    ],
    variants: [
      {
        id: 'hp-victus-15-black-512',
        colour: {
          slug: 'mica-silver',
          hex: '#54565B',
          label: { ar: 'فضي', fr: 'Argent', en: 'Mica Silver' },
        },
        storage: '16 GB / 512 GB',
        price: 165000,
        compareAt: 179000,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'lenovo-ideapad-slim-3',
    brand: 'Lenovo',
    category: 'pc',
    badges: ['promo'],
    featured: false,
    bestseller: false,
    name: { ar: 'لينوفو آيديا باد سليم 3', fr: 'Lenovo IdeaPad Slim 3', en: 'Lenovo IdeaPad Slim 3' },
    description: {
      ar: 'للدراسة والمكتب: Ryzen 5، شاشة FHD، ووزن خفيف تحمله معك للجامعة كل نهار.',
      fr: 'Études et bureautique : Ryzen 5, écran FHD et un poids qu’on emporte à la fac tous les jours.',
      en: 'Study and office work: a Ryzen 5, an FHD screen, and light enough to carry to class daily.',
    },
    highlights: [],
    specs: [
      { key: 'cpu', label: { ar: 'المعالج', fr: 'Processeur', en: 'Processor' }, value: 'Ryzen 5 7520U' },
      { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '15.6" FHD' },
    ],
    variants: [
      {
        id: 'lenovo-ideapad-slim-3-grey-512',
        colour: {
          slug: 'arctic-grey',
          hex: '#8C8E92',
          label: { ar: 'رمادي', fr: 'Gris', en: 'Arctic Grey' },
        },
        storage: '8 GB / 512 GB',
        price: 78000,
        compareAt: 85000,
        stock: 'in-stock',
        images: [],
      },
    ],
  },

  /* ------------------------------------------------------------- Accessories */
  {
    slug: 'airpods-pro-2',
    brand: 'Apple',
    category: 'accessories',
    badges: ['bestseller'],
    featured: false,
    bestseller: true,
    name: { ar: 'إيربودز برو 2', fr: 'AirPods Pro 2', en: 'AirPods Pro 2' },
    description: {
      ar: 'إلغاء الضجيج اللي يسكّت الطريق كامل، وشحن USB-C. أحسن إيربودز للآيفون.',
      fr: 'Une réduction de bruit qui efface la rue entière, et la charge USB-C. Les meilleurs écouteurs pour iPhone.',
      en: 'Noise cancelling that erases the whole street, plus USB-C charging. The best earbuds for an iPhone.',
    },
    highlights: [],
    specs: [
      { key: 'anc', label: { ar: 'إلغاء الضجيج', fr: 'Réduction de bruit', en: 'Noise cancelling' }, value: 'Active' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' }, value: '30 h' },
    ],
    variants: [
      {
        id: 'airpods-pro-2-white',
        colour: {
          slug: 'white',
          hex: '#F5F5F0',
          label: { ar: 'أبيض', fr: 'Blanc', en: 'White' },
        },
        storage: null,
        price: 42000,
        compareAt: 46000,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'galaxy-buds3-pro',
    brand: 'Samsung',
    category: 'accessories',
    badges: [],
    featured: false,
    bestseller: false,
    name: { ar: 'غالاكسي بادز 3 برو', fr: 'Galaxy Buds3 Pro', en: 'Galaxy Buds3 Pro' },
    description: {
      ar: 'صوت Hi-Fi 24 بيت وترجمة فورية مع هواتف غالاكسي. تصميم جديد بالكامل.',
      fr: 'Son Hi-Fi 24 bit et traduction instantanée avec les Galaxy. Design entièrement repensé.',
      en: '24-bit Hi-Fi audio and live translation with Galaxy phones. A completely new design.',
    },
    highlights: [],
    specs: [
      { key: 'audio', label: { ar: 'الصوت', fr: 'Audio', en: 'Audio' }, value: '24-bit Hi-Fi' },
      { key: 'battery', label: { ar: 'البطارية', fr: 'Autonomie', en: 'Battery' }, value: '26 h' },
    ],
    variants: [
      {
        id: 'galaxy-buds3-pro-silver',
        colour: {
          slug: 'silver',
          hex: '#D5D7DB',
          label: { ar: 'فضي', fr: 'Argent', en: 'Silver' },
        },
        storage: null,
        price: 33000,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'anker-powerbank-20k',
    brand: 'Anker',
    category: 'accessories',
    badges: ['bestseller'],
    featured: false,
    bestseller: false,
    name: {
      ar: 'باور بانك أنكر 20000 mAh',
      fr: 'Batterie externe Anker 20 000 mAh',
      en: 'Anker 20,000 mAh power bank',
    },
    description: {
      ar: 'تعمّر الآيفون أربع مرات كاملة. شحن سريع 30 واط ومنفذين. ضرورية إذا راك تسافر.',
      fr: 'Quatre charges complètes d’iPhone. Charge rapide 30 W, deux ports. Indispensable en déplacement.',
      en: 'Four full iPhone charges. 30W fast charging, two ports. Essential if you travel.',
    },
    highlights: [],
    specs: [
      { key: 'capacity', label: { ar: 'السعة', fr: 'Capacité', en: 'Capacity' }, value: '20 000 mAh' },
      { key: 'output', label: { ar: 'الخرج', fr: 'Sortie', en: 'Output' }, value: '30 W USB-C' },
    ],
    variants: [
      {
        id: 'anker-powerbank-20k-black',
        colour: {
          slug: 'black',
          hex: '#2B2C30',
          label: { ar: 'أسود', fr: 'Noir', en: 'Black' },
        },
        storage: null,
        price: 7500,
        compareAt: 8900,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'charger-30w-usbc',
    brand: 'JTECH',
    category: 'accessories',
    badges: [],
    featured: false,
    bestseller: false,
    name: {
      ar: 'شاحن سريع 30 واط USB-C',
      fr: 'Chargeur rapide 30 W USB-C',
      en: '30W USB-C fast charger',
    },
    description: {
      ar: 'يعمّر الآيفون 50٪ في نص ساعة. يخدم مع الآيفون، سامسونغ وكل شي USB-C.',
      fr: 'iPhone à 50 % en une demi-heure. Compatible iPhone, Samsung et tout ce qui est USB-C.',
      en: 'iPhone to 50% in half an hour. Works with iPhone, Samsung and anything USB-C.',
    },
    highlights: [],
    specs: [
      { key: 'output', label: { ar: 'القدرة', fr: 'Puissance', en: 'Output' }, value: '30 W PD' },
    ],
    variants: [
      {
        id: 'charger-30w-usbc-white',
        colour: {
          slug: 'white',
          hex: '#F5F5F0',
          label: { ar: 'أبيض', fr: 'Blanc', en: 'White' },
        },
        storage: null,
        price: 4200,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'screen-protector-glass',
    brand: 'JTECH',
    category: 'accessories',
    badges: [],
    featured: false,
    bestseller: false,
    name: {
      ar: 'حماية شاشة زجاج مقوّى',
      fr: 'Verre trempé de protection',
      en: 'Tempered glass screen protector',
    },
    description: {
      ar: 'نلزقوها لك في المحل بلا فقاعات، وإذا تكسرت في أول أسبوع نبدلوها مجاناً.',
      fr: 'Posé en magasin sans bulle, et remplacé gratuitement s’il casse dans la première semaine.',
      en: 'We fit it in store with no bubbles, and replace it free if it cracks in the first week.',
    },
    highlights: [],
    specs: [
      { key: 'hardness', label: { ar: 'الصلابة', fr: 'Dureté', en: 'Hardness' }, value: '9H' },
    ],
    variants: [
      {
        id: 'screen-protector-glass-clear',
        colour: {
          slug: 'clear',
          hex: '#E8E8ED',
          label: { ar: 'شفاف', fr: 'Transparent', en: 'Clear' },
        },
        storage: null,
        price: 1500,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'silicone-case',
    brand: 'JTECH',
    category: 'accessories',
    badges: [],
    featured: false,
    bestseller: false,
    name: {
      ar: 'كفر سيليكون بحماية الزوايا',
      fr: 'Coque silicone renforcée',
      en: 'Silicone case with corner protection',
    },
    description: {
      ar: 'سيليكون ناعم من الداخل وزوايا مقوّاة. عندنا لكل موديل آيفون وسامسونغ.',
      fr: 'Intérieur doux, coins renforcés. Disponible pour tous les modèles iPhone et Samsung.',
      en: 'Soft-lined inside, reinforced corners. In stock for every iPhone and Samsung model.',
    },
    highlights: [],
    specs: [
      { key: 'material', label: { ar: 'المادة', fr: 'Matière', en: 'Material' }, value: 'Silicone + TPU' },
    ],
    variants: [
      {
        id: 'silicone-case-black',
        colour: {
          slug: 'black',
          hex: '#2B2C30',
          label: { ar: 'أسود', fr: 'Noir', en: 'Black' },
        },
        storage: null,
        price: 3500,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
      {
        id: 'silicone-case-sand',
        colour: {
          slug: 'sand',
          hex: '#D8C8B4',
          label: { ar: 'بيج', fr: 'Sable', en: 'Sand' },
        },
        storage: null,
        price: 3500,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
  {
    slug: 'braided-usbc-cable',
    brand: 'JTECH',
    category: 'accessories',
    badges: [],
    featured: false,
    bestseller: false,
    name: {
      ar: 'كابل USB-C مضفّر 2 متر',
      fr: 'Câble USB-C tressé 2 m',
      en: 'Braided USB-C cable, 2 m',
    },
    description: {
      ar: 'مضفّر باش ما يتقطعش عند الرأس، وطويل باش تشحن وانت راقد.',
      fr: 'Tressé pour ne pas casser au niveau du connecteur, et assez long pour charger depuis le lit.',
      en: 'Braided so it doesn’t fray at the connector, and long enough to charge from bed.',
    },
    highlights: [],
    specs: [
      { key: 'length', label: { ar: 'الطول', fr: 'Longueur', en: 'Length' }, value: '2 m' },
      { key: 'speed', label: { ar: 'السرعة', fr: 'Débit', en: 'Speed' }, value: '60 W / 480 Mbps' },
    ],
    variants: [
      {
        id: 'braided-usbc-cable-grey',
        colour: {
          slug: 'grey',
          hex: '#6E6E73',
          label: { ar: 'رمادي', fr: 'Gris', en: 'Grey' },
        },
        storage: null,
        price: 1900,
        compareAt: null,
        stock: 'in-stock',
        images: [],
      },
    ],
  },
] as const;

/** Mirrors tables `products` + `product_variants`. */
export const products: readonly Product[] = parseContent(
  'content/products.ts',
  z.array(productSchema).min(1),
  PRODUCTS_INPUT,
);

/* -------------------------------------------------------------------------- */
/*  Selectors — the homepage sections read through these, never by index.     */
/* -------------------------------------------------------------------------- */

/**
 * The per-product helpers live in `lib/product.ts` and are re-exported here for
 * server-side convenience. They are kept out of this module because importing
 * anything from here pulls zod and the whole catalogue with it — which is fine on
 * the server and expensive in the browser.
 */
export { priceFrom, primaryVariant, productColours } from '@/lib/product';

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function productsByCategory(category: CategorySlug): Product[] {
  return products.filter((product) => product.category === category);
}

/** The single dark featured block. Falls back to the first product. */
export function featuredProduct(): Product {
  const found = products.find((product) => product.featured);
  if (found) return found;
  const [first] = products;
  if (!first) throw new Error('content/products.ts is empty');
  return first;
}

export function bestsellers(): Product[] {
  return products.filter((product) => product.bestseller);
}

/** Phones + computers, i.e. everything that isn't an accessory. */
export function deviceRange(): Product[] {
  return products.filter((product) => product.category !== 'accessories');
}

export function accessories(): Product[] {
  return productsByCategory('accessories');
}
