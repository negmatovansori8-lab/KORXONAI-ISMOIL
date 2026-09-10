"use client";

import { motion } from "framer-motion";
import { signedPct } from "@/lib/format";

type Props = {
  label: string;
  value: string;
  pct: number;
  showPct: boolean;
  accent?: "gold" | "teal" | "rose" | "slate";
};

const accents = {
  gold: "from-gold-500/25 via-transparent to-transparent",
  teal: "from-teal-400/20 via-transparent to-transparent",
  rose: "from-rose-500/25 via-transparent to-transparent",
  slate: "from-sky-400/20 via-transparent to-transparent",
};

export function KpiCard({ label, value, pct, showPct, accent = "gold" }: Props) {
  const up = pct >= 0;
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 6, rotateY: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="kpi-3d group relative overflow-hidden rounded-2xl border border-white/10 bg-oil-800/80 p-5 shadow-card"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accents[accent]}`} />
      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</p>
        <p className="mt-3 font-display text-2xl text-white md:text-[28px]">{value}</p>
        {showPct && (
          <p className={`mt-2 text-sm ${up ? "text-teal-400" : "text-rose-400"}`}>
            {signedPct(pct)} { "нисбат ба давраи пеш" }
          </p>
        )}
      </div>
    </motion.div>
  );
}
