import { Router, type IRouter } from "express";
import { eq, desc, ilike } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  GetProductParams,
  GetProductResponse,
  GetTrendingProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, limit, offset } = parsed.data;

  let query = db.select().from(productsTable).$dynamic();
  if (category) {
    query = query.where(ilike(productsTable.category, category));
  }
  const products = await query
    .orderBy(desc(productsTable.isTrending), desc(productsTable.rating))
    .limit(limit ?? 20)
    .offset(offset ?? 0);

  const mapped = products.map((p) => ({
    ...p,
    costPrice: parseFloat(p.costPrice),
    sellingPrice: parseFloat(p.sellingPrice),
    profitMargin: parseFloat(p.profitMargin),
    rating: parseFloat(p.rating ?? "4.5"),
  }));

  res.json(ListProductsResponse.parse(mapped));
});

router.get("/products/trending", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isTrending, true))
    .orderBy(desc(productsTable.rating))
    .limit(6);

  const mapped = products.map((p) => ({
    ...p,
    costPrice: parseFloat(p.costPrice),
    sellingPrice: parseFloat(p.sellingPrice),
    profitMargin: parseFloat(p.profitMargin),
    rating: parseFloat(p.rating ?? "4.5"),
  }));

  res.json(GetTrendingProductsResponse.parse(mapped));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(
    GetProductResponse.parse({
      ...product,
      costPrice: parseFloat(product.costPrice),
      sellingPrice: parseFloat(product.sellingPrice),
      profitMargin: parseFloat(product.profitMargin),
      rating: parseFloat(product.rating ?? "4.5"),
    })
  );
});

export default router;
