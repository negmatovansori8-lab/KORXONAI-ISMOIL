export function periodRange(period: string) {
  const now = new Date();
  const from = new Date(now);

  if (period === "daily") {
    from.setHours(0, 0, 0, 0);
  } else if (period === "yearly") {
    from.setMonth(0, 1);
    from.setHours(0, 0, 0, 0);
  } else {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
  }

  return { from, to: now };
}

export function previousRange(period: string) {
  const now = new Date();
  if (period === "daily") {
    const from = new Date(now);
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (period === "yearly") {
    return {
      from: new Date(now.getFullYear() - 1, 0, 1),
      to: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()),
    };
  }
  const last = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const day = Math.min(now.getDate(), last);
  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    to: new Date(now.getFullYear(), now.getMonth() - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()),
  };
}

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
}

export function num(v: unknown) {
  return Number(v ?? 0);
}
