import { pgTable, text, serial, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pendingProductsTable = pgTable("pending_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
  profitMargin: numeric("profit_margin", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  stockCount: text("stock_count").notNull().default("50"),
  isTrending: boolean("is_trending").notNull().default(false),
  viralReason: text("viral_reason"),
  targetAudience: text("target_audience"),
  supplierUrl: text("supplier_url"),
  tags: text("tags").array(),
  source: text("source").notNull().default("automation"),
  status: text("status").notNull().default("pending"),
  trendScore: numeric("trend_score", { precision: 5, scale: 2 }).default("0"),
  estimatedDemand: text("estimated_demand").default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPendingProductSchema = createInsertSchema(pendingProductsTable).omit({ id: true, createdAt: true });
export type InsertPendingProduct = z.infer<typeof insertPendingProductSchema>;
export type PendingProduct = typeof pendingProductsTable.$inferSelect;
