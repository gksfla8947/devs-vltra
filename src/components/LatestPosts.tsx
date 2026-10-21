"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PostSummary } from "@/lib/post-summary";
import PostCover from "./PostCover";

export default function LatestPosts({ posts }: { posts: PostSummary[] }) {
  const [index, setIndex] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const current = index % Math.max(posts.length, 1);

  useEffect(() => {
    if (posts.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % posts.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [posts.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = slideRef.current?.animate(
      [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
    return () => animation?.cancel();
  }, [current]);

  const post = posts[current];
  if (!post) return null;
  function select(next: number) {
    setIndex((next + posts.length) % posts.length);
  }
  return (
    <section className="latest-posts" aria-label="최신 글 소개" aria-roledescription="캐러셀">
      <div className="latest-slide" ref={slideRef} aria-live="off">
        <div className="latest-copy">
          <div className="flex flex-wrap gap-3 mb-4 text-xs font-semibold">
            <span className="latest-badge">최신 글</span>
            <span className="latest-badge text-[var(--muted)]">{post.category}</span>
          </div>
          <h1 className="latest-title"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h1>
          <p className="latest-description">{post.description}</p>
          <Link className="latest-read" href={`/posts/${post.slug}`}>글 읽기 <span aria-hidden="true">↗</span></Link>
        </div>
        <Link className="latest-image" href={`/posts/${post.slug}`} aria-label={`${post.title} 읽기`} tabIndex={-1}>
          <PostCover key={post.slug} post={post} priority />
        </Link>
      </div>
      {posts.length > 1 && <div className="latest-controls">
        <button type="button" className="carousel-arrow" onClick={() => select(current - 1)} aria-label="이전 최신 글">←</button>
        <button type="button" className="carousel-arrow" onClick={() => select(current + 1)} aria-label="다음 최신 글">→</button>
        <div className="flex items-center gap-1 ml-2">
          {posts.map((item, position) => <button type="button" key={item.slug} className="carousel-dot" aria-label={`${position + 1}번째 최신 글: ${item.title}`} aria-current={position === current ? "true" : undefined} onClick={() => select(position)}><span /></button>)}
        </div>
      </div>}
    </section>
  );
}
