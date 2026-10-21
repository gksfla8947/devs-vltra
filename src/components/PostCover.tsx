/* eslint-disable @next/next/no-img-element -- Uploaded cover URLs may use external hosts. */
import type { PostSummary } from "@/lib/post-summary";

export default function PostCover({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <div className="post-cover" style={{ background: `var(--thumb-${post.thumbnail})` }}>
      {post.coverImage ? (
        <img src={post.coverImage} alt="" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
      ) : (
        <svg viewBox="0 0 200 140" fill="none" aria-hidden="true" className="post-cover-art">
          <path d="m80 40-32 30 32 30M120 40l32 30-32 30M110 26 90 114" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
