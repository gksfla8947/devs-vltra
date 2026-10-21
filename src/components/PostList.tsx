"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import type { PostSummary } from "@/lib/post-summary";

const PAGE_SIZE = 9;

interface PostListProps {
  posts: PostSummary[];
  categories: { name: string; count: number }[];
  viewsMap?: Record<string, number>;
}

export default function PostList({ posts, categories, viewsMap }: PostListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const query = search.trim().toLowerCase();
  const filtered = posts.filter((post) =>
    (activeCategory === null || post.category === activeCategory) &&
    (!query || [post.title, post.description, ...post.tags].some((text) => text.toLowerCase().includes(query)))
  );
  const shown = filtered.slice(0, visibleCount);

  return (
    <section id="posts" className="home-posts scroll-mt-24" aria-labelledby="posts-heading">
      <div className="category-list" role="group" aria-label="글 카테고리">
        {[{ name: null, count: posts.length }, ...categories].map((category) => (
          <button type="button" key={category.name ?? "__all"} className="category-filter" aria-pressed={activeCategory === category.name}
            onClick={() => { setActiveCategory(category.name); setVisibleCount(PAGE_SIZE); }}>
            {category.name ?? "전체"}<span className="ml-2 text-xs opacity-70">{category.count}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-9 mb-7">
        <h2 id="posts-heading" className="text-lg font-semibold">{activeCategory ?? "모든 포스트"}</h2>
        <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="보기 방식" className="view-switch">
          <button type="button" aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}>카드</button>
          <button type="button" aria-pressed={layout === "list"} onClick={() => setLayout("list")}>리스트</button>
        </div>
        <div className="relative flex-1 min-w-40 sm:w-60">
          <label htmlFor="post-search" className="sr-only">제목, 설명, 태그로 검색</label>
          <input id="post-search" type="search" value={search} placeholder="제목, 설명, 태그 검색" className="post-search"
            onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE); }} />
        </div>
        </div>
      </div>
      {shown.length ? <div className="post-grid" data-layout={layout}>{shown.map((post) => <PostCard key={post.slug} post={post} views={viewsMap?.[post.slug]} />)}</div>
        : <p className="py-20 text-center text-[var(--muted)]">{posts.length ? "조건에 맞는 글이 없습니다." : "아직 작성된 글이 없습니다."}</p>}
      <div className="mt-10 text-center">
        <p role="status" className="mb-4 text-xs text-[var(--muted)]">{filtered.length}개의 글 중 {shown.length}개 표시</p>
        {shown.length < filtered.length && <button type="button" className="load-more" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>더 보기 <span aria-hidden="true">＋</span></button>}
      </div>
    </section>
  );
}
