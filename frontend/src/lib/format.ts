export function money(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);
}

export function qty(n: number, unit = "bbl") {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n || 0)} ${unit}`;
}

export function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
}

export function signedPct(n: number) {
  const v = Number(n || 0);
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}
