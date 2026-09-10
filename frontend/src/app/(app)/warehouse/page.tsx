"use client";

import { FormEvent, useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { st, td } from "@/lib/dataI18n";

export default function WarehousePage() {
  const locale = useLocale((s) => s.locale);
  const [data, setData] = useState<any>(null);
  const [move, setMove] = useState({ itemId: "", type: "IN", quantity: 10, note: "" });

  const load = () => api.get("/warehouse").then((r) => {
    setData(r.data);
    if (!move.itemId && r.data.items?.[0]) setMove((m) => ({ ...m, itemId: r.data.items[0].id }));
  });
  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await api.post("/warehouse/movements", { ...move, quantity: Number(move.quantity) });
    load();
  }

  return (
    <div>
      <Topbar title={t(locale, "warehouse")} />
      <div className="space-y-6 p-6">
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-white/10 bg-oil-800/70 p-5 md:grid-cols-5">
          <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={move.itemId} onChange={(e) => setMove({ ...move, itemId: e.target.value })}>
            {data?.items?.map((i: any) => (
              <option key={i.id} value={i.id}>{i.sku} · {td(locale, i.name)}</option>
            ))}
          </select>
          <select className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={move.type} onChange={(e) => setMove({ ...move, type: e.target.value })}>
            <option value="IN">{t(locale, "inbound")}</option>
            <option value="OUT">{t(locale, "outbound")}</option>
          </select>
          <input type="number" className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" value={move.quantity} onChange={(e) => setMove({ ...move, quantity: Number(e.target.value) })} />
          <input className="rounded-xl border border-white/10 bg-oil-900 px-3 py-2 text-sm" placeholder={t(locale, "note")} value={move.note} onChange={(e) => setMove({ ...move, note: e.target.value })} />
          <button className="btn-gold">{t(locale, "save")}</button>
        </form>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.items?.map((i: any) => {
            const low = Number(i.quantity) <= Number(i.minStock);
            return (
              <div key={i.id} className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
                <p className="text-xs text-gold-400">{i.sku}</p>
                <p className="mt-1 text-lg">{td(locale, i.name)}</p>
                <p className="text-sm text-white/50">{td(locale, i.category)} · {td(locale, i.location)}</p>
                <p className={`mt-3 font-display text-2xl ${low ? "text-rose-400" : "text-teal-400"}`}>
                  {Number(i.quantity)} {td(locale, i.unit)}
                </p>
                <p className="text-xs text-white/40">{t(locale, "minStock")} {Number(i.minStock)}</p>
              </div>
            );
          })}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <h3 className="mb-3 text-gold-300">{t(locale, "history")}</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-2">{t(locale, "date")}</th>
                <th>{t(locale, "code")}</th>
                <th>{t(locale, "type")}</th>
                <th>{t(locale, "quantity")}</th>
                <th>{t(locale, "reference")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.movements?.map((m: any) => (
                <tr key={m.id} className="border-t border-white/5">
                  <td className="py-2">{formatDateTime(m.occurredAt, locale)}</td>
                  <td>{m.item.sku}</td>
                  <td className={m.type === "IN" ? "text-teal-400" : "text-rose-400"}>{st(locale, m.type)}</td>
                  <td>{Number(m.quantity)}</td>
                  <td className="text-white/45">{m.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
