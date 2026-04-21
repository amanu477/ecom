import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable } from "@workspace/db";
import {
  GetCartQueryParams,
  GetCartResponse,
  AddToCartBody,
  AddToCartResponse,
  RemoveFromCartParams,
  RemoveFromCartResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildCartResponse(sessionId: string, items: typeof cartItemsTable.$inferSelect[]) {
  const mappedItems = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    quantity: item.quantity,
    price: parseFloat(item.price),
  }));
  const total = mappedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  return { sessionId, items: mappedItems, total, itemCount };
}

router.get("/cart", async (req, res): Promise<void> => {
  const parsed = GetCartQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, parsed.data.sessionId));

  res.json(GetCartResponse.parse(buildCartResponse(parsed.data.sessionId, items)));
});

router.post("/cart", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, productId, quantity } = parsed.data;

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId)
      )
    );

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    const { productsTable } = await import("@workspace/db");
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      productName: product.name,
      productImage: product.imageUrl,
      quantity,
      price: product.sellingPrice,
    });
  }

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  res.json(AddToCartResponse.parse(buildCartResponse(sessionId, items)));
});

router.delete("/cart/item/:itemId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const parsed = RemoveFromCartParams.safeParse({ itemId: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deleted] = await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.id, parsed.data.itemId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, deleted.sessionId));

  res.json(RemoveFromCartResponse.parse(buildCartResponse(deleted.sessionId, items)));
});

export default router;
