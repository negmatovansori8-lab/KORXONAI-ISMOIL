"use client";

import { ReactNode } from "react";

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-oil-800/70 p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-sm font-medium tracking-wide text-gold-300">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-white/50">{subtitle}</p>}
      </div>
      <div className="h-72">{children}</div>
    </section>
  );
}
