import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, reviewsTable, productsTable } from "@workspace/db";
import {
  ListReviewsQueryParams,
  ListReviewsResponse,
  CreateReviewBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const parsed = ListReviewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, parsed.data.productId))
    .orderBy(desc(reviewsTable.createdAt));

  const mapped = reviews.map((r) => ({
    ...r,
    avatarUrl: r.avatarUrl ?? undefined,
  }));

  res.json(ListReviewsResponse.parse(mapped));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values(parsed.data)
    .returning();

  const allReviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, parsed.data.productId));

  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await db
    .update(productsTable)
    .set({
      rating: avgRating.toFixed(2),
      reviewCount: sql`${productsTable.reviewCount} + 1`,
    })
    .where(eq(productsTable.id, parsed.data.productId));

  res.status(201).json(review);
});

export default router;
