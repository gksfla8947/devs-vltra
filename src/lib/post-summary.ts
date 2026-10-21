import type { Post } from "./posts";

// 목록에는 본문 HTML과 BlockNote JSON을 전송하지 않는다.
export type PostSummary = Omit<Post, "content" | "blocks">;
