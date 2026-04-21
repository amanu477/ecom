import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
  profitMargin: numeric("profit_margin", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  stockCount: integer("stock_count").notNull().default(50),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  isTrending: boolean("is_trending").notNull().default(false),
  viralReason: text("viral_reason"),
  targetAudience: text("target_audience"),
  supplierUrl: text("supplier_url"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
