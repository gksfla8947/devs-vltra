import { db } from "./db";
import { posts } from "./db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { PostSummary } from "./post-summary";
import { POST_LIST_TAG, postCacheTag, POST_CACHE_SECONDS } from "./post-cache";
import { withDbRetry } from "./db/retry";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category: string;
  content: string; // contentHtml (SEO/RSS 용 fallback)
  blocks: unknown[]; // BlockNote JSON — 포스트 화면 렌더의 1차 소스
  thumbnail: number;
  coverImage: string | null;
}

function slugToThumbnail(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 5) + 1;
}


function extractCoverImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * BlockNote HTML을 조회용으로 정리:
 * 1. JSON에서 코드 블록 언어 정보를 추출하여 <code>에 language-xxx 클래스 주입
 * 2. 에디터 전용 요소(<select>, contenteditable 등) 제거
 */
function cleanContentHtml(html: string, contentJson: unknown): string {
  if (!html) return html;

  // 에디터 전용 <select> 드롭다운 제거
  let cleaned = html.replace(/<div contenteditable="false"><select>[\s\S]*?<\/select><\/div>/g, "");

  // JSON에서 codeBlock 언어 정보 순서대로 추출
  const languages: string[] = [];
  function walk(blocks: unknown[]) {
    for (const block of blocks) {
      const b = block as Record<string, unknown>;
      if (b?.type === "codeBlock") {
        const props = b.props as Record<string, unknown> | undefined;
        languages.push((props?.language as string) || "text");
      }
      if (Array.isArray(b?.children)) walk(b.children as unknown[]);
    }
  }
  const blocks = Array.isArray(contentJson) ? contentJson : [];
  walk(blocks);

  // codeBlock의 <code> 태그에 language-xxx 클래스 주입
  let langIdx = 0;
  cleaned = cleaned.replace(
    /(<div[^>]*data-content-type="codeBlock"[^>]*><pre><code)([^>]*>)/g,
    (_match, before, after) => {
      const lang = languages[langIdx++] || "text";
      if (lang && lang !== "text") {
        return `${before} class="language-${lang}"${after.replace(/class="[^"]*"/, "")}`;
      }
      return `${before}${after}`;
    }
  );

  return cleaned;
}

function dbPostToPost(row: typeof posts.$inferSelect): Post {
  const rawHtml = row.contentHtml ?? "";
  const html = cleanContentHtml(rawHtml, row.content);
  return {
    slug: row.id,
    title: row.title,
    date: typeof row.date === "string" ? row.date : new Date(row.date).toISOString(),
    description: row.description ?? "",
    tags: row.tags ?? [],
    category: row.category,

    content: html,
    blocks: Array.isArray(row.content) ? (row.content as unknown[]) : [],
    thumbnail: slugToThumbnail(row.id),
    coverImage: extractCoverImage(html),
  };
}

/**
 * Cache Components is not enabled in this app; use the existing Data Cache API.
 * Project only listing fields. Extract the cover URL in PostgreSQL so neither
 * HTML nor BlockNote JSON crosses the DB connection for listing requests.
 * Errors propagate: an outage must never be cached as an empty publication list.
 */
export const getPostSummaries = cache(unstable_cache(async (): Promise<PostSummary[]> => {
  const rows = await withDbRetry(() =>
    db.select({
      slug: posts.id,
      title: posts.title,
      date: posts.date,
      description: posts.description,
      category: posts.category,
      tags: posts.tags,
      coverImage: sql<string | null>`substring(${posts.contentHtml} from '<img[^>]+src="([^"]+)"')`,
    }).from(posts).where(eq(posts.published, true)).orderBy(desc(posts.date), desc(posts.id)),
  );
  return rows.map((row) => ({
    ...row,
    description: row.description ?? "",
    tags: row.tags ?? [],
    thumbnail: slugToThumbnail(row.slug),
  }));
}, ["post-summaries-v1"], { tags: [POST_LIST_TAG], revalidate: POST_CACHE_SECONDS }));

// Request memoization shares the metadata/page read; persistent caching is per slug.
// Editing one post does not expire the cached bodies of every other post.
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> =>
  unstable_cache(async () => {
    const rows = await withDbRetry(() =>
      db.select().from(posts).where(eq(posts.id, slug)).limit(1),
    );
    return rows.length ? dbPostToPost(rows[0]) : null;
  }, ["post-detail-v1", slug], {
    tags: [postCacheTag(slug)],
    revalidate: POST_CACHE_SECONDS,
  })(),
);

export async function getAllCategories(): Promise<string[]> {
  return Array.from(new Set((await getPostSummaries()).map((post) => post.category))).sort();
}

export async function getAllTags(): Promise<string[]> {
  return Array.from(new Set((await getPostSummaries()).flatMap((post) => post.tags))).sort();
}
