import { prisma } from "../lib/prisma";
import { num, pctChange, periodRange, previousRange } from "../lib/period";

type Period = "daily" | "monthly" | "yearly";

async function sumTx(from: Date, to: Date, type: "INCOME" | "EXPENSE", extra?: Record<string, unknown>) {
  const agg = await prisma.financeTransaction.aggregate({
    _sum: { amount: true },
    where: { type, occurredAt: { gte: from, lte: to }, ...(extra ?? {}) } as object,
  });
  return num(agg._sum.amount);
}

function seriesBuckets(period: Period, from: Date, to: Date) {
  const now = new Date();
  const cap = to.getTime() < now.getTime() ? to : now;
  const points: { from: Date; to: Date }[] = [];
  if (period === "daily") {
    for (let h = 0; h < 24; h += 2) {
      const a = new Date(from);
      a.setHours(h, 0, 0, 0);
      if (a > cap) break;
      const b = new Date(from);
      b.setHours(h + 1, 59, 59, 999);
      points.push({ from: a, to: b > cap ? cap : b });
    }
  } else if (period === "yearly") {
    const lastMonth = cap.getMonth();
    for (let m = 0; m <= lastMonth; m++) {
      const a = new Date(from.getFullYear(), m, 1);
      const b = new Date(from.getFullYear(), m + 1, 0, 23, 59, 59, 999);
      points.push({ from: a, to: m === lastMonth ? cap : b });
    }
  } else {
    const days = Math.max(1, Math.round((cap.getTime() - from.getTime()) / 86400000) + 1);
    const step = days > 20 ? 2 : 1;
    for (let i = 0; i < days; i += step) {
      const a = new Date(from);
      a.setDate(from.getDate() + i);
      a.setHours(0, 0, 0, 0);
      if (a > cap) break;
      const b = new Date(a);
      b.setHours(23, 59, 59, 999);
      points.push({ from: a, to: b > cap ? cap : b });
    }
  }
  return points;
}

export async function buildCeoDashboard(period: Period) {
  const current = periodRange(period);
  const prev = previousRange(period);

  const [revenue, expenses, prevRevenue, prevExpenses] = await Promise.all([
    sumTx(current.from, current.to, "INCOME"),
    sumTx(current.from, current.to, "EXPENSE"),
    sumTx(prev.from, prev.to, "INCOME"),
    sumTx(prev.from, prev.to, "EXPENSE"),
  ]);

  const profit = revenue - expenses;
  const prevProfit = prevRevenue - prevExpenses;
  const losses = Math.max(0, -profit);

  const [oilSales, services, otherIncome, salary, equipment, transport, tax, otherExpense] = await Promise.all([
    sumTx(current.from, current.to, "INCOME", { incomeCat: "OIL_SALES" }),
    sumTx(current.from, current.to, "INCOME", { incomeCat: "SERVICES" }),
    sumTx(current.from, current.to, "INCOME", { incomeCat: "OTHER_INCOME" }),
    sumTx(current.from, current.to, "EXPENSE", { expenseCat: "SALARY" }),
    sumTx(current.from, current.to, "EXPENSE", { expenseCat: "EQUIPMENT" }),
    sumTx(current.from, current.to, "EXPENSE", { expenseCat: "TRANSPORT" }),
    sumTx(current.from, current.to, "EXPENSE", { expenseCat: "TAX" }),
    sumTx(current.from, current.to, "EXPENSE", { expenseCat: "OTHER_EXPENSE" }),
  ]);

  const [investmentAgg, loanAgg, employeeCount, productionAgg, prevProduction] = await Promise.all([
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.loan.aggregate({ _sum: { remaining: true }, where: { status: { in: ["ACTIVE", "OVERDUE"] } } }),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.production.aggregate({
      _sum: { actualBarrels: true, plannedBarrels: true },
      where: { occurredAt: { gte: current.from, lte: current.to } },
    }),
    prisma.production.aggregate({
      _sum: { actualBarrels: true },
      where: { occurredAt: { gte: prev.from, lte: prev.to } },
    }),
  ]);

  const production = num(productionAgg._sum.actualBarrels);
  const planned = num(productionAgg._sum.plannedBarrels);

  const buckets = seriesBuckets(period, current.from, current.to);
  const charts = await Promise.all(
    buckets.map(async (b) => {
      const [rev, exp, prod, sales] = await Promise.all([
        sumTx(b.from, b.to, "INCOME"),
        sumTx(b.from, b.to, "EXPENSE"),
        prisma.production.aggregate({
          _sum: { actualBarrels: true, plannedBarrels: true },
          where: { occurredAt: { gte: b.from, lte: b.to } },
        }),
        prisma.sale.aggregate({
          _sum: { amount: true, volumeBbl: true },
          where: { soldAt: { gte: b.from, lte: b.to } },
        }),
      ]);
      return {
        at: b.from.toISOString(),
        revenue: rev,
        expense: exp,
        profit: rev - exp,
        production: num(prod._sum.actualBarrels),
        planned: num(prod._sum.plannedBarrels),
        sales: num(sales._sum.amount),
        salesVolume: num(sales._sum.volumeBbl),
      };
    })
  );

  const departments = await prisma.department.findMany({
    include: { employees: { where: { status: "ACTIVE" }, select: { performance: true } } },
  });
  const employeePerformance = departments.map((d) => {
    const perfs = d.employees.map((e) => num(e.performance));
    const avg = perfs.length ? perfs.reduce((a, b) => a + b, 0) / perfs.length : 0;
    return { department: d.name, employees: perfs.length, performance: Number(avg.toFixed(1)) };
  });

  return {
    period,
    range: current,
    kpis: {
      revenue: { value: revenue, pct: pctChange(revenue, prevRevenue) },
      expenses: { value: expenses, pct: pctChange(expenses, prevExpenses) },
      profit: { value: profit, pct: pctChange(profit, prevProfit) },
      losses: { value: losses, pct: pctChange(losses, Math.max(0, -prevProfit)) },
      investment: { value: num(investmentAgg._sum.amount), pct: 0 },
      loans: { value: num(loanAgg._sum.remaining), pct: 0 },
      employees: { value: employeeCount, pct: 0 },
      production: { value: production, pct: pctChange(production, num(prevProduction._sum.actualBarrels)) },
    },
    financeBreakdown: {
      income: { oilSales, services, otherIncome },
      expense: { salary, equipment, transport, tax, otherExpense },
      profit,
    },
    productionVsPlan: { actual: production, planned, attainment: planned ? Number(((production / planned) * 100).toFixed(1)) : 0 },
    charts,
    employeePerformance,
  };
}
