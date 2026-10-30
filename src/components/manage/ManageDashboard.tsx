"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bulkUpdatePosts } from "@/app/manage/actions";
import Pagination from "@/components/Pagination";
import PdfExportButton from "@/components/PdfExportButton";
import { useListState, useListScroll } from "@/hooks/useListState";
import VisitStats from "@/components/manage/VisitStats";
import type { StatsData } from "@/lib/stats-date";

export interface PostRow {
  id: string;
  title: string;
  category: string;
  published: boolean;
  date: string;
}

export default function ManageDashboard({ preview }: { preview?: { posts: PostRow[]; stats: StatsData } }) {
  const [posts, setPosts] = useState<PostRow[]>(preview?.posts ?? []);
  const [loading, setLoading] = useState(!preview);
  const [statsReady, setStatsReady] = useState(!!preview);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [reload, setReload] = useState(0);
  const prefix = preview ? "manage-preview" : "manage";
  const [search, setSearch] = useListState(`${prefix}:search`, "");
  const [page, setPage] = useListState(`${prefix}:page`, 1);
  const [pageSize, setPageSize] = useListState(`${prefix}:pageSize`, 10);
  useListScroll(prefix, !loading && statsReady);

  useEffect(() => {
    if (preview) return;
    fetch("/api/manage/posts")
      .then((r) => { if (!r.ok) throw new Error("글 목록을 불러오지 못했습니다."); return r.json(); })
      .then((data) => {
        setPosts(data.posts ?? []);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [reload, preview]);

  function select(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function apply(action: "publish" | "unpublish" | "delete" | "category", ids = [...selected]) {
    if (busy || !ids.length) return;
    if (action === "category" && !category.trim()) { setError("변경할 카테고리를 입력하세요."); return; }
    if (action === "delete" && !confirm(`선택한 ${ids.length}개의 글을 삭제하시겠습니까? 연결된 이미지와 댓글도 삭제되며 되돌릴 수 없습니다.`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = preview ? { succeeded: ids, failed: [] } : await bulkUpdatePosts(ids, action, category);
      const done = new Set(result.succeeded);
      setPosts((previous) => action === "delete" ? previous.filter((post) => !done.has(post.id)) : previous.map((post) =>
        !done.has(post.id) ? post : action === "category" ? { ...post, category: category.trim() } : { ...post, published: action === "publish" }));
      setSelected((previous) => new Set([...previous].filter((id) => !done.has(id))));
      setMessage(`${done.size}개 글 ${action === "delete" ? "삭제" : action === "category" ? "카테고리 변경" : action === "publish" ? "공개" : "비공개"} 완료`);
      if (result.failed.length) setError(`${result.failed.length}개 글 처리에 실패했습니다. 선택된 글을 다시 확인하세요.`);
    } catch (err) { setError(err instanceof Error ? err.message : "작업에 실패했습니다."); }
    finally { setBusy(false); }
  }

  const filtered = posts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              ← 블로그
            </Link>
            <h1 className="text-lg font-bold text-[var(--foreground)]">관리자</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/manage/drafts"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
            >
              임시글
            </Link>
            <Link
              href="/manage/new-post"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              + 새 글 작성
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {preview && <p className="mb-5 text-sm text-[var(--muted)]">디자인 확인용 예시 데이터입니다. 여기서의 변경은 실제 게시글에 영향을 주지 않습니다.</p>}
        <VisitStats preview={preview?.stats} onReady={setStatsReady} />
        <h2 className="mb-4 text-lg font-semibold">글 관리 <span className="text-sm font-normal text-[var(--muted)]">{posts.length}개</span></h2>
        {message && <p role="status" className="mb-4 text-sm text-[var(--accent)]">{message}</p>}
        {error && <div role="alert" className="mb-4 flex gap-3 text-sm text-red-500">{error}<button type="button" className="underline" disabled={busy} onClick={() => { setError(""); setLoading(true); setReload(reload + 1); }}>목록 다시 불러오기</button></div>}
        {/* Search */}
        {!loading && posts.length > 0 && (
          <div className="relative mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              disabled={busy}
              onChange={(e) => { setSearch(e.target.value); setPage(1); setSelected(new Set()); }}
              placeholder="제목, 카테고리, 슬러그로 검색..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {search && (
              <button
                disabled={busy}
                onClick={() => { setSearch(""); setPage(1); setSelected(new Set()); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-[var(--muted)]">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] mb-4">작성된 글이 없습니다.</p>
            <Link
              href="/manage/new-post"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90"
            >
              첫 글 작성하기
            </Link>
          </div>
        ) : (
          <>
            <fieldset disabled={busy} className="mb-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 disabled:opacity-60">
              <legend className="sr-only">여러 글 선택 및 일괄 작업</legend>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" aria-label="현재 페이지 전체 선택" checked={paged.length > 0 && paged.every((post) => selected.has(post.id))} ref={(element) => { if (element) element.indeterminate = paged.some((post) => selected.has(post.id)) && !paged.every((post) => selected.has(post.id)); }} onChange={(event) => setSelected((previous) => {
                  const next = new Set(previous); paged.forEach((post) => { if (event.target.checked) next.add(post.id); else next.delete(post.id); }); return next;
                })} />현재 페이지 선택</label>
                <span className="text-[var(--accent)]">{selected.size}개 선택</span>
                <button className="text-xs underline disabled:opacity-40" disabled={filtered.length > 500} onClick={() => setSelected(new Set(filtered.map((post) => post.id)))}>검색 결과 전체 선택 ({filtered.length})</button>
                {selected.size > 0 && <button className="text-xs text-[var(--muted)]" onClick={() => setSelected(new Set())}>선택 해제</button>}
              </div>
              {selected.size > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--card-border)] pt-4">
                <button onClick={() => apply("publish")} className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs">공개로 변경</button>
                <button onClick={() => apply("unpublish")} className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs">비공개로 변경</button>
                <input aria-label="변경할 카테고리" list="manage-categories" value={category} maxLength={100} onChange={(event) => setCategory(event.target.value)} placeholder="카테고리 선택 또는 입력" className="min-w-40 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs" />
                <datalist id="manage-categories">{[...new Set(posts.map((post) => post.category))].sort().map((name) => <option key={name} value={name} />)}</datalist>
                <button disabled={!category.trim()} onClick={() => apply("category")} className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs disabled:opacity-40">카테고리 변경</button>
                <button onClick={() => apply("delete")} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-500">선택 삭제</button>
              </div>}
            </fieldset>
            {busy && <p role="status" className="mb-3 text-sm text-[var(--muted)]">선택한 글을 처리하고 있습니다...</p>}
            <div className="space-y-2">
              {paged.map((post) => (
                <div
                  key={post.id}
                  className={`flex flex-wrap items-center gap-4 p-4 rounded-lg border bg-[var(--card)] transition-colors ${selected.has(post.id) ? "border-[var(--accent)]" : "border-[var(--card-border)]"}`}
                >
                  <input type="checkbox" checked={selected.has(post.id)} disabled={busy} onChange={() => select(post.id)} aria-label={`${post.title} 선택`} />
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      post.published ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    title={post.published ? "공개" : "비공개"}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                      <span>{post.category}</span>
                      <span>·</span>
                      <span>{post.date?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PdfExportButton slug={post.id} />
                    <button
                      disabled={busy}
                      onClick={() => apply(post.published ? "unpublish" : "publish", [post.id])}
                      className="px-3 py-1.5 text-xs rounded-md border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
                    >
                      {post.published ? "비공개로" : "공개로"}
                    </button>
                    <Link
                      href={`/manage/edit/${post.id}`}
                      className="px-3 py-1.5 text-xs rounded-md border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      disabled={busy}
                      onClick={() => apply("delete", [post.id])}
                      className="px-3 py-1.5 text-xs rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </main>
    </div>
  );
}
