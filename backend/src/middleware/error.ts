import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}

export async function audit(actorId: string | undefined, action: string, entity: string, entityId?: string, meta?: unknown) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, meta: meta === undefined ? undefined : JSON.stringify(meta) },
  });
}
