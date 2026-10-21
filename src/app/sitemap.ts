import type { MetadataRoute } from "next";
import { getPostSummaries } from "@/lib/posts";

import { connection } from "next/server";

const BASE_URL = "https://devs-vltra.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const posts = await getPostSummaries();

  const postEntries = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...postEntries,
  ];
}
