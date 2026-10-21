"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostSummary } from "@/lib/post-summary";
import PostCover from "./PostCover";

export default function LatestPosts({ posts }: { posts: PostSummary[] }) {
  // End clones let both directions wrap by one slide instead of crossing the track.
  const [slide, setSlide] = useState({ position: 1, moving: false });
  const current = (slide.position - 1 + posts.length) % Math.max(posts.length, 1);
  const slides = posts.length > 1 ? [posts[posts.length - 1], ...posts, posts[0]] : posts;

  useEffect(() => {
    if (posts.length < 2) return;
    const timer = window.setInterval(() => {
      setSlide((value) => value.moving ? value : { position: value.position + 1, moving: true });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [posts.length]);

  useEffect(() => {
    if (!slide.moving) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    const timer = window.setTimeout(() => {
      setSlide((value) => ({
        position: ((value.position - 1 + posts.length) % posts.length) + 1,
        moving: false,
      }));
    }, duration);
    return () => window.clearTimeout(timer);
  }, [slide.moving, posts.length]);

  const post = posts[current];
  if (!post) return null;
  function select(next: number) {
    setSlide((value) => value.moving || next === current ? value : { position: next + 1, moving: true });
  }
  return (
    <section className="latest-posts" aria-label="최신 글 소개" aria-roledescription="캐러셀">
      <div className="latest-viewport">
      <div className="latest-track" data-moving={slide.moving}
        style={{ transform: `translateX(-${(posts.length > 1 ? slide.position : 0) * 100}%)` }}>
      {slides.map((post, position) => <div className="latest-slide" key={`${position}-${post.slug}`}
        inert={position !== (posts.length > 1 ? slide.position : 0)}
        aria-hidden={position !== (posts.length > 1 ? slide.position : 0)}>
        <div className="latest-copy">
          <div className="flex flex-wrap gap-3 mb-4 text-xs font-semibold">
            <span className="latest-badge">최신 글</span>
            <span className="latest-badge text-[var(--muted)]">{post.category}</span>
          </div>
          <h2 className="latest-title"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
          <p className="latest-description">{post.description}</p>
          <Link className="latest-read" href={`/posts/${post.slug}`}>글 읽기 <span aria-hidden="true">↗</span></Link>
        </div>
        <Link className="latest-image" href={`/posts/${post.slug}`} aria-label={`${post.title} 읽기`} tabIndex={-1}>
          <PostCover key={post.slug} post={post} priority />
        </Link>
      </div>)}
      </div>
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
