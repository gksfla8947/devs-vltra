/** One calendar for browser deduplication, Redis keys and admin charts. */
export function koreaDate(date = new Date()) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function shiftDate(day: string, amount: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export type StatsData = {
  asOf: string; today: string; started: string | null;
  views: Record<string, number>; visitors: Record<string, number>;
  totalViews: number; totalVisitors: number;
};

export function periodBuckets(data: StatsData, metric: "views" | "visitors", period: "day" | "week" | "month", offset: number) {
  const count = period === "day" ? 14 : 12;
  const anchor = new Date(`${data.today}T00:00:00Z`);
  if (period === "week") anchor.setUTCDate(anchor.getUTCDate() - (anchor.getUTCDay() + 6) % 7);
  if (period === "month") anchor.setUTCDate(1);
  return Array.from({ length: count }, (_, index) => {
    const delta = index - count + 1 - offset * count;
    const start = new Date(anchor);
    if (period === "month") start.setUTCMonth(start.getUTCMonth() + delta);
    else start.setUTCDate(start.getUTCDate() + delta * (period === "week" ? 7 : 1));
    const end = new Date(start);
    if (period === "month") end.setUTCMonth(end.getUTCMonth() + 1);
    else end.setUTCDate(end.getUTCDate() + (period === "week" ? 7 : 1));
    const from = start.toISOString().slice(0, 10);
    const to = shiftDate(end.toISOString().slice(0, 10), -1);
    const last = to > data.today ? data.today : to;
    const first = data.started && from < data.started ? data.started : from;
    let value: number | null = null;
    if (data.started && first <= last) {
      value = 0;
      for (let day = first; day <= last; day = shiftDate(day, 1)) value += Number(data[metric][day] ?? 0);
    }
    return { from, to, value, partial: value !== null && (first !== from || to >= data.today || from === data.started) };
  });
}
