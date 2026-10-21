// Shared by cached reads and authenticated post mutations.
export const POST_LIST_TAG = "post-list";
export const postCacheTag = (slug: string) => `post:${slug}`;
export const POST_CACHE_SECONDS = 3600;
