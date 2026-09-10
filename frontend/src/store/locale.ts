import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Locale } from "@/lib/i18n";

type LocaleState = { locale: Locale; setLocale: (l: Locale) => void };

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "tg",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "oems-locale" }
  )
);
