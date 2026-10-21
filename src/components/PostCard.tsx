"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { format } from "date-fns";
import type { PostSummary } from "@/lib/post-summary";
import PostCover from "./PostCover";

export default function PostCard({ post, views }: { post: PostSummary; views?: number }) {
  function moveGlow(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  }
  return (
    <article className="post-card" onPointerMove={moveGlow}>
      <Link href={`/posts/${post.slug}`} className="post-card-link">
        <PostCover post={post} />
        <div className="post-card-content">
          <span className="text-xs font-semibold text-[var(--accent)]">{post.category}</span>
          <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight line-clamp-2">{post.title}</h3>
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed line-clamp-2">{post.description}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-xs text-[var(--muted)]">
            {post.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
          <div className="flex items-center justify-between gap-3 mt-auto pt-6 text-xs text-[var(--muted)]">
            <time dateTime={post.date}>{format(new Date(post.date), "yyyy.MM.dd")}</time>
            {views !== undefined && <span>조회 {views.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
