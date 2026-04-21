# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## FemmeFlow Dropshipping Store

A high-converting dropshipping storefront targeting women in fashion, beauty, accessories, and lifestyle.

### Artifacts

- **`artifacts/femme-store`** — React+Vite frontend storefront (previewPath: `/`)
- **`artifacts/api-server`** — Express 5 backend API (previewPath: `/api`)

### Features

- 8 viral-potential women's products (LED mask, posture corrector, resistance bands, jade roller, magnetic lashes, waist trainer, cellulite massager, silk pillowcase)
- High-converting product pages with urgency elements (stock meters, timers)
- Social proof via seeded customer reviews
- Shopping cart with session-based persistence
- Checkout form with multiple payment method options (Wise/Payoneer, Crypto USDT, Bank Transfer)
- Business strategy guide page (/strategy) with dropshipping playbook
- Mobile-first warm rose/blush/gold design
- Clerk authentication: Sign In / Register buttons in header (modal popups), dedicated /sign-in and /sign-up routes for OAuth fallback; signed-in header shows user name + sign-out link

### Database Schema (lib/db/src/schema/)

- `products` — product catalog with pricing, margins, viral metadata
- `reviews` — customer reviews linked to products
- `cart_items` — session-based shopping cart
- `orders` — completed orders with JSONB items snapshot

### API Endpoints (lib/api-spec/openapi.yaml)

- `GET /api/products` — list products with optional category filter
- `GET /api/products/trending` — trending/viral products
- `GET /api/products/:id` — single product detail
- `GET /api/catalog/summary` — store stats (total products, categories, ratings)
- `GET /api/reviews?productId=X` — reviews for a product
- `POST /api/reviews` — submit a review
- `GET /api/cart?sessionId=X` — get cart by session
- `POST /api/cart` — add item to cart
- `DELETE /api/cart/item/:itemId` — remove item from cart
- `POST /api/orders` — place an order (clears cart)

### Important Notes

- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts
- Session IDs are generated in the browser and stored in localStorage
- Product images use Unsplash URLs for demonstration
- Vite dev server (`artifacts/femme-store/vite.config.ts`) proxies `/api/*` to `http://localhost:8080` — without this, browser fetches `/api/*` as relative URLs hitting the Vite SPA server which returns HTML (not JSON), causing runtime crashes
- `resolve.dedupe` includes `@tanstack/react-query` to prevent duplicate React instances across workspace packages
- Null DB fields (supplierUrl, viralReason, targetAudience, tags) are mapped to `undefined` in `artifacts/api-server/src/routes/products.ts` via `mapProduct()` to satisfy Zod schemas
