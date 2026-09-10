import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { Role } from "../types/roles";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  employeeId: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const queryToken = typeof req.query.token === "string" ? req.query.token : "";
  const raw = header?.startsWith("Bearer ") ? header.slice(7) : queryToken;
  if (!raw) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(raw, env.jwtSecret) as AuthUser;
    const dbUser = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({ error: "Account disabled or not found" });
    }
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      employeeId: dbUser.employeeId,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
