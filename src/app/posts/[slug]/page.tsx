import { notFound } from "next/navigation";
import { getPostSummaries, getPostBySlug } from "@/lib/posts";
import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";
import CommentSection from "@/components/comments/CommentSection";
import PostViewCounter from "@/components/PostViewCounter";
import PostContent from "@/components/editor/PostContent";
import PostNavigation from "@/components/post/PostNavigation";
import AllPostsList from "@/components/post/AllPostsList";
import PostReadingTools from "@/components/post/PostReadingTools";
import { SITE_URL as BASE_URL } from "@/lib/site";

type Params = Promise<{ slug: string }>;

// ISR 안전망: revalidatePath 호출이 누락되거나 DB 직접 편집이 일어나도
// 최대 1시간 안에 PostNavigation·AllPostsList 가 갱신된다.
// 일반 흐름(글 작성/수정/삭제)은 actions.ts 의 revalidateAllPostPages 로 즉시 무효화됨.
export const revalidate = 3600;

// Generate/cache each article on its first visit instead of reading every body at build time.
export async function generateStaticParams() {
  return [];
}


export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Not Found" };
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `${BASE_URL}/posts/${slug}` },
      openGraph: {
        title: post.title,
        description: post.description,
        url: `${BASE_URL}/posts/${slug}`,
        type: "article",
        publishedTime: post.date,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPostSummaries();

  return (
    <article className="post-article">
      <header className="post-heading">
        <Link href="/" className="post-back-link">
          <span aria-hidden="true">←</span> 목록으로
        </Link>
        <div className="post-heading-meta">
          <span className="post-category">{post.category}</span>
          <time dateTime={post.date}>{format(new Date(post.date), "yyyy.MM.dd")}</time>
          <span aria-label="조회수"><PostViewCounter slug={slug} /></span>
        </div>
        <h1 className="post-heading-title">{post.title}</h1>
        {post.description && <p className="post-heading-description">{post.description}</p>}
        {post.tags.length > 0 && (
          <div className="post-heading-tags" aria-label="글 태그">
            {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
      </header>

      {/* Shared BlockNote reader keeps article content consistent with the editor. */}
      <div className="post-body">
        <PostReadingTools key={slug}>
          <PostContent blocks={post.blocks} />
        </PostReadingTools>

        {/* 같은 카테고리 내 이전/다음 글 */}
        <PostNavigation
          currentSlug={slug}
          category={post.category}
          allPosts={allPosts}
        />

        {/* 전체 글 목록 (카테고리별 아코디언) */}
        <AllPostsList
          currentSlug={slug}
          currentCategory={post.category}
          allPosts={allPosts}
        />

        {/* 댓글 */}
        <CommentSection slug={slug} />
      </div>
    </article>
  );
}
