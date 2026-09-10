import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { TelegramWebApp } from "@/components/TelegramWebApp";

const sans = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });
const display = Cinzel({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "KORXONAI NEFTI TOJIK",
  description: "KORXONAI NEFTI TOJIK — Нефт — сарвати миллат. Mini App for finance, production, workforce and warehouse.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#07090c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <TelegramWebApp />
        {children}
      </body>
    </html>
  );
}
