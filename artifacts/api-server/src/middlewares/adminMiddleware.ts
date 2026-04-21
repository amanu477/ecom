import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
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
