"use client";

import { useEffect, useRef, useState } from "react";
import { extractTagText } from "@/lib/tag-suggestions";

interface Props {
  title: string;
  getBlocks: () => unknown[];
  onApply: (description: string) => void;
  disabled: boolean;
}

export default function AiDescription({ title, getBlocks, onApply, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function generate() {
    if (requestRef.current || disabled) return;
    const text = extractTagText(getBlocks());
    if (!title.trim() && !text) { setError("제목이나 본문을 먼저 작성해주세요."); return; }
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 30_000);
    setLoading(true);
    setError("");
    setSuggestion("");
    try {
      const response = await fetch("/api/manage/description/suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.signal, body: JSON.stringify({ title, text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "요약 생성에 실패했습니다.");
      if (typeof data.description !== "string" || !data.description.trim() || data.description.length > 150) throw new Error("올바른 요약 응답이 아닙니다.");
      if (!controller.signal.aborted) setSuggestion(data.description);
    } catch (err) {
      setError(controller.signal.aborted ? "요청 시간이 초과되었습니다. 다시 시도해주세요." : err instanceof Error ? err.message : "요약 생성에 실패했습니다.");
    } finally {
      clearTimeout(timer);
      requestRef.current = null;
      setLoading(false);
    }
  }

  return <div className="space-y-2 mb-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <label htmlFor="post-description" className="text-sm font-semibold text-[var(--foreground)]">부제목 · 소개글</label>
      <button type="button" onClick={generate} disabled={loading || disabled} className="text-xs px-2 py-1 rounded border border-[var(--card-border)] text-[var(--accent)] hover:bg-[var(--card-hover)] disabled:opacity-50">
        {loading ? "요약 중…" : "✨ AI 한 줄 요약"}
      </button>
    </div>
    <p className="text-xs text-[var(--muted)]">제목과 본문 텍스트를 Gemini로 보내 한 문장으로 요약합니다.</p>
    <div aria-live="polite" aria-busy={loading}>
      {error && <p role="alert" className="text-xs text-[var(--danger)]">{error}</p>}
      {suggestion && <div className="p-3 rounded-lg bg-[var(--accent-glow)] space-y-2">
        <p className="text-sm text-[var(--foreground)]">{suggestion}</p>
        <button type="button" disabled={disabled} onClick={() => { onApply(suggestion); setSuggestion(""); }} className="text-xs font-semibold text-[var(--accent)] disabled:opacity-50">소개글에 적용</button>
      </div>}
    </div>
  </div>;
}
