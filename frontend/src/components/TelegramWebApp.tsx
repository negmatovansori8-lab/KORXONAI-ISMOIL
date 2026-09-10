"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (c: string) => void;
        setBackgroundColor: (c: string) => void;
        disableVerticalSwipes?: () => void;
        enableClosingConfirmation: () => void;
        isExpanded?: boolean;
        initData?: string;
      };
    };
  }
}

export function TelegramWebApp() {
  useEffect(() => {
    const boot = () => {
      const tg = window.Telegram?.WebApp;
      if (!tg) return false;
      document.documentElement.classList.add("telegram-mini");
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#07090c");
      tg.setBackgroundColor("#07090c");
      tg.enableClosingConfirmation();
      tg.disableVerticalSwipes?.();
      return true;
    };

    if (boot()) return;
    const id = window.setInterval(() => {
      if (boot()) window.clearInterval(id);
    }, 200);
    const stop = window.setTimeout(() => window.clearInterval(id), 4000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, []);
  return null;
}
