"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bell, Building2, FileSpreadsheet, FileText, Globe, Lock, MapPin, Shield } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { api } from "@/lib/api";
import { exportReport } from "@/lib/export";
import { useAuth } from "@/store/auth";
import { useLocale } from "@/store/locale";
import { roleLabel, t } from "@/lib/i18n";
import { seesMoney } from "@/lib/access";

export default function SettingsPage() {
  const locale = useLocale((s) => s.locale);
  const user = useAuth((s) => s.user);
  const money = seesMoney(user?.role);
  const [info, setInfo] = useState({ company: "KORXONAI NEFTI TOJIK", ceo: "ISMOILOV ISMOIL", city: "Душанбе", version: "1.0.0" });
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setInfo(r.data)).catch(() => {});
  }, []);

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/auth/password", { current, next });
      setCurrent("");
      setNext("");
      setMsg(t(locale, "passwordSaved"));
    } catch {
      setMsg(t(locale, "wrongPassword"));
    }
  }

  const langName = locale === "ru" ? t(locale, "russian") : locale === "en" ? t(locale, "english") : t(locale, "tajik");

  return (
    <div>
      <Topbar title={t(locale, "settings")} />
      <div className="space-y-5 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <div className="mb-4 flex items-center gap-2 text-gold-300">
              <Building2 className="h-4 w-4" />
              <h3>{t(locale, "company")}</h3>
            </div>
            <p className="mb-4 font-display text-lg text-gold-300">{t(locale, "slogan")}</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">{t(locale, "company")}</dt>
                <dd className="text-right">{t(locale, "appName")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">{t(locale, "ceoName")}</dt>
                <dd className="text-gold-300">ISMOILOV ISMOIL</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-white/45">
                  <MapPin className="h-3.5 w-3.5" /> {t(locale, "city")}
                </dt>
                <dd>{info.city}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/45">{t(locale, "status")}</dt>
                <dd className="text-teal-400">{roleLabel(locale, user?.role)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <div className="mb-4 flex items-center gap-2 text-gold-300">
              <Globe className="h-4 w-4" />
              <h3>{t(locale, "language")}</h3>
            </div>
            <p className="mb-3 text-sm text-white/55">{langName}</p>
            <LanguageSwitch />
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <Bell className="h-4 w-4 text-gold-400" /> {t(locale, "notificationsOn")}
                </span>
                <span className="text-teal-400">{t(locale, "alwaysOn")}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-sm">
                <span className="text-white/70">{t(locale, "darkMode")}</span>
                <span className="text-gold-300">{t(locale, "alwaysOn")}</span>
              </div>
            </div>
          </div>
        </div>

        {money && (
        <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <div className="mb-4 flex items-center gap-2 text-gold-300">
            <FileText className="h-4 w-4" />
            <h3>{t(locale, "exportReport")}</h3>
          </div>
          <p className="mb-4 text-sm text-white/55">{t(locale, "exportHint")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await exportReport("pdf", "monthly", locale);
                } finally {
                  setBusy(false);
                }
              }}
              className="btn-gold gap-2"
            >
              <FileText className="h-4 w-4" />
              {busy ? t(locale, "loading") : t(locale, "openPdf")}
            </button>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await exportReport("excel", "monthly", locale);
                } finally {
                  setBusy(false);
                }
              }}
              className="btn-ghost gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
          </div>
        </div>
        )}

        <form onSubmit={savePassword} className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <div className="mb-4 flex items-center gap-2 text-gold-300">
            <Lock className="h-4 w-4" />
            <h3>{t(locale, "changePassword")}</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="password"
              className="rounded-xl border border-white/10 bg-oil-900 px-3 py-3 text-sm"
              placeholder={t(locale, "currentPassword")}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <input
              type="password"
              className="rounded-xl border border-white/10 bg-oil-900 px-3 py-3 text-sm"
              placeholder={t(locale, "newPassword")}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <button className="btn-gold mt-4">{t(locale, "save")}</button>
          {msg && <p className="mt-3 text-sm text-teal-400">{msg}</p>}
        </form>

        <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
          <div className="mb-2 flex items-center gap-2 text-gold-300">
            <Shield className="h-4 w-4" />
            <h3>{t(locale, "about")}</h3>
          </div>
          <p className="text-sm text-white/60">{t(locale, "aboutApp")}</p>
          <p className="mt-3 text-xs text-white/40">
            {t(locale, "version")} {info.version}
          </p>
        </div>
      </div>
    </div>
  );
}
