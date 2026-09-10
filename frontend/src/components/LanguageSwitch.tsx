"use client";

import { Locale } from "@/lib/i18n";
import { useLocale } from "@/store/locale";

const langs: { id: Locale; label: string }[] = [
  { id: "tg", label: "ТОҶ" },
  { id: "ru", label: "РУ" },
  { id: "en", label: "EN" },
];

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  return (
    <div className={`flex rounded-xl border border-white/10 bg-oil-900/80 p-1 ${compact ? "w-full" : ""}`}>
      {langs.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLocale(l.id)}
          className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold tracking-wide ${
            locale === l.id ? "bg-gold-500/25 text-gold-300" : "text-white/50 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
