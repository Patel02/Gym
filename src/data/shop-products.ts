export type ProductCategory = 
  | "COMPETITION_APPAREL" 
  | "BELTS_SLEEVES" 
  | "REFEED_NUTRITION" 
  | "TECHNICAL_ACCESSORIES";

export interface ShopProduct {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  priceInr: number;
  originalPriceInr: number;
  ipfApproved: boolean;
  tag?: string;
  shortDescription: string;
  fullDescription: string;
  specifications: Record<string, string>;
  availableSizes: string[];
  inStock: boolean;
  imageEmoji: string;
  colorVariants: string[];
}

export interface CartItem {
  product: ShopProduct;
  selectedSize: string;
  quantity: number;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // ── 1. BELTS & SLEEVES ──
  {
    id: "prod-lever-belt-13mm",
    name: "A&T Championship 13mm Quick-Release Lever Belt",
    category: "BELTS_SLEEVES",
    categoryLabel: "Belts & Sleeves",
    priceInr: 6499,
    originalPriceInr: 7999,
    ipfApproved: true,
    tag: "IPF Ratified Gold Standard",
    shortDescription: "Heavyweight 13mm genuine top-grain sole leather with laser-etched gold magnesium-alloy quick lever.",
    fullDescription: "Built strictly to IPF Technical Rulebook specs (10 cm width, maximum 13 mm thickness). Provides maximum intra-abdominal pressure reinforcement on heavy squats and deadlifts without structural pinching. Features dual-locking gold lever buckle with lifelong mechanical warranty.",
    specifications: {
      "Material": "100% Genuine Sole Vegetable-Tanned Leather",
      "Thickness": "13.0 mm (Strict IPF Maximum)",
      "Width": "10.0 cm (4 Inches)",
      "Buckle": "Heavy Duty Magnesium-Alloy Lever Buckle",
      "Platform Legality": "IPF Approved across Sub-Junior to Senior Open",
    },
    availableSizes: ["S (26-32\")", "M (30-36\")", "L (34-40\")", "XL (38-44\")", "2XL (42-48\")"],
    inStock: true,
    imageEmoji: "🥋",
    colorVariants: ["Stealth Black / Gold Buckle", "Crimson Red / Black Buckle"],
  },
  {
    id: "prod-knee-sleeves-7mm",
    name: "A&T ErgoForce 7mm Stiff Competition Knee Sleeves (Pair)",
    category: "BELTS_SLEEVES",
    categoryLabel: "Belts & Sleeves",
    priceInr: 4999,
    originalPriceInr: 5999,
    ipfApproved: true,
    tag: "Maximum Rebound",
    shortDescription: "7mm ultra-dense competition neoprene with ergonomic conical taper for explosive rebound out of the squat hole.",
    fullDescription: "Engineered with reinforced double-stitch bonded seams and high-density non-supportive neoprene. Sized to the exact 30cm IPF length ceiling to provide maximum tendon compression, joint thermal warmth, and superior rebound mechanics on competition squats.",
    specifications: {
      "Thickness": "7.0 mm (+/- 0.5 mm tolerance)",
      "Length": "30.0 cm (Official IPF Limit)",
      "Construction": "Conical Anatomical Compression Taper",
      "Seams": "Abrasion-Resistant Hexagon Zigzag Stitching",
      "Platform Legality": "IPF Approved for Raw Competition",
    },
    availableSizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
    imageEmoji: "🦵",
    colorVariants: ["Federation Black & Orange", "Matte Carbon"],
  },
  {
    id: "prod-wrist-wraps-1m",
    name: "A&T Heavy Stiff Competition Wrist Wraps (1.0 Meter)",
    category: "BELTS_SLEEVES",
    categoryLabel: "Belts & Sleeves",
    priceInr: 1899,
    originalPriceInr: 2499,
    ipfApproved: true,
    tag: "Cast-Iron Lock",
    shortDescription: "Ultra-heavy woven elasticized blend with reinforced thumb loop and heavy military-grade velcro.",
    fullDescription: "Creates an unbending cast around the carpal bones during heavy bench pressing and low-bar squats. Constructed at the maximum permitted 1.0 meter length and 8cm width under IPF guidelines.",
    specifications: {
      "Length": "100 cm (1.0 Meter IPF Maximum)",
      "Width": "8 cm",
      "Thumb Loop": "Heavy duty reinforced flat weave",
      "Closure": "Wide grip industrial hook-and-loop",
      "Platform Legality": "IPF Approved for Bench & Squat",
    },
    availableSizes: ["1.0 Meter (Competition Stiff)", "0.5 Meter (Training Medium)"],
    inStock: true,
    imageEmoji: "🥊",
    colorVariants: ["Black with Dual Orange Racing Stripes", "Tactical Grey"],
  },

  // ── 2. COMPETITION APPAREL ──
  {
    id: "prod-official-singlet",
    name: "Indian Powerlifting Federation Official Team India Singlet",
    category: "COMPETITION_APPAREL",
    categoryLabel: "Competition Apparel",
    priceInr: 3299,
    originalPriceInr: 3999,
    ipfApproved: true,
    tag: "Mandatory Platform Uniform",
    shortDescription: "Official IPF-compliant one-piece lifting suit with four-way stretch compression and non-slip silicone leg bands.",
    fullDescription: "Designed to meet all international specifications: non-supportive single-ply polyester/spandex blend, torso-conforming cut that clearly displays hip crease and knee joint for referee inspection. Features the official Indian Powerlifting Federation gold insignia crest.",
    specifications: {
      "Fabric": "82% Breathable Polyester, 18% Elastane High-Tension Spandex",
      "Leg Inseam": "Mid-thigh compliant (Does not touch knee sleeves)",
      "Leg Gripper": "Laser-cut hypoallergenic silicone grip ribbon",
      "Crest": "Sublimated Federation National Emblem & Tricolor Accents",
      "Platform Legality": "Mandatory Platform Legal for All Sanctioned Meets",
    },
    availableSizes: ["XS (Under 52kg)", "S (52-66kg)", "M (66-74kg)", "L (74-83kg)", "XL (83-93kg)", "2XL (93-105kg)", "3XL (105-120kg+)"],
    inStock: true,
    imageEmoji: "🩱",
    colorVariants: ["Team India Navy & Gold", "Stealth Onyx / Orange"],
  },
  {
    id: "prod-oversized-pump-cover",
    name: "A&T Heavy Barbell Club Oversized Heavyweight Tee",
    category: "COMPETITION_APPAREL",
    categoryLabel: "Competition Apparel",
    priceInr: 1499,
    originalPriceInr: 1999,
    ipfApproved: false,
    tag: "Backstage Essential",
    shortDescription: "280 GSM 100% French Terry cotton oversized pump cover with dropped shoulders and distressed vintage wash.",
    fullDescription: "The official warm-up room staple. Thick 280 GSM fabric keeps body temperature elevated during 45-minute backstage flight intervals between attempts. Features Coach Akash & Tanvi's signature 'Respect The Depth' back typography.",
    specifications: {
      "Weight": "280 GSM Ultra-Heavyweight French Terry",
      "Material": "100% Combed Compact Cotton",
      "Fit": "True Oversized Streetwear Cut with Dropped Shoulders",
      "Print": "Screen-printed high-density puff ink",
    },
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    inStock: true,
    imageEmoji: "👕",
    colorVariants: ["Washed Vintage Charcoal", "Oatmeal Heather", "Deep Maroon"],
  },
  {
    id: "prod-deadlift-socks",
    name: "A&T ArmorPlate Knee-High Deadlift Socks",
    category: "COMPETITION_APPAREL",
    categoryLabel: "Competition Apparel",
    priceInr: 699,
    originalPriceInr: 999,
    ipfApproved: true,
    tag: "Shin Protection",
    shortDescription: "Reinforced high-density shin panel deadlift socks preventing barbell abrasion without snagging aggressive knurling.",
    fullDescription: "Mandatory for platform deadlifts under IPF Section 3.7. Features double-padded frontal weave that prevents barbell scraping against shins while allowing the bar to glide frictionless up the legs during lockout.",
    specifications: {
      "Height": "Full Knee-High (Does not contact knee sleeves)",
      "Shin Layer": "Dual-ply cordura-reinforced glide panel",
      "Footbed": "Terry-cushioned arch support with non-slip sole",
      "Platform Legality": "Mandatory Platform Equipment for Deadlifts",
    },
    availableSizes: ["Medium (UK 6-8)", "Large (UK 9-11)", "XL (UK 12+)"],
    inStock: true,
    imageEmoji: "🧦",
    colorVariants: ["Black / Orange Shin Guard", "Red / White Stripe"],
  },

  // ── 3. REFEED & NUTRITION ──
  {
    id: "prod-meet-day-refeed-kit",
    name: "Coach Akash & Tanvi Meet Day Rapid Refeed Nutrition Bundle",
    category: "REFEED_NUTRITION",
    categoryLabel: "Nutrition & Refeed",
    priceInr: 2199,
    originalPriceInr: 2999,
    ipfApproved: true,
    tag: "Sports Nutritionist Formulated",
    shortDescription: "Complete post weigh-in rehydration & glycogen super-compensation kit for the official 2-hour window.",
    fullDescription: "Formulated specifically for the IPF 2-hour weigh-in crunch. Contains 6 sachets of medical-grade Isotonic ORS, 500g pure Dextrose monohydrate, Himalayan pink rock salt flask, electrolyte chewable candies, and custom graduated shaker bottle for precise stage-by-stage rehydration.",
    specifications: {
      "Contents": "6x Medical ORS, 500g Dextrose, Pink Salt Flask, 1x 1000ml Shaker",
      "Certifications": "NADA / WADA Strictly Compliant (Zero Banned Substances)",
      "Formulation": "Isotonic 6-8% glucose-sodium ratio for instant plasma volume",
    },
    availableSizes: ["Standard 1-Day Meet Kit", "Zonal 2-Day Championship Pack"],
    inStock: true,
    imageEmoji: "🧪",
    colorVariants: ["Official Federation Pack"],
  },
  {
    id: "prod-whey-isolate-1kg",
    name: "A&T Pure Ultra-Filtered Whey Protein Isolate (1.0 KG)",
    category: "REFEED_NUTRITION",
    categoryLabel: "Nutrition & Refeed",
    priceInr: 3499,
    originalPriceInr: 4299,
    ipfApproved: true,
    tag: "Zero Bloat Refeed",
    shortDescription: "90% Pure protein per scoop with zero lactose, zero fat, and ultra-fast gastric emptying rate.",
    fullDescription: "Crucial for post-weigh-in Stage 2 refeed. Delivers 27g of pure protein without triggering stomach fullness or delaying carbohydrate absorption, preventing lethargy during heavy opening squats.",
    specifications: {
      "Protein per Scoop": "27 Grams (90% Purity)",
      "BCAA Content": "6.2 Grams",
      "Lactose / Fat": "0.1g Fat, 0.0g Lactose",
      "Testing": "Third-Party Tested for Heavy Metals & WADA Prohibited List",
    },
    availableSizes: ["1.0 KG (33 Servings)", "2.0 KG (66 Servings)"],
    inStock: true,
    imageEmoji: "🥛",
    colorVariants: ["Gourmet Belgian Chocolate", "Raw Unflavored (Zero Additives)"],
  },

  // ── 4. TECHNICAL ACCESSORIES ──
  {
    id: "prod-leather-clipboard",
    name: "Official Technical Jury & Coach Triplicate Leather Clipboard Set",
    category: "TECHNICAL_ACCESSORIES",
    categoryLabel: "Technical Accessories",
    priceInr: 1299,
    originalPriceInr: 1699,
    ipfApproved: true,
    tag: "Backstage Essential",
    shortDescription: "Premium faux-leather magnetic attempt card holder with calibrated rack height slot and pen holster.",
    fullDescription: "Designed for backstage handlers and certified coaches submitting attempts within the 60-second rule. Fits IPF triplicate attempt cards, stopwatch, and features rulebook quick-reference printed on interior lining.",
    specifications: {
      "Material": "Waterproof Heavy Grain PU Leather",
      "Clip": "High-tension matte black steel clamp",
      "Card Slots": "3 Triplicate card sleeves + Rack height card window",
    },
    availableSizes: ["Standard A5 / Triplicate Meet Size"],
    inStock: true,
    imageEmoji: "📋",
    colorVariants: ["Midnight Black with Gold Embossing"],
  },
  {
    id: "prod-liquid-chalk",
    name: "A&T Heavy Grip Antibacterial Liquid Chalk (250ml)",
    category: "TECHNICAL_ACCESSORIES",
    categoryLabel: "Technical Accessories",
    priceInr: 799,
    originalPriceInr: 1099,
    ipfApproved: true,
    tag: "No Dust / Platform Legal",
    shortDescription: "Medical-grade magnesium carbonate suspended in fast-evaporating 70% alcohol for supreme knurling lock.",
    fullDescription: "Dries in 5 seconds to leave a zero-residue, ultra-dry chalk coating that will not cake up on deadlift bars. Legal under all federation venue rules where dry block chalk is restricted in warm-up rooms.",
    specifications: {
      "Volume": "250 ml (Approx. 100 platform applications)",
      "Active Ingredient": "100% Pure Magnesium Carbonate",
      "Drying Time": "5-8 Seconds",
    },
    availableSizes: ["250ml Squeeze Bottle"],
    inStock: true,
    imageEmoji: "🧴",
    colorVariants: ["Standard White Grip"],
  },
  {
    id: "prod-gold-crest-pin",
    name: "Indian Powerlifting Federation Ratified Gold Crest Lapel Pin",
    category: "TECHNICAL_ACCESSORIES",
    categoryLabel: "Technical Accessories",
    priceInr: 499,
    originalPriceInr: 699,
    ipfApproved: true,
    tag: "Collector Edition",
    shortDescription: "24K Gold-plated die-cast federation emblem pin for blazers, gym bags, and referee uniforms.",
    fullDescription: "Official ratified insignia marking participation in Indian Powerlifting Federation sanctioned championships. Features double butterfly clutch backing and polished enamel finish.",
    specifications: {
      "Plating": "24K Gold electroplate with hand-filled black enamel",
      "Diameter": "30 mm",
      "Backing": "Dual anti-rotation spurs with butterfly clutches",
    },
    availableSizes: ["Standard 30mm"],
    inStock: true,
    imageEmoji: "🏅",
    colorVariants: ["Gold & Black Enamel"],
  },
];
