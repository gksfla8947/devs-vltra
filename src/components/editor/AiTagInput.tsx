"use client";

import { useEffect, useRef, useState } from "react";
import TagInput from "./TagInput";
import { extractTagText, tagKey } from "@/lib/tag-suggestions";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  title: string;
  getBlocks: () => unknown[];
}

export default function AiTagInput({ tags, onChange, title, getBlocks }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const available = suggestions?.filter((tag) => !tags.some((current) => tagKey(current) === tagKey(tag)));

  async function recommend() {
    if (controller.current) return;
    const text = extractTagText(getBlocks());
    if (!title.trim() && !text) { setError("제목이나 본문을 먼저 작성해주세요."); return; }
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    setError("");
    setSuggestions(null);
    const timer = setTimeout(() => abort.abort(), 35_000);
    try {
      const response = await fetch("/api/manage/tags/suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, selectedTags: tags }), signal: abort.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "태그 추천에 실패했습니다.");
      if (!Array.isArray(data.tags) || data.tags.some((tag: unknown) => typeof tag !== "string")) throw new Error("잘못된 추천 응답입니다.");
      setSuggestions(data.tags);
    } catch (err) {
      setError(abort.signal.aborted ? "요청 시간이 초과되었습니다. 다시 시도해주세요." : err instanceof Error ? err.message : "태그 추천에 실패했습니다.");
    } finally {
      clearTimeout(timer);
      controller.current = null;
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <div className="flex-1 min-w-0"><TagInput tags={tags} onChange={onChange} /></div>
        <button type="button" disabled={loading} onClick={recommend} className="px-3 py-2 text-sm rounded-lg border border-[var(--card-border)] text-[var(--accent)] bg-[var(--card)] hover:bg-[var(--card-hover)] disabled:opacity-50 shrink-0">
          {loading ? "태그 분석 중…" : "✨ AI 태그 추천"}
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">추천 시 제목과 본문 텍스트가 Gemini로 전송됩니다. 추천 태그를 눌러 추가하세요.</p>
      <div aria-live="polite" aria-busy={loading}>
        {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
        {available && (available.length ? <div className="flex flex-wrap gap-2">{available.map((tag) => <button key={tag} type="button" onClick={() => onChange([...tags, tag])} className="px-3 py-1 text-sm rounded-full border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-glow)]">+ {tag}</button>)}</div> : <p className="text-sm text-[var(--muted)]">추가할 추천 태그가 없습니다.</p>)}
      </div>
    </div>
  );
}
