"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Topbar } from "@/components/Topbar";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard } from "@/components/ChartCard";
import { api } from "@/lib/api";
import { compact, money, qty } from "@/lib/format";
import { localizeCharts, periodTitle, timeAxisProps } from "@/lib/dates";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { td } from "@/lib/dataI18n";

type Dash = {
  kpis: Record<string, { value: number; pct: number }>;
  financeBreakdown: {
    income: { oilSales: number; services: number; otherIncome: number };
    expense: { salary: number; equipment: number; transport: number; tax: number; otherExpense: number };
    profit: number;
  };
  productionVsPlan: { actual: number; planned: number; attainment: number };
  charts: {
    at: string;
    revenue: number;
    expense: number;
    profit: number;
    production: number;
    planned: number;
    sales: number;
  }[];
  employeePerformance: { department: string; employees: number; performance: number }[];
};

const tooltipStyle = {
  background: "#151d27",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
};

export default function CeoDashboard() {
  const locale = useLocale((s) => s.locale);
  const [period, setPeriod] = useState("monthly");
  const [showPct, setShowPct] = useState(true);
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    api.get(`/dashboard/ceo?period=${period}`).then((r) => setData(r.data)).catch(() => {});
  }, [period]);

  const k = data?.kpis;
  const when = periodTitle(period, locale);
  const charts = localizeCharts(data?.charts, period, locale);
  const perf = (data?.employeePerformance ?? []).map((d) => ({ ...d, department: td(locale, d.department) }));

  return (
    <div>
      <Topbar title={t(locale, "dashboard")} period={period} onPeriod={setPeriod} />
      <div className="space-y-6 p-6">
        <div className="overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-r from-gold-500/15 via-oil-800/80 to-teal-500/10 px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold-400">{t(locale, "energyLine")}</p>
          <p className="mt-1 font-display text-2xl text-gold-300 md:text-3xl">{t(locale, "slogan")}</p>
          <p className="mt-1 text-sm text-white/60">{t(locale, "welcome")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-white/55">{t(locale, "tagline")}</p>
          <button onClick={() => setShowPct((v) => !v)} className="btn-ghost">
            {showPct ? t(locale, "showAbs") : t(locale, "showPct")}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label={t(locale, "revenue")} value={money(k?.revenue.value ?? 0)} pct={k?.revenue.pct ?? 0} showPct={showPct} accent="gold" />
          <KpiCard label={t(locale, "expenses")} value={money(k?.expenses.value ?? 0)} pct={k?.expenses.pct ?? 0} showPct={showPct} accent="rose" />
          <KpiCard label={t(locale, "profit")} value={money(k?.profit.value ?? 0)} pct={k?.profit.pct ?? 0} showPct={showPct} accent="teal" />
          <KpiCard label={t(locale, "losses")} value={money(k?.losses.value ?? 0)} pct={k?.losses.pct ?? 0} showPct={showPct} accent="rose" />
          <KpiCard label={t(locale, "investment")} value={money(k?.investment.value ?? 0)} pct={k?.investment.pct ?? 0} showPct={showPct} />
          <KpiCard label={t(locale, "loans")} value={money(k?.loans.value ?? 0)} pct={k?.loans.pct ?? 0} showPct={showPct} accent="slate" />
          <KpiCard label={t(locale, "employees")} value={String(k?.employees.value ?? 0)} pct={k?.employees.pct ?? 0} showPct={showPct} accent="slate" />
          <KpiCard label={t(locale, "oilVolume")} value={qty(k?.production.value ?? 0)} pct={k?.production.pct ?? 0} showPct={showPct} accent="teal" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title={t(locale, "profitGrowth")} subtitle={when}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts}>
                <defs>
                  <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2b84a" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#e2b84a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.06)" />
                <XAxis {...timeAxisProps} />
                <YAxis stroke="#8b97a8" fontSize={11} tickFormatter={compact} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""} />
                <Area type="monotone" dataKey="profit" name={t(locale, "profit")} stroke="#e2b84a" fill="url(#p)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t(locale, "revenueChart")} subtitle={when}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts}>
                <CartesianGrid stroke="rgba(255,255,255,.06)" />
                <XAxis {...timeAxisProps} />
                <YAxis stroke="#8b97a8" fontSize={11} tickFormatter={compact} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""} />
                <Bar dataKey="revenue" name={t(locale, "revenue")} fill="#c9972a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t(locale, "expenseChart")} subtitle={when}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts}>
                <CartesianGrid stroke="rgba(255,255,255,.06)" />
                <XAxis {...timeAxisProps} />
                <YAxis stroke="#8b97a8" fontSize={11} tickFormatter={compact} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""} />
                <Bar dataKey="expense" name={t(locale, "expenses")} fill="#fb7185" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t(locale, "productionAnalytics")} subtitle={when}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts}>
                <CartesianGrid stroke="rgba(255,255,255,.06)" />
                <XAxis {...timeAxisProps} />
                <YAxis stroke="#8b97a8" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""} />
                <Legend formatter={(v) => t(locale, v === "production" ? "oilVolume" : v === "planned" ? "planned" : String(v))} />
                <Line type="monotone" dataKey="planned" name={t(locale, "planned")} stroke="#64748b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="production" name={t(locale, "oilVolume")} stroke="#2ee6c7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t(locale, "salesAnalytics")} subtitle={when}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts}>
                <CartesianGrid stroke="rgba(255,255,255,.06)" />
                <XAxis {...timeAxisProps} />
                <YAxis stroke="#8b97a8" fontSize={11} tickFormatter={compact} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""} />
                <Area type="monotone" dataKey="sales" name={t(locale, "salesAnalytics")} stroke="#14b8a6" fill="rgba(20,184,166,.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t(locale, "employeePerf")} subtitle={when}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perf} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,.06)" />
                <XAxis type="number" domain={[0, 100]} stroke="#8b97a8" fontSize={11} />
                <YAxis type="category" dataKey="department" width={120} stroke="#8b97a8" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="performance" fill="#e2b84a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5 lg:col-span-2">
            <h3 className="text-sm text-gold-300">{t(locale, "formula")}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-white/45">{t(locale, "oilSales")}</p>
                <p className="text-lg">{money(data?.financeBreakdown.income.oilSales ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/45">{t(locale, "services")}</p>
                <p className="text-lg">{money(data?.financeBreakdown.income.services ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/45">{t(locale, "otherIncome")}</p>
                <p className="text-lg">{money(data?.financeBreakdown.income.otherIncome ?? 0)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="text-sm text-gold-300">
              {t(locale, "planned")} / {t(locale, "actual")}
            </h3>
            <p className="mt-4 font-display text-3xl text-teal-400">{data?.productionVsPlan.attainment ?? 0}%</p>
            <p className="mt-1 text-sm text-white/55">
              {qty(data?.productionVsPlan.actual ?? 0)} vs {qty(data?.productionVsPlan.planned ?? 0)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
