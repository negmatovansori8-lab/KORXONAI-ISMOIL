import type { Locale } from "@/lib/i18n";

const MONTHS: Record<Locale, string[]> = {
  tg: ["январ", "феврал", "март", "апрел", "май", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const MONTHS_SHORT: Record<Locale, string[]> = {
  tg: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

function loc(locale?: Locale): Locale {
  return locale === "ru" || locale === "en" ? locale : "tg";
}

export function monthName(d: Date, locale?: Locale, short = false) {
  const l = loc(locale);
  return (short ? MONTHS_SHORT : MONTHS)[l][d.getMonth()];
}

export function formatDate(value: string | Date, locale?: Locale) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${monthName(d, locale)} ${d.getFullYear()}`;
}

export function formatDateTime(value: string | Date, locale?: Locale) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d, locale)}, ${hh}:${mm}`;
}

export function periodTitle(period: string, locale?: Locale, now = new Date()) {
  const l = loc(locale);
  if (period === "daily") return formatDate(now, l);
  if (period === "yearly") return l === "en" ? `Year ${now.getFullYear()}` : l === "ru" ? `Год ${now.getFullYear()}` : `Соли ${now.getFullYear()}`;
  return `${monthName(now, l)} ${now.getFullYear()}`;
}

export function chartAxisLabel(iso: string, period: string, locale?: Locale) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const l = loc(locale);
  if (period === "daily") return `${String(d.getHours()).padStart(2, "0")}:00`;
  if (period === "yearly") return `${monthName(d, l, true)} ${d.getFullYear()}`;
  return `${d.getDate()} ${monthName(d, l, true)} ${d.getFullYear()}`;
}

export function chartFullLabel(iso: string, period: string, locale?: Locale) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const l = loc(locale);
  if (period === "daily") {
    const hour = `${String(d.getHours()).padStart(2, "0")}:00`;
    return l === "en" ? `${formatDate(d, l)}, ${hour}` : `${formatDate(d, l)}, соат ${hour}`;
  }
  if (period === "yearly") return `${monthName(d, l)} ${d.getFullYear()}`;
  return formatDate(d, l);
}

export function localizeCharts<T extends { at?: string }>(rows: T[] | undefined, period: string, locale?: Locale) {
  return (rows ?? []).map((row) => ({
    ...row,
    axis: row.at ? chartAxisLabel(row.at, period, locale) : "",
    full: row.at ? chartFullLabel(row.at, period, locale) : "",
  }));
}

export const timeAxisProps = {
  dataKey: "axis" as const,
  stroke: "#8b97a8",
  fontSize: 10,
  interval: 0 as const,
  angle: -38,
  textAnchor: "end" as const,
  height: 62,
  tickMargin: 6,
};
