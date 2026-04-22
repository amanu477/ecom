import { Router, type IRouter } from "express";
import { eq, desc, sum, count, sql } from "drizzle-orm";
import { db, productsTable, ordersTable, pendingProductsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminMiddleware";
import { runTrendingAutomation, calculateProfit } from "../services/trendingAutomation";

const router: IRouter = Router();

router.use(requireAdmin);

router.get("/admin/dashboard", async (_req, res): Promise<void> => {
  const [orderStats] = await db
    .select({
      totalRevenue: sum(ordersTable.total),
      totalOrders: count(ordersTable.id),
    })
    .from(ordersTable);

  const [productStats] = await db
    .select({
      totalProducts: count(productsTable.id),
    })
    .from(productsTable);

  const [pendingCount] = await db
    .select({ count: count(pendingProductsTable.id) })
    .from(pendingProductsTable)
    .where(eq(pendingProductsTable.status, "pending"));

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const topProducts = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.rating), desc(productsTable.reviewCount))
    .limit(5);

  const categoryBreakdown = await db
    .select({
      category: productsTable.category,
      count: count(productsTable.id),
    })
    .from(productsTable)
    .groupBy(productsTable.category);

  const ordersByStatus = await db
    .select({
      status: ordersTable.status,
      count: count(ordersTable.id),
      revenue: sum(ordersTable.total),
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const totalRevenue = parseFloat(orderStats.totalRevenue ?? "0");
  const totalCostEstimate = totalRevenue * 0.35;
  const totalProfit = totalRevenue - totalCostEstimate;

  res.json({
    summary: {
      totalRevenue,
      totalOrders: Number(orderStats.totalOrders),
      totalProducts: Number(productStats.totalProducts),
      pendingProductApprovals: Number(pendingCount.count),
      estimatedProfit: parseFloat(totalProfit.toFixed(2)),
      profitMarginPercent: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0,
    },
    recentOrders: recentOrders.map((o) => ({
      ...o,
      total: parseFloat(o.total),
    })),
    topProducts: topProducts.map((p) => ({
      ...p,
      costPrice: parseFloat(p.costPrice),
      sellingPrice: parseFloat(p.sellingPrice),
      profitMargin: parseFloat(p.profitMargin),
      rating: parseFloat(p.rating ?? "0"),
    })),
    categoryBreakdown,
    ordersByStatus: ordersByStatus.map((o) => ({
      ...o,
      count: Number(o.count),
      revenue: parseFloat(o.revenue ?? "0"),
    })),
  });
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  const limit = parseInt((req.query.limit as string) ?? "50", 10);
  const offset = parseInt((req.query.offset as string) ?? "0", 10);
  const status = req.query.status as string | undefined;

  let query = db.select().from(ordersTable).$dynamic();
  if (status) {
    query = query.where(eq(ordersTable.status, status));
  }
  const orders = await query.orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

  res.json(orders.map((o) => ({ ...o, total: parseFloat(o.total) })));
});

router.patch("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body as { status: string };

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ ...updated, total: parseFloat(updated.total) });
});

router.get("/admin/products", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt));

  res.json(
    products.map((p) => ({
      ...p,
      costPrice: parseFloat(p.costPrice),
      sellingPrice: parseFloat(p.sellingPrice),
      profitMargin: parseFloat(p.profitMargin),
      rating: parseFloat(p.rating ?? "0"),
    })),
  );
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const body = req.body as {
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    costPrice: number;
    marginPercent?: number;
    stockCount?: number;
    isTrending?: boolean;
    viralReason?: string;
    targetAudience?: string;
    supplierUrl?: string;
    tags?: string[];
  };

  if (!body.name || !body.description || !body.category || !body.imageUrl || !body.costPrice) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const { sellingPrice, profitMargin } = calculateProfit(body.costPrice, body.marginPercent);

  const [product] = await db
    .insert(productsTable)
    .values({
      name: body.name,
      description: body.description,
      category: body.category,
      imageUrl: body.imageUrl,
      costPrice: body.costPrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2),
      profitMargin: profitMargin.toFixed(2),
      stockCount: body.stockCount ?? 50,
      isTrending: body.isTrending ?? false,
      viralReason: body.viralReason,
      targetAudience: body.targetAudience,
      supplierUrl: body.supplierUrl,
      tags: body.tags,
    })
    .returning();

  res.status(201).json({
    ...product,
    costPrice: parseFloat(product.costPrice),
    sellingPrice: parseFloat(product.sellingPrice),
    profitMargin: parseFloat(product.profitMargin),
    rating: parseFloat(product.rating ?? "0"),
  });
});

router.put("/admin/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const body = req.body as {
    name?: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    costPrice?: number;
    marginPercent?: number;
    stockCount?: number;
    isTrending?: boolean;
    viralReason?: string;
    targetAudience?: string;
    supplierUrl?: string;
    tags?: string[];
  };

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
  if (body.stockCount !== undefined) updateData.stockCount = body.stockCount;
  if (body.isTrending !== undefined) updateData.isTrending = body.isTrending;
  if (body.viralReason !== undefined) updateData.viralReason = body.viralReason;
  if (body.targetAudience !== undefined) updateData.targetAudience = body.targetAudience;
  if (body.supplierUrl !== undefined) updateData.supplierUrl = body.supplierUrl;
  if (body.tags !== undefined) updateData.tags = body.tags;

  if (body.costPrice !== undefined) {
    const { sellingPrice, profitMargin } = calculateProfit(body.costPrice, body.marginPercent);
    updateData.costPrice = body.costPrice.toFixed(2);
    updateData.sellingPrice = sellingPrice.toFixed(2);
    updateData.profitMargin = profitMargin.toFixed(2);
  }

  const [updated] = await db
    .update(productsTable)
    .set(updateData as any)
    .where(eq(productsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...updated,
    costPrice: parseFloat(updated.costPrice),
    sellingPrice: parseFloat(updated.sellingPrice),
    profitMargin: parseFloat(updated.profitMargin),
    rating: parseFloat(updated.rating ?? "0"),
  });
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning({ id: productsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ success: true, id: deleted.id });
});

router.get("/admin/pending-products", async (_req, res): Promise<void> => {
  const pending = await db
    .select()
    .from(pendingProductsTable)
    .orderBy(desc(sql`${pendingProductsTable.trendScore}::numeric`), desc(pendingProductsTable.createdAt));

  res.json(
    pending.map((p) => ({
      ...p,
      costPrice: parseFloat(p.costPrice),
      sellingPrice: parseFloat(p.sellingPrice),
      profitMargin: parseFloat(p.profitMargin),
      trendScore: parseFloat(p.trendScore ?? "0"),
    })),
  );
});

router.post("/admin/pending-products/:id/approve", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  const [pending] = await db
    .select()
    .from(pendingProductsTable)
    .where(eq(pendingProductsTable.id, id));

  if (!pending) {
    res.status(404).json({ error: "Pending product not found" });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      name: pending.name,
      description: pending.description,
      category: pending.category,
      imageUrl: pending.imageUrl,
      costPrice: pending.costPrice,
      sellingPrice: pending.sellingPrice,
      profitMargin: pending.profitMargin,
      stockCount: parseInt(pending.stockCount ?? "50", 10),
      isTrending: pending.isTrending,
      viralReason: pending.viralReason,
      targetAudience: pending.targetAudience,
      supplierUrl: pending.supplierUrl,
      tags: pending.tags,
    })
    .returning();

  await db
    .update(pendingProductsTable)
    .set({ status: "approved" })
    .where(eq(pendingProductsTable.id, id));

  res.status(201).json({
    ...product,
    costPrice: parseFloat(product.costPrice),
    sellingPrice: parseFloat(product.sellingPrice),
    profitMargin: parseFloat(product.profitMargin),
    rating: parseFloat(product.rating ?? "0"),
  });
});

router.delete("/admin/pending-products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  await db
    .update(pendingProductsTable)
    .set({ status: "rejected" })
    .where(eq(pendingProductsTable.id, id));

  res.json({ success: true });
});

router.delete("/admin/pending-products", async (_req, res): Promise<void> => {
  await db.delete(pendingProductsTable);
  res.json({ success: true });
});

router.post("/admin/automation/run", async (_req, res): Promise<void> => {
  const result = await runTrendingAutomation();
  res.json({ success: true, ...result });
});

router.post("/admin/calculate-profit", async (req, res): Promise<void> => {
  const { costPrice, marginPercent } = req.body as { costPrice: number; marginPercent?: number };
  if (!costPrice || isNaN(costPrice)) {
    res.status(400).json({ error: "costPrice is required" });
    return;
  }
  const result = calculateProfit(costPrice, marginPercent);
  res.json(result);
});

export default router;
