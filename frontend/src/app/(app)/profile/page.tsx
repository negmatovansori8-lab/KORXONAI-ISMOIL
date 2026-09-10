"use client";

import { Briefcase, GraduationCap, MapPin, Shield } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/store/auth";
import { useLocale } from "@/store/locale";
import { roleLabel, t } from "@/lib/i18n";
import { td } from "@/lib/dataI18n";

export default function ProfilePage() {
  const user = useAuth((s) => s.user);
  const locale = useLocale((s) => s.locale);
  const emp = user?.employee;
  const name = emp ? `${emp.firstName} ${emp.lastName}` : user?.email;

  return (
    <div>
      <Topbar title={t(locale, "profile")} />
      <div className="space-y-5 p-4 md:p-6">
        <section className="relative overflow-hidden rounded-3xl border border-gold-500/25 bg-gradient-to-br from-oil-800 via-oil-850 to-oil-900 p-6 shadow-glow">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-2xl" />
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold-400">{t(locale, "slogan")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-amber-700 font-display text-2xl text-oil-950 shadow-glow">
              II
            </div>
            <div>
              <h2 className="font-display text-2xl text-white md:text-4xl">{t(locale, "chairmanName")}</h2>
              <p className="mt-1 text-sm text-gold-300">{t(locale, "appName")}</p>
              <p className="text-sm text-white/55">{t(locale, "chairmanOffice")}</p>
            </div>
          </div>
          <p className="relative mt-5 max-w-3xl text-sm leading-relaxed text-white/70">{t(locale, "chairmanBio")}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-gold-300">
              <Briefcase className="h-4 w-4" />
              <h3>{t(locale, "position")}</h3>
            </div>
            <p className="text-sm text-white/75">{t(locale, "chairmanDuty")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-gold-300">
              <GraduationCap className="h-4 w-4" />
              <h3>{t(locale, "education")}</h3>
            </div>
            <p className="text-sm text-white/75">{t(locale, "chairmanEducation")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-oil-800/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-gold-300">
              <MapPin className="h-4 w-4" />
              <h3>{t(locale, "office")}</h3>
            </div>
            <p className="text-sm text-white/75">{t(locale, "chairmanOffice")}</p>
          </div>
        </div>

        <section className="max-w-xl rounded-3xl border border-white/10 bg-oil-800/70 p-6">
          <div className="mb-3 flex items-center gap-2 text-gold-300">
            <Shield className="h-4 w-4" />
            <h3>{t(locale, "account")}</h3>
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-400">{roleLabel(locale, user?.role)}</p>
          <h2 className="mt-2 font-display text-2xl">{name}</h2>
          <p className="mt-1 text-white/60">{td(locale, emp?.position)}</p>
          <p className="mt-1 text-sm text-white/45">{td(locale, emp?.department?.name)}</p>
          <p className="mt-6 text-sm text-white/55">{user?.email}</p>
        </section>
      </div>
    </div>
  );
}
