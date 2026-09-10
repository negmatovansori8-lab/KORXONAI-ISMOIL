import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";
import { audit } from "../middleware/error";
import { buildCeoDashboard } from "./dashboard";
import { num } from "../lib/period";
import { Role } from "../types/roles";

export const apiRouter = Router();

apiRouter.use(authenticate);

apiRouter.get("/settings", async (_req, res) => {
  res.json({
    company: "KORXONAI NEFTI TOJIK",
    system: "Oil Enterprise Management System",
    ceo: "ISMOILOV ISMOIL",
    city: "Душанбе",
    language: "Тоҷикӣ",
    version: "2.0.0",
  });
});

apiRouter.get("/dashboard/ceo", authorize(Role.CEO, Role.ADMIN), async (req, res) => {
  const period = (["daily", "monthly", "yearly"].includes(String(req.query.period)) ? req.query.period : "monthly") as "daily" | "monthly" | "yearly";
  const data = await buildCeoDashboard(period);
  res.json(data);
});

apiRouter.get("/manager/overview", authorize(Role.CEO, Role.MANAGER, Role.ADMIN), async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [departments, tasks, equipment, reports, productionToday, assignees] = await Promise.all([
    prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
        employees: { select: { performance: true, status: true } },
      },
    }),
    prisma.task.findMany({ include: { assignee: { include: { employee: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.equipment.findMany({ orderBy: { code: "asc" } }),
    prisma.dailyReport.findMany({ orderBy: { date: "desc" }, take: 14 }),
    prisma.production.findMany({
      where: { occurredAt: { gte: startOfDay } },
      include: { well: true },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        role: true,
        email: true,
        employee: { select: { firstName: true, lastName: true, position: true } },
      },
      orderBy: { email: "asc" },
    }),
  ]);
  const todayBbl = productionToday.reduce((s, p) => s + num(p.actualBarrels), 0);
  res.json({ departments, tasks, equipment, reports, productionToday, assignees, todayBbl });
});

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueAt: z.string().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

apiRouter.post("/tasks", authorize(Role.CEO, Role.MANAGER, Role.ADMIN), async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      assigneeId: parsed.data.assigneeId ?? undefined,
      creatorId: req.user!.id,
    },
  });
  await audit(req.user!.id, "CREATE", "Task", task.id);
  res.status(201).json(task);
});

apiRouter.patch("/tasks/:id", authorize(Role.CEO, Role.MANAGER, Role.ADMIN), async (req, res) => {
  const parsed = taskSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
    },
  });
  await audit(req.user!.id, "UPDATE", "Task", task.id);
  res.json(task);
});

apiRouter.post("/reports", authorize(Role.CEO, Role.MANAGER, Role.ADMIN), async (req, res) => {
  const schema = z.object({
    summary: z.string().min(8),
    production: z.number(),
    incidents: z.number().int().min(0).default(0),
    date: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const report = await prisma.dailyReport.create({
    data: {
      summary: parsed.data.summary,
      production: parsed.data.production,
      incidents: parsed.data.incidents,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      authorId: req.user!.id,
    },
  });
  res.status(201).json(report);
});

apiRouter.get("/users", authorize(Role.ADMIN, Role.CEO), async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { employee: { include: { department: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(users.map(({ passwordHash: _p, ...u }) => u));
});

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["CEO", "MANAGER", "ADMIN", "EMPLOYEE"]),
  isActive: z.boolean().optional(),
  employeeId: z.string().uuid().nullable().optional(),
});

apiRouter.post("/users", authorize(Role.ADMIN, Role.CEO), async (req, res) => {
  const parsed = userSchema.extend({ password: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (exists) return res.status(409).json({ error: "Email already in use" });
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role,
      employeeId: parsed.data.employeeId ?? undefined,
    },
  });
  await audit(req.user!.id, "CREATE", "User", user.id);
  const { passwordHash: _p, ...safe } = user;
  res.status(201).json(safe);
});

apiRouter.patch("/users/:id", authorize(Role.ADMIN, Role.CEO), async (req, res) => {
  const parsed = userSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    delete data.password;
  }
  if (parsed.data.email) data.email = parsed.data.email.toLowerCase();
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  await audit(req.user!.id, "UPDATE", "User", user.id);
  const { passwordHash: _p, ...safe } = user;
  res.json(safe);
});

apiRouter.delete("/users/:id", authorize(Role.ADMIN, Role.CEO), async (req, res) => {
  if (req.params.id === req.user!.id) return res.status(400).json({ error: "Cannot delete your own account" });
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (target?.role === "CEO") return res.status(400).json({ error: "Cannot delete chairman" });
  await prisma.user.delete({ where: { id: req.params.id } });
  await audit(req.user!.id, "DELETE", "User", req.params.id);
  res.status(204).end();
});

apiRouter.get("/employees", async (req, res) => {
  const employees = await prisma.employee.findMany({
    include: { department: true, user: { select: { id: true, email: true, role: true, isActive: true } } },
    orderBy: { code: "asc" },
  });
  if (req.user!.role === Role.EMPLOYEE) {
    return res.json(
      employees.map((e) => (e.id === req.user!.employeeId ? e : { ...e, baseSalary: 0, payrolls: undefined }))
    );
  }
  res.json(employees);
});

apiRouter.get("/employees/:id", async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: { department: true, payrolls: { orderBy: { createdAt: "desc" } }, user: { select: { email: true, role: true } } },
  });
  if (!employee) return res.status(404).json({ error: "Not found" });
  res.json(employee);
});

const employeeSchema = z.object({
  code: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  position: z.string().min(2),
  departmentId: z.string().uuid(),
  baseSalary: z.number().positive(),
  experienceYrs: z.number().int().min(0),
  status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]).optional(),
  hireDate: z.string(),
  phone: z.string().optional(),
  performance: z.number().min(0).max(100).optional(),
});

apiRouter.post("/employees", authorize(Role.ADMIN, Role.MANAGER, Role.CEO), async (req, res) => {
  const parsed = employeeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const employee = await prisma.employee.create({
    data: { ...parsed.data, hireDate: new Date(parsed.data.hireDate) },
  });
  await audit(req.user!.id, "CREATE", "Employee", employee.id);
  res.status(201).json(employee);
});

apiRouter.patch("/employees/:id", authorize(Role.ADMIN, Role.MANAGER, Role.CEO), async (req, res) => {
  const parsed = employeeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const employee = await prisma.employee.update({
    where: { id: req.params.id },
    data: { ...parsed.data, hireDate: parsed.data.hireDate ? new Date(parsed.data.hireDate) : undefined },
  });
  res.json(employee);
});

apiRouter.get("/departments", async (_req, res) => {
  res.json(await prisma.department.findMany({ orderBy: { name: "asc" } }));
});

function netSalary(base: number, bonus: number, perf: number, reward: number, deduction: number) {
  return Number((base + bonus + base * (perf / 100) * 0.15 + reward - deduction).toFixed(2));
}

apiRouter.get("/payroll", authorize(Role.CEO, Role.MANAGER, Role.ADMIN), async (req, res) => {
  const period = String(req.query.period ?? "");
  const payrolls = await prisma.payroll.findMany({
    where: period ? { period } : undefined,
    include: { employee: { include: { department: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(payrolls);
});

apiRouter.post("/payroll/run", authorize(Role.ADMIN, Role.MANAGER, Role.CEO), async (req, res) => {
  const period = String(req.body.period ?? new Date().toISOString().slice(0, 7));
  const employees = await prisma.employee.findMany({ where: { status: "ACTIVE" } });
  const created = [];
  for (const emp of employees) {
    const base = num(emp.baseSalary);
    const bonus = base * 0.12;
    const reward = num(emp.performance) > 90 ? 800 : 250;
    const deduction = num(emp.performance) < 80 ? 180 : 0;
    const net = netSalary(base, bonus, num(emp.performance), reward, deduction);
    const row = await prisma.payroll.upsert({
      where: { employeeId_period: { employeeId: emp.id, period } },
      create: {
        employeeId: emp.id,
        period,
        baseSalary: base,
        bonus,
        performancePercent: emp.performance,
        reward,
        deduction,
        netSalary: net,
      },
      update: {
        baseSalary: base,
        bonus,
        performancePercent: emp.performance,
        reward,
        deduction,
        netSalary: net,
      },
    });
    created.push(row);
  }
  const total = created.reduce((s, p) => s + num(p.netSalary), 0);
  await prisma.financeTransaction.create({
    data: {
      type: "EXPENSE",
      expenseCat: "SALARY",
      amount: total,
      occurredAt: new Date(),
      description: `Payroll run ${period}`,
      reference: `PAY-${period}`,
    },
  });
  await audit(req.user!.id, "PAYROLL_RUN", "Payroll", undefined, { period, total });
  res.json({ period, count: created.length, total, payrolls: created });
});

apiRouter.get("/finance/summary", authorize(Role.CEO, Role.ADMIN), async (req, res) => {
  const period = (["daily", "monthly", "yearly"].includes(String(req.query.period)) ? req.query.period : "monthly") as "daily" | "monthly" | "yearly";
  const data = await buildCeoDashboard(period);
  const [investments, loans, transactions] = await Promise.all([
    prisma.investment.findMany({ orderBy: { startedAt: "desc" } }),
    prisma.loan.findMany({ orderBy: { startedAt: "desc" } }),
    prisma.financeTransaction.findMany({ orderBy: { occurredAt: "desc" }, take: 80 }),
  ]);
  res.json({ ...data, investments, loans, transactions });
});

const txSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  incomeCat: z.enum(["OIL_SALES", "SERVICES", "OTHER_INCOME"]).optional(),
  expenseCat: z.enum(["SALARY", "EQUIPMENT", "TRANSPORT", "TAX", "OTHER_EXPENSE"]).optional(),
  amount: z.number().positive(),
  occurredAt: z.string(),
  description: z.string().min(2),
  reference: z.string().optional(),
});

apiRouter.post("/finance/transactions", authorize(Role.ADMIN, Role.CEO), async (req, res) => {
  const parsed = txSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tx = await prisma.financeTransaction.create({
    data: { ...parsed.data, occurredAt: new Date(parsed.data.occurredAt) },
  });
  await audit(req.user!.id, "CREATE", "FinanceTransaction", tx.id);
  res.status(201).json(tx);
});

apiRouter.get("/production", async (req, res) => {
  const period = (["daily", "monthly", "yearly"].includes(String(req.query.period)) ? req.query.period : "monthly") as "daily" | "monthly" | "yearly";
  const dash = await buildCeoDashboard(period);
  const [wells, recent] = await Promise.all([
    prisma.well.findMany({ include: { productions: { orderBy: { occurredAt: "desc" }, take: 7 } } }),
    prisma.production.findMany({ include: { well: true }, orderBy: { occurredAt: "desc" }, take: 40 }),
  ]);
  res.json({ kpis: dash.kpis.production, productionVsPlan: dash.productionVsPlan, charts: dash.charts, wells, recent });
});

apiRouter.post("/production", authorize(Role.MANAGER, Role.ADMIN, Role.CEO), async (req, res) => {
  const schema = z.object({
    wellId: z.string().uuid(),
    occurredAt: z.string(),
    plannedBarrels: z.number().min(0),
    actualBarrels: z.number().min(0),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const ratio = parsed.data.plannedBarrels ? parsed.data.actualBarrels / parsed.data.plannedBarrels : 1;
  const status = ratio >= 1.03 ? "AHEAD" : ratio < 0.92 ? "BEHIND" : "ON_PLAN";
  const row = await prisma.production.create({ data: { ...parsed.data, occurredAt: new Date(parsed.data.occurredAt), status } });
  res.status(201).json(row);
});

apiRouter.get("/warehouse", async (_req, res) => {
  const [items, movements] = await Promise.all([
    prisma.warehouseItem.findMany({ orderBy: { sku: "asc" } }),
    prisma.warehouseMovement.findMany({ include: { item: true }, orderBy: { occurredAt: "desc" }, take: 50 }),
  ]);
  res.json({ items, movements });
});

apiRouter.post("/warehouse/items", authorize(Role.MANAGER, Role.ADMIN, Role.CEO), async (req, res) => {
  const schema = z.object({
    sku: z.string().min(2),
    name: z.string().min(2),
    category: z.string(),
    unit: z.string(),
    quantity: z.number().min(0),
    minStock: z.number().min(0),
    location: z.string(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.warehouseItem.create({ data: parsed.data });
  res.status(201).json(item);
});

apiRouter.post("/warehouse/movements", authorize(Role.MANAGER, Role.ADMIN, Role.CEO, Role.EMPLOYEE), async (req, res) => {
  const schema = z.object({
    itemId: z.string().uuid(),
    type: z.enum(["IN", "OUT"]),
    quantity: z.number().positive(),
    note: z.string().optional(),
    reference: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.warehouseItem.findUnique({ where: { id: parsed.data.itemId } });
  if (!item) return res.status(404).json({ error: "Item not found" });
  const nextQty = parsed.data.type === "IN" ? num(item.quantity) + parsed.data.quantity : num(item.quantity) - parsed.data.quantity;
  if (nextQty < 0) return res.status(400).json({ error: "Insufficient stock" });
  const [movement] = await prisma.$transaction([
    prisma.warehouseMovement.create({
      data: { ...parsed.data, occurredAt: new Date() },
    }),
    prisma.warehouseItem.update({ where: { id: item.id }, data: { quantity: nextQty } }),
  ]);
  res.status(201).json(movement);
});

apiRouter.get("/notifications", async (req, res) => {
  const list = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  res.json(list);
});

apiRouter.patch("/notifications/:id/read", async (req, res) => {
  const n = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(n);
});

apiRouter.get("/sales", authorize(Role.CEO, Role.ADMIN), async (_req, res) => {
  const sales = await prisma.sale.findMany({ orderBy: { soldAt: "desc" }, take: 60 });
  res.json(sales);
});
