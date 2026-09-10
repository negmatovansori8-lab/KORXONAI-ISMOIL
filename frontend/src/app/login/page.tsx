"use client";

import { FormEvent, useState } from "react";
import { Droplets } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useLocale } from "@/store/locale";
import { roleLabel, t } from "@/lib/i18n";
import { homeFor } from "@/lib/access";
import { LanguageSwitch } from "@/components/LanguageSwitch";

const demos = [
  ["CEO", "ceo@oilenterprise.tj", "CEO@2026"],
  ["MANAGER", "manager@oilenterprise.tj", "Manager@2026"],
  ["ADMIN", "admin@oilenterprise.tj", "Admin@2026"],
  ["EMPLOYEE", "employee@oilenterprise.tj", "Employee@2026"],
];

export default function LoginPage() {
  const setSession = useAuth((s) => s.setSession);
  const locale = useLocale((s) => s.locale);
  const [email, setEmail] = useState("ceo@oilenterprise.tj");
  const [password, setPassword] = useState("CEO@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email: email.trim(), password });
      if (!data?.token || !data?.user) {
        setError(t(locale, "invalidLogin"));
        return;
      }
      setSession(data.token, data.user);
      window.location.replace(homeFor(data.user.role));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status === 401 ? t(locale, "invalidLogin") : t(locale, "loginNetwork"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="oil-grid relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-tajik-red via-gold-400 to-tajik-green" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(226,184,74,.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(200,16,46,.12),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(26,127,76,.14),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-6 px-4 py-6 lg:grid-cols-2 lg:gap-10 lg:px-5 lg:py-8">
        <div className="order-2 hidden lg:order-1 lg:block">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-700 shadow-glow">
            <Droplets className="h-7 w-7 text-oil-950" />
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold-400">{t(locale, "energyLine")}</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-white md:text-5xl">{t(locale, "appName")}</h1>
          <p className="mt-3 font-display text-2xl text-gold-300 md:text-3xl">{t(locale, "slogan")}</p>
          <p className="mt-3 font-display text-xl text-white/90">ISMOILOV ISMOIL</p>
          <p className="text-sm text-white/55">{t(locale, "chairmanTitle")}</p>
          <p className="mt-4 max-w-lg text-white/65">{t(locale, "tagline")}</p>
        </div>
        <form onSubmit={onSubmit} className="order-1 rounded-3xl border border-white/10 bg-oil-850/80 p-5 shadow-card backdrop-blur-xl lg:order-2 md:p-8">
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-700 shadow-glow">
              <Droplets className="h-5 w-5 text-oil-950" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400">{t(locale, "shortName")}</p>
              <p className="font-display text-lg leading-tight text-white">{t(locale, "slogan")}</p>
            </div>
          </div>
          <div className="mb-5 max-w-[220px]">
            <LanguageSwitch compact />
          </div>
          <h2 className="font-display text-2xl text-white">{t(locale, "login")}</h2>
          <label className="mt-6 block text-xs uppercase tracking-widest text-white/45">{t(locale, "email")}</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-oil-900 px-4 py-3 text-white"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="mt-4 block text-xs uppercase tracking-widest text-white/45">{t(locale, "password")}</label>
          <input
            type="password"
            className="mt-2 w-full rounded-xl border border-white/10 bg-oil-900 px-4 py-3 text-white"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
          <button disabled={loading} className="btn-gold mt-6 w-full">
            {loading ? t(locale, "loading") : t(locale, "signIn")}
          </button>
          <p className="mt-6 text-xs uppercase tracking-widest text-white/40">{t(locale, "loginHint")}</p>
          <div className="mt-3 grid gap-2">
            {demos.map(([role, e, p]) => (
              <button
                type="button"
                key={role}
                onClick={() => {
                  setEmail(e);
                  setPassword(p);
                }}
                className="flex justify-between rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-white/70 hover:border-gold-500/30"
              >
                <span>{roleLabel(locale, role)}</span>
                <span className="text-white/40">{e}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </main>
  );
}
