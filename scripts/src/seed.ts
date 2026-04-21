import { db, productsTable, reviewsTable } from "@workspace/db";

const products = [
  {
    name: "LED Photon Rejuvenation Face Mask",
    description:
      "Professional-grade LED light therapy mask with 7 color modes targeting acne, wrinkles, and dull skin. Used by celebrities and dermatologists worldwide. 20-minute daily treatments for visible results in 4 weeks.",
    costPrice: "18.50",
    sellingPrice: "89.99",
    profitMargin: "71.49",
    category: "Beauty",
    imageUrl:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
    stockCount: 45,
    rating: "4.8",
    reviewCount: 2847,
    isTrending: true,
    viralReason: "Went viral on TikTok with 50M+ views",
    targetAudience: "Women 25-45 interested in anti-aging skincare",
    tags: ["skincare", "anti-aging", "LED", "face mask", "beauty tech"],
  },
  {
    name: "Luxury Mulberry Silk Pillowcase Set",
    description:
      "22-momme 100% pure mulberry silk pillowcase. Reduces sleep creases, prevents hair breakage, and keeps skin hydrated overnight. Dermatologist recommended for sensitive skin.",
    costPrice: "12.00",
    sellingPrice: "54.99",
    profitMargin: "42.99",
    category: "Lifestyle",
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    stockCount: 78,
    rating: "4.7",
    reviewCount: 1523,
    isTrending: true,
    viralReason: "Featured by top beauty influencers on Instagram",
    targetAudience: "Women 25-50 focused on beauty sleep and hair care",
    tags: ["silk", "pillowcase", "sleep", "hair care", "anti-aging"],
  },
  {
    name: "Posture Corrector & Back Support Brace",
    description:
      "Ergonomic posture corrector designed specifically for women. Adjustable straps, breathable material, invisible under clothing. Relieves back pain from desk work in days.",
    costPrice: "9.00",
    sellingPrice: "39.99",
    profitMargin: "30.99",
    category: "Wellness",
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
    stockCount: 92,
    rating: "4.6",
    reviewCount: 3201,
    isTrending: false,
    viralReason: "Top seller for work-from-home pain relief",
    targetAudience: "Women 20-50 with desk jobs or back pain",
    tags: ["posture", "back pain", "wellness", "office", "ergonomic"],
  },
  {
    name: "Rose Quartz Jade Facial Roller & Gua Sha Set",
    description:
      "Authentic rose quartz facial roller and gua sha set. Reduces puffiness, improves circulation, and enhances lymphatic drainage. Elevates your morning skincare ritual.",
    costPrice: "7.50",
    sellingPrice: "34.99",
    profitMargin: "27.49",
    category: "Beauty",
    imageUrl:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
    stockCount: 120,
    rating: "4.5",
    reviewCount: 987,
    isTrending: false,
    viralReason: "Beloved by holistic wellness community",
    targetAudience: "Women 20-40 into natural beauty rituals",
    tags: ["jade roller", "gua sha", "facial massage", "rose quartz", "skincare"],
  },
  {
    name: "Magnetic 3D Fiber Lashes Kit",
    description:
      "No-glue magnetic false lashes with precision applicator. 5-magnet technology for all-day hold. Reusable 30+ times. Achieve salon-quality lashes in under 2 minutes.",
    costPrice: "8.00",
    sellingPrice: "42.99",
    profitMargin: "34.99",
    category: "Makeup",
    imageUrl:
      "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80",
    stockCount: 65,
    rating: "4.4",
    reviewCount: 1876,
    isTrending: true,
    viralReason: "Beauty hack of the year on YouTube",
    targetAudience: "Women 18-35 who love glam makeup looks",
    tags: ["lashes", "magnetic", "makeup", "eyes", "glam"],
  },
  {
    name: "Latex-Free Waist Trainer & Cincher",
    description:
      "Premium neoprene waist trainer with 3-column hook closure and double boning. Accelerates core temperature for maximum sweat during workouts. Shapes and sculpts waist instantly.",
    costPrice: "14.00",
    sellingPrice: "59.99",
    profitMargin: "45.99",
    category: "Fitness",
    imageUrl:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
    stockCount: 55,
    rating: "4.3",
    reviewCount: 4102,
    isTrending: false,
    viralReason: "Endorsed by fitness influencers with millions of followers",
    targetAudience: "Women 20-45 focused on fitness and body shaping",
    tags: ["waist trainer", "fitness", "workout", "body shaping", "gym"],
  },
  {
    name: "Anti-Cellulite Vacuum Massage Cup Set",
    description:
      "Professional silicone cupping therapy set for cellulite reduction and skin tightening. Creates deep tissue massage effect to stimulate circulation and break down fat cells.",
    costPrice: "11.00",
    sellingPrice: "48.99",
    profitMargin: "37.99",
    category: "Wellness",
    imageUrl:
      "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&q=80",
    stockCount: 38,
    rating: "4.5",
    reviewCount: 721,
    isTrending: true,
    viralReason: "Trending body care technique from European spas",
    targetAudience: "Women 25-55 focused on body confidence",
    tags: ["cellulite", "cupping", "massage", "body care", "spa"],
  },
  {
    name: "Resistance Bands Set for Women",
    description:
      "Set of 5 fabric resistance bands with anti-slip design. Targets glutes, thighs, and hips. Perfect for home workouts, yoga, and pilates. Includes exercise guide.",
    costPrice: "10.00",
    sellingPrice: "44.99",
    profitMargin: "34.99",
    category: "Fitness",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    stockCount: 110,
    rating: "4.7",
    reviewCount: 5432,
    isTrending: true,
    viralReason: "Home workout essential during fitness boom",
    targetAudience: "Women 18-45 who work out at home",
    tags: ["resistance bands", "fitness", "home workout", "glutes", "yoga"],
  },
];

const reviewTemplates = [
  { authorName: "Sarah M.", rating: 5, comment: "Absolutely love this product! Exceeded all my expectations. Will definitely buy again." },
  { authorName: "Jessica L.", rating: 5, comment: "This changed my entire routine. I've been recommending it to all my friends!" },
  { authorName: "Emma R.", rating: 4, comment: "Great quality for the price. Noticed results within the first week of use." },
  { authorName: "Ashley K.", rating: 5, comment: "I was skeptical at first but wow - this actually works! So happy with my purchase." },
  { authorName: "Mia T.", rating: 4, comment: "Solid product. Good packaging, fast shipping. Would purchase again." },
  { authorName: "Olivia W.", rating: 5, comment: "Best purchase I've made all year. The quality is outstanding." },
  { authorName: "Sophia B.", rating: 3, comment: "Decent product. Does what it says, though I expected a little more." },
  { authorName: "Isabella C.", rating: 5, comment: "Perfect! Exactly as described. My skin/body has never looked better!" },
];

async function seed() {
  console.log("Seeding products...");

  const existingProducts = await db.select().from(productsTable).limit(1);
  if (existingProducts.length > 0) {
    console.log("Products already seeded, skipping.");
    process.exit(0);
  }

  const inserted = await db.insert(productsTable).values(products).returning({ id: productsTable.id });
  console.log(`Inserted ${inserted.length} products`);

  const reviews = inserted.flatMap(({ id: productId }, index) => {
    const count = 3 + (index % 3);
    return Array.from({ length: count }, (_, i) => ({
      productId,
      ...reviewTemplates[(index + i) % reviewTemplates.length],
      avatarUrl: `https://i.pravatar.cc/60?img=${(index * 3 + i + 1) % 70}`,
    }));
  });

  await db.insert(reviewsTable).values(reviews);
  console.log(`Inserted ${reviews.length} reviews`);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
