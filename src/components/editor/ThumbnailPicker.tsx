"use client";

import { useRef, useState } from "react";

export default function ThumbnailPicker({ value, images, slug, disabled, onChange, onBusyChange }: {
  value: string | null;
  images: string[];
  slug: string;
  disabled: boolean;
  onChange: (url: string | null) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const preview = value ?? images[0];
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("JPG, PNG, WebP, GIF 이미지를 선택해주세요."); return;
    }
    if (file.size > 4 * 1024 * 1024) { setError("4MB 이하의 이미지를 선택해주세요."); return; }
    setUploading(true);
    onBusyChange(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (slug) form.append("postSlug", slug);
      const response = await fetch("/api/manage/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string") throw new Error(result.error || "이미지 업로드에 실패했습니다.");
      onChange(result.url);
      setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  }
  return <div className="mb-5">
    <button type="button" disabled={disabled || uploading} onClick={() => setOpen(!open)} aria-expanded={open}
      className="relative w-full aspect-video overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--background)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]">
      {preview && <img src={preview} alt="선택한 썸네일 미리보기" className="w-full h-full object-cover" />}
      <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-lg bg-[var(--card)]/95 border border-[var(--card-border)] px-3 py-2 text-sm font-medium">{uploading ? "업로드 중…" : preview ? "썸네일 변경" : "썸네일 선택"}</span></span>
    </button>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="썸네일 이미지 업로드" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
    {open && <div className="mt-3 space-y-3">
      <button type="button" disabled={disabled || uploading} onClick={() => input.current?.click()} className="w-full rounded-lg border border-[var(--card-border)] py-2 text-sm hover:bg-[var(--accent-glow)]">컴퓨터에서 업로드</button>
      <p className="text-xs text-[var(--muted)]">본문 이미지에서 선택</p>
      {images.length ? <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {images.map((url, index) => <button key={url} type="button" disabled={disabled || uploading} aria-label={`본문 이미지 ${index + 1} 선택`} aria-pressed={value === url}
          onClick={() => { onChange(url); setOpen(false); setError(""); }} className={`aspect-video overflow-hidden rounded border-2 ${value === url ? "border-[var(--accent)]" : "border-transparent"}`}>
          <img src={url} alt={`본문 이미지 ${index + 1}`} className="h-full w-full object-cover" />
        </button>)}
      </div> : <p className="text-xs text-[var(--muted)]">본문에 이미지가 없습니다. 직접 업로드할 수 있습니다.</p>}
      <button type="button" disabled={disabled || uploading} onClick={() => { onChange(null); setOpen(false); }} className="text-xs text-[var(--muted)] underline">자동 선택으로 되돌리기</button>
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
  </div>;
}
