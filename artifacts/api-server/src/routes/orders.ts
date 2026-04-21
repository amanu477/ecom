import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cartItemsTable, ordersTable } from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, customerName, customerEmail, shippingAddress, paymentMethod } = parsed.data;

  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const mappedItems = cartItems.map((item) => ({
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

  const [order] = await db
    .insert(ordersTable)
    .values({
      sessionId,
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      status: "pending",
      total: total.toFixed(2),
      items: mappedItems,
    })
    .returning();

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  res.status(201).json({
    ...order,
    total: parseFloat(order.total),
    items: mappedItems,
  });
});

export default router;
