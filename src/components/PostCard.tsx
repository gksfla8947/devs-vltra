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
    <article className="post-card">
      <Link href={`/posts/${post.slug}`} className="post-card-link">
        <div className="post-card-media" onPointerMove={moveGlow}>
          <PostCover post={post} />
        </div>
        <div className="post-card-content">
          <span className="text-xs font-semibold text-[var(--accent)]">{post.category}</span>
          <h3 className="post-card-title">{post.title}</h3>
          <p className="post-card-description">{post.description}</p>
          <div className="post-card-tags">
            {post.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
          <div className="post-card-meta">
            <time dateTime={post.date}>{format(new Date(post.date), "yyyy.MM.dd")}</time>
            {views !== undefined && <span>조회 {views.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
