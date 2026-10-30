"use client";

import { useEffect, useState } from "react";
import { periodBuckets, shiftDate, type StatsData } from "@/lib/stats-date";

const button = "rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs hover:bg-[var(--accent-glow)] disabled:opacity-40";

export default function VisitStats({ preview, onReady }: { preview?: StatsData; onReady?: (ready: boolean) => void } = {}) {
  const [data, setData] = useState<StatsData | null>(preview ?? null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(!preview);
  const [metric, setMetric] = useState<"views" | "visitors">("views");
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    fetch("/api/manage/stats", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("통계를 불러오지 못했습니다.");
        return response.json();
      }).then(setData).catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); onReady?.(true); } });
    return () => controller.abort();
  }, [version, preview, onReady]);
  const refresh = () => { setLoading(true); setError(""); setVersion((value) => value + 1); };
  const buckets = data ? periodBuckets(data, metric, period, offset) : [];
  const max = Math.max(1, ...buckets.map((bucket) => bucket.value ?? 0));
  const focused = buckets[hover ?? buckets.length - 1];
  const daily = (kind: "views" | "visitors", day: string) => !data?.started || day < data.started ? null : Number(data[kind][day] ?? 0);
  const format = (value: number | null) => value === null ? "—" : value.toLocaleString();
  const summaries = data ? [
    ["오늘 조회수", daily("views", data.today)], ["어제 조회수", daily("views", shiftDate(data.today, -1))], ["누적 조회수", data.totalViews],
    ["오늘 방문자", daily("visitors", data.today)], ["어제 방문자", daily("visitors", shiftDate(data.today, -1))], ["누적 방문자", data.totalVisitors],
  ] as const : [];

  return <section aria-labelledby="stats-title" className="mb-10 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <h2 id="stats-title" className="text-lg font-semibold">방문 통계</h2>
      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        {data && <span>{new Date(data.asOf).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} 기준</span>}
        <button className={button} disabled={loading || !!preview} onClick={refresh}>새로고침</button>
      </div>
    </div>
    {error && <p role="alert" className="text-sm text-red-500">{error} 새로고침으로 다시 시도하세요.</p>}
    {!data && loading && <p className="py-12 text-center text-[var(--muted)]">통계를 불러오는 중...</p>}
    {data && <>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-border)] sm:grid-cols-3 lg:grid-cols-6">
        {summaries.map(([label, value]) => <div key={label} className="bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted)]">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{format(value)}</p>
        </div>)}
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-medium">{buckets[0]?.from} — {buckets.at(-1)?.to}</p><p className="mt-1 text-xs text-[var(--muted)]">한국 시간 · {period === "day" ? "일별" : period === "week" ? "주별 합계 (월요일 시작)" : "월별 합계"}</p></div>
          <div className="flex flex-wrap gap-2">
            {(["views", "visitors"] as const).map((value) => <button key={value} aria-pressed={metric === value} onClick={() => { setMetric(value); setHover(null); }} className={`${button} ${metric === value ? "bg-[var(--accent)] text-white" : ""}`}>{value === "views" ? "조회수" : "방문자"}</button>)}
            <span className="mx-1 border-l border-[var(--card-border)]" />
            {(["day", "week", "month"] as const).map((value, index) => <button key={value} aria-pressed={period === value} onClick={() => { setPeriod(value); setOffset(0); setHover(null); }} className={`${button} ${period === value ? "bg-[var(--accent)] text-white" : ""}`}>{["일간", "주간", "월간"][index]}</button>)}
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <div className="relative min-w-[520px] pt-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-6 h-44 flex flex-col justify-between">{[1, .75, .5, .25, 0].map((ratio) => <div key={ratio} className="border-t border-dashed border-[var(--card-border)] text-[10px] text-[var(--muted)]">{Math.round(max * ratio)}</div>)}</div>
            <div className="relative ml-8 flex h-52 items-end gap-2">
              {buckets.map((bucket, index) => <button key={bucket.from} onFocus={() => setHover(index)} onMouseEnter={() => setHover(index)} onClick={() => setHover(index)} className="group flex h-full min-w-0 flex-1 flex-col justify-end focus-visible:outline-2 focus-visible:outline-[var(--accent)]" aria-label={`${bucket.from} ~ ${bucket.to}: ${bucket.value === null ? "미집계" : `${bucket.value}${metric === "views" ? "회" : "명"}`}${bucket.partial ? " (일부 기간 집계)" : ""}`}>
                <span className={`mx-auto block w-full max-w-8 rounded-t transition-colors ${bucket.value === null ? "bg-[var(--card-border)]" : "bg-[var(--accent)] opacity-65 group-hover:opacity-100 group-focus:opacity-100"}`} style={{ height: bucket.value === null ? 3 : Math.max(3, bucket.value / max * 176) }} />
                <span className="mt-2 h-6 text-[10px] text-[var(--muted)]">{period === "month" ? bucket.from.slice(0, 7) : bucket.from.slice(5)}</span>
              </button>)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--card-border)] pt-4">
          <button className={button} disabled={!data.started || buckets[0].from <= data.started} onClick={() => { setOffset(offset + 1); setHover(null); }} aria-label="이전 기간">←</button>
          <p className="text-center text-xs text-[var(--muted)]" role="status">{focused?.from} · {focused?.value === null ? "미집계" : `${format(focused?.value ?? null)} ${metric === "views" ? "회" : "명"}`}{focused?.partial ? " (일부 기간 집계)" : ""}</p>
          <button className={button} disabled={!offset} onClick={() => { setOffset(offset - 1); setHover(null); }} aria-label="다음 기간">→</button>
        </div>
      </div>
      <p className="text-xs leading-6 text-[var(--muted)]">{data.started ? `${data.started}부터 기간별 집계 · 첫날과 진행 중인 기간은 일부 기록만 포함합니다.` : "기간별 통계는 기능 적용 후 첫 방문 또는 글 조회부터 수집됩니다."}<br />조회수는 브라우저별 글당 하루 1회, 방문자는 브라우저별 하루 1회 집계합니다. 누적 방문자는 일별 방문자의 누적이며, 누적 조회수는 현재 등록된 글의 합계입니다. 미집계 기간은 —로 표시합니다.</p>
    </>}
  </section>;
}
