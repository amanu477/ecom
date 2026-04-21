import { db, pendingProductsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const TRENDING_POOL = [
  {
    name: "Microcurrent Facial Toning Device",
    description: "Professional-grade microcurrent device that lifts and sculpts facial muscles for a non-surgical facelift effect. Used by celebrities and dermatologists.",
    category: "Skincare",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop",
    costPrice: 28.50,
    viralReason: "Viral on TikTok skincare routines with millions of views",
    targetAudience: "Women 28-50 focused on anti-aging skincare",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["skincare", "anti-aging", "beauty device", "facial"],
    estimatedDemand: "very_high",
    trendScore: 94,
    stockCount: "100",
  },
  {
    name: "Silk Sleep Hair Bonnet",
    description: "Luxurious mulberry silk sleeping bonnet that protects hair from frizz, breakage, and moisture loss. Available in adjustable sizes for all hair types.",
    category: "Hair Care",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
    costPrice: 6.80,
    viralReason: "Trending in natural hair care communities and sleep wellness circles",
    targetAudience: "Women with natural, curly, or color-treated hair",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["hair care", "silk", "sleep", "natural hair"],
    estimatedDemand: "high",
    trendScore: 88,
    stockCount: "200",
  },
  {
    name: "Posture Corrector Bra",
    description: "Wireless comfortable bra with built-in posture correction technology. Supports spine alignment while providing all-day comfort.",
    category: "Wellness",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop",
    costPrice: 12.40,
    viralReason: "Work-from-home culture driving demand for comfort + posture products",
    targetAudience: "Working women 25-45 with desk jobs",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["wellness", "posture", "comfort", "bra"],
    estimatedDemand: "high",
    trendScore: 82,
    stockCount: "150",
  },
  {
    name: "LED Teeth Whitening Kit",
    description: "Professional-grade teeth whitening kit with LED accelerator light. Delivers salon-quality results from home in just 10 minutes per session.",
    category: "Beauty",
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop",
    costPrice: 9.20,
    viralReason: "Before/after transformation content dominating social media feeds",
    targetAudience: "Beauty-conscious women 20-40",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["beauty", "teeth whitening", "LED", "dental care"],
    estimatedDemand: "very_high",
    trendScore: 91,
    stockCount: "120",
  },
  {
    name: "Resistance Bands Set (5 levels)",
    description: "Premium fabric resistance bands set with 5 resistance levels. Perfect for home workouts, glute training, and physical therapy.",
    category: "Fitness",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop",
    costPrice: 7.60,
    viralReason: "Home fitness boom with strong influencer endorsements in women's fitness",
    targetAudience: "Fitness enthusiasts 18-40",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["fitness", "workout", "resistance bands", "home gym"],
    estimatedDemand: "very_high",
    trendScore: 96,
    stockCount: "300",
  },
  {
    name: "Gua Sha Facial Massage Set",
    description: "Authentic rose quartz gua sha stone with facial oil. Reduces puffiness, improves circulation, and creates a natural glow.",
    category: "Skincare",
    imageUrl: "https://images.unsplash.com/photo-1583248369069-9d91f1640fe6?w=600&auto=format&fit=crop",
    costPrice: 4.30,
    viralReason: "Massive wellness & self-care trend, consistently viral on Instagram and TikTok",
    targetAudience: "Wellness and skincare enthusiasts 22-45",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["skincare", "gua sha", "facial massage", "crystal"],
    estimatedDemand: "high",
    trendScore: 87,
    stockCount: "250",
  },
  {
    name: "Heated Eyelash Curler",
    description: "Electric heated eyelash curler that creates long-lasting, dramatic curls in seconds without damaging lashes. Rechargeable via USB.",
    category: "Makeup",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&auto=format&fit=crop",
    costPrice: 11.90,
    viralReason: "Beauty hack content going viral, solving a universal makeup struggle",
    targetAudience: "Makeup lovers 18-35",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["makeup", "eyelash", "beauty tool", "eyes"],
    estimatedDemand: "high",
    trendScore: 83,
    stockCount: "180",
  },
  {
    name: "Collagen Peptide Hair Serum",
    description: "Concentrated collagen peptide serum that visibly reduces hair breakage and adds shine within 2 weeks. Suitable for all hair types.",
    category: "Hair Care",
    imageUrl: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&auto=format&fit=crop",
    costPrice: 8.70,
    viralReason: "Hair health trend combining beauty and wellness, strong results-driven content",
    targetAudience: "Women experiencing hair thinning or damage, 25-50",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["hair care", "collagen", "serum", "hair growth"],
    estimatedDemand: "high",
    trendScore: 85,
    stockCount: "200",
  },
  {
    name: "Reusable Silicone Makeup Pads",
    description: "Set of 16 washable silicone makeup remover pads. Eco-friendly alternative to cotton rounds that saves money and reduces waste.",
    category: "Skincare",
    imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop",
    costPrice: 5.10,
    viralReason: "Eco-conscious beauty trend with strong sustainability messaging",
    targetAudience: "Eco-conscious beauty enthusiasts 20-40",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["skincare", "eco-friendly", "reusable", "makeup remover"],
    estimatedDemand: "medium",
    trendScore: 76,
    stockCount: "300",
  },
  {
    name: "Bamboo Charcoal Exfoliating Gloves",
    description: "Deep-cleansing exfoliating gloves made from bamboo charcoal fiber. Removes dead skin, unclogs pores, and promotes smooth, radiant skin.",
    category: "Skincare",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop",
    costPrice: 3.90,
    viralReason: "Skincare minimalism trend with affordable, effective self-care solutions",
    targetAudience: "Skincare beginners and budget-conscious shoppers 18-35",
    supplierUrl: "https://www.aliexpress.com",
    tags: ["skincare", "exfoliation", "bamboo", "charcoal"],
    estimatedDemand: "medium",
    trendScore: 74,
    stockCount: "400",
  },
];

const DEFAULT_PROFIT_MARGIN = 0.65;

function calculatePricing(costPrice: number) {
  const sellingPrice = parseFloat((costPrice / (1 - DEFAULT_PROFIT_MARGIN)).toFixed(2));
  const profitMargin = parseFloat((((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2));
  return { sellingPrice, profitMargin };
}

export async function runTrendingAutomation(): Promise<{ added: number; skipped: number }> {
  const existing = await db.select({ name: pendingProductsTable.name }).from(pendingProductsTable)
    .where(eq(pendingProductsTable.source, "automation"));

  const existingNames = new Set(existing.map((r) => r.name));

  const toAdd = TRENDING_POOL.filter((p) => !existingNames.has(p.name));

  if (toAdd.length === 0) return { added: 0, skipped: TRENDING_POOL.length };

  for (const product of toAdd) {
    const { sellingPrice, profitMargin } = calculatePricing(product.costPrice);
    await db.insert(pendingProductsTable).values({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      costPrice: product.costPrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2),
      profitMargin: profitMargin.toFixed(2),
      stockCount: product.stockCount,
      isTrending: true,
      viralReason: product.viralReason,
      targetAudience: product.targetAudience,
      supplierUrl: product.supplierUrl,
      tags: product.tags,
      source: "automation",
      status: "pending",
      trendScore: product.trendScore.toFixed(2),
      estimatedDemand: product.estimatedDemand,
    });
  }

  return { added: toAdd.length, skipped: TRENDING_POOL.length - toAdd.length };
}

export function calculateProfit(costPrice: number, marginPercent?: number) {
  const margin = (marginPercent ?? DEFAULT_PROFIT_MARGIN * 100) / 100;
  const sellingPrice = parseFloat((costPrice / (1 - margin)).toFixed(2));
  const profit = parseFloat((sellingPrice - costPrice).toFixed(2));
  const profitMargin = parseFloat(((profit / sellingPrice) * 100).toFixed(2));
  return { sellingPrice, profit, profitMargin };
}
