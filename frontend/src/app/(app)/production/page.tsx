"use client";

import { FormEvent, useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Topbar } from "@/components/Topbar";
import { ChartCard } from "@/components/ChartCard";
import { api } from "@/lib/api";
import { qty } from "@/lib/format";
import { formatDate, localizeCharts, periodTitle, timeAxisProps } from "@/lib/dates";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { st, td } from "@/lib/dataI18n";

export default function ProductionPage() {
  const locale = useLocale((s) => s.locale);
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({ wellId: "", plannedBarrels: 3000, actualBarrels: 3100, occurredAt: new Date().toISOString().slice(0, 10) });

  const load = () => api.get(`/production?period=${period}`).then((r) => {
    setData(r.data);
    if (!form.wellId && r.data.wells?.[0]) setForm((f) => ({ ...f, wellId: r.data.wells[0].id }));
  });
  useEffect(() => {
    load().catch(() => {});
  }, [period]);

  async function add(e: FormEvent) {
    e.preventDefault();
    await api.post("/production", { ...form, plannedBarrels: Number(form.plannedBarrels), actualBarrels: Number(form.actualBarrels) });
    load();
  }

  return (
    <div>
      <Topbar title={t(locale, "production")} period={period} onPeriod={setPeriod} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <p className="text-xs text-white/45">{t(locale, "actual")}</p>
            <p className="mt-2 font-display text-3xl text-teal-400">{qty(data?.productionVsPlan?.actual ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <p className="text-xs text-white/45">{t(locale, "planned")}</p>
            <p className="mt-2 font-display text-3xl">{qty(data?.productionVsPlan?.planned ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <p className="text-xs text-white/45">{t(locale, "attainment")}</p>
            <p className="mt-2 font-display text-3xl text-gold-300">{data?.productionVsPlan?.attainment ?? 0}%</p>
          </div>
        </div>
        <ChartCard title={t(locale, "productionAnalytics")} subtitle={periodTitle(period, locale)}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={localizeCharts(data?.charts, period, locale)}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" />
              <XAxis {...timeAxisProps} />
              <YAxis stroke="#8b97a8" fontSize={11} />
              <Tooltip contentStyle={{ background: "#151d27", border: "1px solid rgba(255,255,255,.1)" }} labelFormatter={(_, p) => (p?.[0]?.payload as { full?: string })?.full ?? ""} />
              <Legend formatter={(v) => t(locale, v === "production" ? "oilVolume" : v === "planned" ? "planned" : String(v))} />
              <Line type="monotone" dataKey="planned" name={t(locale, "planned")} stroke="#64748b" />
              <Line type="monotone" dataKey="production" name={t(locale, "oilVolume")} stroke="#2ee6c7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <form onSubmit={add} className="grid gap-3 rounded-2xl border border-white/10 bg-oil-800/70 p-5 md:grid-cols-5">
          <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.wellId} onChange={(e) => setForm({ ...form, wellId: e.target.value })}>
            {data?.wells?.map((w: any) => (
              <option key={w.id} value={w.id}>{td(locale, w.name)}</option>
            ))}
          </select>
          <input type="number" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.plannedBarrels} onChange={(e) => setForm({ ...form, plannedBarrels: Number(e.target.value) })} />
          <input type="number" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.actualBarrels} onChange={(e) => setForm({ ...form, actualBarrels: Number(e.target.value) })} />
          <input type="date" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} />
          <button className="btn-gold">{t(locale, "add")}</button>
        </form>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data?.wells?.map((w: any) => (
            <div key={w.id} className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
              <p className="text-gold-300">{td(locale, w.name)}</p>
              <p className="text-xs text-white/45">{td(locale, w.location)}</p>
              <p className="mt-3 text-sm">{st(locale, w.status)} · {qty(Number(w.capacityBpd), "bpd")}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <table className="w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-2">{t(locale, "date")}</th>
                <th>{t(locale, "wells")}</th>
                <th>{t(locale, "planned")}</th>
                <th>{t(locale, "actual")}</th>
                <th>{t(locale, "status")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent?.map((r: any) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="py-2">{formatDate(r.occurredAt, locale)}</td>
                  <td>{td(locale, r.well.name)}</td>
                  <td>{Number(r.plannedBarrels).toFixed(0)}</td>
                  <td>{Number(r.actualBarrels).toFixed(0)}</td>
                  <td>{st(locale, r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
