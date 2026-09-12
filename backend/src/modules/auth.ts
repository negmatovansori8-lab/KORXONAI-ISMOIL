import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, signToken } from "../middleware/auth";
import { audit } from "../middleware/error";
import { Role } from "../types/roles";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid credentials payload" });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { employee: { include: { department: true } } },
  });
  if (!user || !user.isActive) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  await audit(user.id, "LOGIN", "User", user.id);

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role as Role,
    employeeId: user.employeeId,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee,
    },
  });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { employee: { include: { department: true } } },
  });
  res.json({ user });
});

authRouter.post("/password", authenticate, async (req, res) => {
  const parsed = z.object({ current: z.string().min(6), next: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Рамз нодуруст аст" });
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: "Корбар ёфт нашуд" });
  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Рамзи ҷорӣ нодуруст аст" });
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 10) },
  });
  await audit(user.id, "PASSWORD", "User", user.id);
  res.json({ ok: true });
});
