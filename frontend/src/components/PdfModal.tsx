"use client";

import { Download, X } from "lucide-react";
import { useLocale } from "@/store/locale";
import { t } from "@/lib/i18n";
import { useUi } from "@/store/ui";

export function PdfModal() {
  const { pdfUrl, pdfName, setPdf } = useUi();
  const locale = useLocale((s) => s.locale);
  if (!pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm md:items-center">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gold-500/35 bg-oil-900 shadow-glow">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-oil-900 to-oil-800 px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400">KORXONAI NEFTI TOJIK</p>
            <p className="text-sm text-white">{pdfName}</p>
          </div>
          <div className="flex gap-2">
            <a href={pdfUrl} download={pdfName} className="btn-gold px-3 py-2 text-xs">
              <Download className="h-4 w-4" /> {t(locale, "savePdf")}
            </a>
            <button onClick={() => setPdf(null)} className="btn-ghost px-3 py-2">
              <X className="h-4 w-4" /> {t(locale, "close")}
            </button>
          </div>
        </div>
        <iframe title="PDF" src={pdfUrl} className="min-h-[72vh] w-full bg-white" />
      </div>
    </div>
  );
}
