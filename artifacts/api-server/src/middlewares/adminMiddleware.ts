import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminSecret = process.env.ADMIN_SECRET ?? "admin123";
  const tokenHeader = req.headers["x-admin-token"];

  if (typeof tokenHeader === "string" && tokenHeader === adminSecret) {
    next();
    return;
  }

  if (!process.env.CLERK_SECRET_KEY) {
    next();
    return;
  }

  const { getAuth } = require("@clerk/express") as typeof import("@clerk/express");
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized: You must be signed in." });
    return;
  }

  const meta = (auth as any).sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const role = meta?.role;

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = (auth as any).sessionClaims?.email as string | undefined;

  const isAdmin =
    role === "admin" ||
    (adminEmail && userEmail && userEmail === adminEmail);

  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden: Admin access only." });
    return;
  }

  next();
}
