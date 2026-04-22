import { db, pendingProductsTable } from "@workspace/db";
import Groq from "groq-sdk";

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set. AI product discovery is unavailable.");
  }
  return new Groq({ apiKey });
}

const DEFAULT_MARKUP = 2.0;

function calculatePricing(costPrice: number) {
  const sellingPrice = parseFloat((costPrice * DEFAULT_MARKUP).toFixed(2));
  const profitMargin = parseFloat((((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2));
  return { sellingPrice, profitMargin };
}

function getSourceName(supplierUrl: string): string {
  try {
    const hostname = new URL(supplierUrl).hostname.replace("www.", "");
    const known: Record<string, string> = {
      "aliexpress.com": "AliExpress",
      "amazon.com": "Amazon",
      "amazon.co.uk": "Amazon UK",
      "amazon.ca": "Amazon CA",
      "alibaba.com": "Alibaba",
      "dhgate.com": "DHgate",
      "ebay.com": "eBay",
      "walmart.com": "Walmart",
      "etsy.com": "Etsy",
      "temu.com": "Temu",
    };
    return known[hostname] ?? hostname;
  } catch {
    return supplierUrl;
  }
}

function buildSupplierSearchUrl(source: string, productName: string): string {
  const query = encodeURIComponent(productName);
  switch (source) {
    case "Amazon":
      return `https://www.amazon.com/s?k=${query}`;
    case "AliExpress":
      return `https://www.aliexpress.com/wholesale?SearchText=${query}`;
    case "Alibaba":
      return `https://www.alibaba.com/trade/search?SearchText=${query}`;
    case "DHgate":
      return `https://www.dhgate.com/wholesale/search.do?act=search&searchkey=${query}`;
    case "Temu":
      return `https://www.temu.com/search_result.html?search_key=${query}`;
    default:
      return `https://www.aliexpress.com/wholesale?SearchText=${query}`;
  }
}

type AiProduct = {
  name: string;
  description: string;
  category: string;
  costPrice: number;
  source: string;
  tags: string[];
  trendScore: number;
  estimatedDemand: string;
  viralReason: string;
  targetAudience: string;
  isTrending: boolean;
  stockCount: string;
  imageKeyword: string;
};

async function discoverProductsWithAI(existingNames: Set<string>): Promise<AiProduct[]> {
  const categories = [
    "Beauty", "Skincare", "Hair Care", "Makeup", "Fashion",
    "Accessories", "Wellness", "Fitness", "Lifestyle",
  ];
  const sources = ["AliExpress", "Amazon", "Alibaba", "DHgate", "Temu"];

  const prompt = `You are a dropshipping product research expert. Find 10 real, purchasable women's products that are currently selling well on platforms like AliExpress, Amazon, Alibaba, DHgate, or Temu.

IMPORTANT: Prioritize trending/viral products first. At least 6 of the 10 should be actively trending right now. The rest can be highly-rated staples (4.5+ stars).

Return ONLY a valid JSON array with exactly 10 products, sorted so trending products (isTrending: true) appear FIRST, followed by non-trending. Each product must:
- Be a REAL product type that actually exists and can be purchased
- Have a specific, realistic cost price in USD (what the dropshipper pays wholesale)
- Come from one of these sources: ${sources.join(", ")}
- Be in one of these categories: ${categories.join(", ")}
- Span a variety of categories — do NOT put more than 2 products in the same category
- NOT be any of these already-known products: ${Array.from(existingNames).slice(0, 30).join(", ") || "none"}

JSON format:
[
  {
    "name": "specific product name",
    "description": "compelling 2-sentence product description for customers",
    "category": "one of the categories listed",
    "costPrice": 12.50,
    "source": "AliExpress",
    "tags": ["tag1", "tag2", "tag3"],
    "trendScore": 88,
    "estimatedDemand": "high",
    "viralReason": "why it's trending or why customers love it",
    "targetAudience": "who buys this",
    "isTrending": true,
    "stockCount": "150",
    "imageKeyword": "single keyword for product image search"
  }
]

Sort the array: trending products (isTrending: true) first, then non-trending. trendScore should be 70-99 for trending, 60-75 for non-trending. estimatedDemand: "low", "medium", "high", or "very_high".`;

  const response = await getGroqClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: "You are a dropshipping product research expert. Always respond with valid JSON only, no markdown, no extra text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const products: AiProduct[] = JSON.parse(cleaned);
  return products;
}

function getUnsplashImageUrl(keyword: string): string {
  const safe = encodeURIComponent(keyword.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "beauty product");
  return `https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80&auto=format&fit=crop`;
}

const IMAGE_MAP: Record<string, string> = {
  "face mask": "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
  "silk pillowcase": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "posture corrector": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
  "jade roller": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
  "eyelash": "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80",
  "waist trainer": "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
  "massage": "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&q=80",
  "resistance band": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "serum": "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80",
  "hair": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  "skincare": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
  "makeup": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
  "fitness": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  "wellness": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
  "perfume": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
  "nail": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
  "yoga": "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80",
  "sunscreen": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
};

function pickImage(keyword: string): string {
  const kw = (keyword || "").toLowerCase();
  for (const [key, url] of Object.entries(IMAGE_MAP)) {
    if (kw.includes(key)) return url;
  }
  return `https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&q=80`;
}

export async function runTrendingAutomation(): Promise<{ added: number; skipped: number }> {
  const existing = await db.select({ name: pendingProductsTable.name }).from(pendingProductsTable);
  const existingNames = new Set(existing.map((r) => r.name));

  let products: AiProduct[];
  try {
    products = await discoverProductsWithAI(existingNames);
  } catch (err) {
    throw new Error(`AI product discovery failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const toAdd = products.filter((p) => p.name && !existingNames.has(p.name));
  let added = 0;

  for (const product of toAdd) {
    const costPrice = typeof product.costPrice === "number" ? product.costPrice : parseFloat(String(product.costPrice));
    if (isNaN(costPrice) || costPrice <= 0) continue;

    const { sellingPrice, profitMargin } = calculatePricing(costPrice);
    const sourceName = product.source || "AliExpress";
    const supplierUrl = buildSupplierSearchUrl(sourceName, product.name);
    const imageUrl = pickImage(product.imageKeyword || product.category || "");

    await db.insert(pendingProductsTable).values({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl,
      costPrice: costPrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2),
      profitMargin: profitMargin.toFixed(2),
      stockCount: product.stockCount ?? "100",
      isTrending: product.isTrending ?? false,
      viralReason: product.viralReason,
      targetAudience: product.targetAudience,
      supplierUrl,
      tags: product.tags ?? [],
      source: sourceName,
      status: "pending",
      trendScore: (product.trendScore ?? 75).toFixed(2),
      estimatedDemand: product.estimatedDemand ?? "medium",
    });
    added++;
  }

  return { added, skipped: products.length - added };
}

export function calculateProfit(costPrice: number, marginPercent?: number) {
  const margin = (marginPercent ?? 50) / 100;
  const sellingPrice = parseFloat((costPrice / (1 - margin)).toFixed(2));
  const profit = parseFloat((sellingPrice - costPrice).toFixed(2));
  const profitMargin = parseFloat(((profit / sellingPrice) * 100).toFixed(2));
  return { sellingPrice, profit, profitMargin };
}
