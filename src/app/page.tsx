import { getPostSummaries } from "@/lib/posts";
import LatestPosts from "@/components/LatestPosts";
import PostList from "@/components/PostList";
import { redis, postViewKey } from "@/lib/redis";

import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const posts = await getPostSummaries();

  // 모든 포스트 조회수를 Redis mget으로 한 번에 조회
  const viewsMap: Record<string, number> = {};
  if (posts.length > 0) {
    const keys = posts.map((p) => postViewKey(p.slug));
    const counts = await redis.mget<(number | null)[]>(...keys);
    posts.forEach((p, i) => {
      viewsMap[p.slug] = counts[i] ?? 0;
    });
  }

  // Build category list with counts
  const catMap = new Map<string, number>();
  posts.forEach((p) => catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1));
  const categories = Array.from(catMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  const summaries = posts.map(({ slug, title, date, description, tags, category, thumbnail, coverImage }) => ({
    slug, title, date, description, tags, category, thumbnail, coverImage,
  }));

  return (
    <div className="home-shell">
      <LatestPosts posts={summaries.slice(0, 5)} />
      <PostList posts={summaries} categories={categories} viewsMap={viewsMap} />
    </div>
  );
}
