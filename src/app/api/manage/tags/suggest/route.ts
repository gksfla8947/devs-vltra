import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { withDbRetry } from "@/lib/db/retry";
import { suggestTags, TagSuggestionError } from "@/lib/ai/suggest-tags";
import { MAX_TAG_TEXT } from "@/lib/tag-suggestions";

export const maxDuration = 40;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return Response.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 150_000) return Response.json({ error: "요청이 너무 큽니다." }, { status: 413 });
    input = JSON.parse(raw);
  } catch {
    return Response.json({ error: "올바른 요청이 아닙니다." }, { status: 400 });
  }
  if (!input || typeof input.title !== "string" || input.title.length > 500 || typeof input.text !== "string" || input.text.length > MAX_TAG_TEXT || !Array.isArray(input.selectedTags) || input.selectedTags.length > 100 || input.selectedTags.some((tag: unknown) => typeof tag !== "string" || tag.length > 100)) {
    return Response.json({ error: "제목·본문·태그 입력을 확인해주세요." }, { status: 400 });
  }
  if (!input.title.trim() && !input.text.trim()) return Response.json({ error: "제목이나 본문을 먼저 작성해주세요." }, { status: 400 });
  try {
    // DB 장애가 추천을 막지 않도록 기존 태그 조회는 짧게 제한한다.
    const rows = await withDbRetry(() => db.select({ tags: posts.tags }).from(posts).limit(1000), { maxAttempts: 1, attemptTimeoutMs: 2000 }).catch(() => []);
    const existingTags = [...new Set(rows.flatMap((row) => row.tags ?? []))].filter((tag) => tag.length <= 40).slice(0, 300);
    const tags = await suggestTags({ title: input.title.trim(), text: input.text.trim(), selectedTags: input.selectedTags }, existingTags);
    return Response.json({ tags }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof TagSuggestionError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) return Response.json({ error: "추천 시간이 초과되었습니다. 다시 시도해주세요." }, { status: 504 });
    return Response.json({ error: "태그 추천을 처리하지 못했습니다. 다시 시도해주세요." }, { status: 502 });
  }
}
