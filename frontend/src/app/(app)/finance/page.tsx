"use client";

import { FormEvent, useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { KpiCard } from "@/components/KpiCard";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { td } from "@/lib/dataI18n";

export default function FinancePage() {
  const locale = useLocale((s) => s.locale);
  const [period, setPeriod] = useState("monthly");
  const [showPct, setShowPct] = useState(true);
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({ type: "INCOME", incomeCat: "OIL_SALES", expenseCat: "OTHER_EXPENSE", amount: 1000, occurredAt: new Date().toISOString().slice(0, 10), description: "" });

  const load = () => api.get(`/finance/summary?period=${period}`).then((r) => setData(r.data));
  useEffect(() => {
    load().catch(() => {});
  }, [period]);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post("/finance/transactions", {
      type: form.type,
      incomeCat: form.type === "INCOME" ? form.incomeCat : undefined,
      expenseCat: form.type === "EXPENSE" ? form.expenseCat : undefined,
      amount: Number(form.amount),
      occurredAt: form.occurredAt,
      description: form.description || "Manual entry",
    });
    load();
  }

  const k = data?.kpis;
  const b = data?.financeBreakdown;

  return (
    <div>
      <Topbar title={t(locale, "finance")} period={period} onPeriod={setPeriod} />
      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <button onClick={() => setShowPct((v) => !v)} className="btn-ghost">{showPct ? t(locale, "showAbs") : t(locale, "showPct")}</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label={t(locale, "revenue")} value={money(k?.revenue.value ?? 0)} pct={k?.revenue.pct ?? 0} showPct={showPct} />
          <KpiCard label={t(locale, "expenses")} value={money(k?.expenses.value ?? 0)} pct={k?.expenses.pct ?? 0} showPct={showPct} accent="rose" />
          <KpiCard label={t(locale, "profit")} value={money(k?.profit.value ?? 0)} pct={k?.profit.pct ?? 0} showPct={showPct} accent="teal" />
        </div>
        <p className="rounded-xl border border-gold-500/20 bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
          {t(locale, "formula")} → {money(k?.revenue.value ?? 0)} − {money(k?.expenses.value ?? 0)} = {money(k?.profit.value ?? 0)}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="text-gold-300">{t(locale, "revenue")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>{t(locale, "oilSales")}</span><span>{money(b?.income.oilSales ?? 0)}</span></li>
              <li className="flex justify-between"><span>{t(locale, "services")}</span><span>{money(b?.income.services ?? 0)}</span></li>
              <li className="flex justify-between"><span>{t(locale, "otherIncome")}</span><span>{money(b?.income.otherIncome ?? 0)}</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="text-gold-300">{t(locale, "expenses")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>{t(locale, "salary")}</span><span>{money(b?.expense.salary ?? 0)}</span></li>
              <li className="flex justify-between"><span>{t(locale, "equipment")}</span><span>{money(b?.expense.equipment ?? 0)}</span></li>
              <li className="flex justify-between"><span>{t(locale, "transport")}</span><span>{money(b?.expense.transport ?? 0)}</span></li>
              <li className="flex justify-between"><span>{t(locale, "tax")}</span><span>{money(b?.expense.tax ?? 0)}</span></li>
              <li className="flex justify-between"><span>{t(locale, "otherExpense")}</span><span>{money(b?.expense.otherExpense ?? 0)}</span></li>
            </ul>
          </div>
        </div>
        <form onSubmit={add} className="grid gap-3 rounded-2xl border border-white/10 bg-oil-800/70 p-5 md:grid-cols-6">
          <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="INCOME">{t(locale, "income")}</option>
            <option value="EXPENSE">{t(locale, "expense")}</option>
          </select>
          {form.type === "INCOME" ? (
            <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.incomeCat} onChange={(e) => setForm({ ...form, incomeCat: e.target.value })}>
              <option value="OIL_SALES">{t(locale, "oilSales")}</option>
              <option value="SERVICES">{t(locale, "services")}</option>
              <option value="OTHER_INCOME">{t(locale, "otherIncome")}</option>
            </select>
          ) : (
            <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.expenseCat} onChange={(e) => setForm({ ...form, expenseCat: e.target.value })}>
              <option value="SALARY">{t(locale, "salary")}</option>
              <option value="EQUIPMENT">{t(locale, "equipment")}</option>
              <option value="TRANSPORT">{t(locale, "transport")}</option>
              <option value="TAX">{t(locale, "tax")}</option>
              <option value="OTHER_EXPENSE">{t(locale, "otherExpense")}</option>
            </select>
          )}
          <input type="number" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          <input type="date" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder={t(locale, "save")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn-gold">{t(locale, "add")}</button>
        </form>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="mb-3 text-gold-300">{t(locale, "investment")}</h3>
            {data?.investments?.map((i: any) => (
              <div key={i.id} className="flex justify-between border-t border-white/5 py-2 text-sm">
                <span>{td(locale, i.name)}</span>
                <span>{money(Number(i.amount))}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <h3 className="mb-3 text-gold-300">{t(locale, "loans")}</h3>
            {data?.loans?.map((i: any) => (
              <div key={i.id} className="flex justify-between border-t border-white/5 py-2 text-sm">
                <span>{td(locale, i.lender)}</span>
                <span>{money(Number(i.remaining))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
