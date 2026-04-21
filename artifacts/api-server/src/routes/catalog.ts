import { Router, type IRouter } from "express";
import { db, productsTable, reviewsTable } from "@workspace/db";
import { GetCatalogSummaryResponse } from "@workspace/api-zod";
import { sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/catalog/summary", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable);
  const reviews = await db.select().from(reviewsTable);

  const categories = new Set(products.map((p) => p.category));
  const trendingCount = products.filter((p) => p.isTrending).length;

  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Fashion";

  const avgRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + parseFloat(p.rating ?? "4.5"), 0) / products.length
      : 4.5;

  const summary = {
    totalProducts: products.length,
    totalCategories: categories.size,
    trendingCount,
    topCategory,
    avgRating: parseFloat(avgRating.toFixed(2)),
    totalReviews: reviews.length,
  };

  res.json(GetCatalogSummaryResponse.parse(summary));
});

export default router;
