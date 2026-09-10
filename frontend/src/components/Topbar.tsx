"use client";

import { Bell, FileSpreadsheet, FileText, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { td } from "@/lib/dataI18n";
import { api } from "@/lib/api";
import { exportReport } from "@/lib/export";
import { useUi } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { seesMoney } from "@/lib/access";
import { periodTitle } from "@/lib/dates";

type Note = { id: string; title: string; message: string; read: boolean };

export function Topbar({ title, period, onPeriod }: { title: string; period?: string; onPeriod?: (p: string) => void }) {
  const locale = useLocale((s) => s.locale);
  const setMenu = useUi((s) => s.setMenu);
  const role = useAuth((s) => s.user?.role);
  const money = seesMoney(role);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/notifications").then((r) => setNotes(r.data)).catch(() => {});
  }, []);

  const download = async (kind: "excel" | "pdf") => {
    setErr("");
    setBusy(kind);
    try {
      await exportReport(kind, period ?? "monthly", locale);
    } catch {
      setErr(t(locale, "pdfError"));
    } finally {
      setBusy("");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-oil-900/80 px-4 py-3 backdrop-blur md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setMenu(true)} className="rounded-xl border border-white/10 p-2 text-gold-300 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-400">
            {t(locale, "slogan")}
          </p>
          <h1 className="font-display text-xl text-white md:text-2xl">{title}</h1>
          {period && <p className="text-xs text-white/50">{periodTitle(period, locale)}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {money && onPeriod && (
          <div className="flex rounded-xl border border-white/10 bg-oil-800 p-1">
            {(["daily", "monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => onPeriod(p)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] md:px-3 md:text-xs ${period === p ? "bg-gold-500/20 text-gold-300" : "text-white/60"}`}
              >
                {t(locale, p)}
              </button>
            ))}
          </div>
        )}
        {money && (
          <>
            <button disabled={!!busy} onClick={() => download("excel")} className="btn-ghost">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
            <button disabled={!!busy} onClick={() => download("pdf")} className="btn-gold !px-3 !py-2 text-xs">
              <FileText className="h-4 w-4" /> {busy === "pdf" ? t(locale, "loading") : "PDF"}
            </button>
          </>
        )}
        <div className="relative">
          <button onClick={() => setOpen((v) => !v)} className="relative rounded-xl border border-white/10 p-2 text-white/70">
            <Bell className="h-4 w-4" />
            {notes.some((n) => !n.read) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold-400" />}
          </button>
          {open && (
            <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-white/10 bg-oil-800 p-3 shadow-card md:w-80">
              <p className="mb-2 text-xs uppercase tracking-widest text-white/50">{t(locale, "notifications")}</p>
              <div className="max-h-72 space-y-2 overflow-auto">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-white/5 p-2">
                    <p className="text-sm text-white">{td(locale, n.title)}</p>
                    <p className="text-xs text-white/55">{td(locale, n.message)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {err && <p className="w-full text-xs text-rose-400">{err}</p>}
    </header>
  );
}
