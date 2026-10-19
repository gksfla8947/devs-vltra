import { isAuthenticated } from "@/lib/auth";
import { GenerationError } from "@/lib/ai/gemini";
import { suggestDescription } from "@/lib/ai/suggest-description";
import { MAX_TAG_TEXT } from "@/lib/tag-suggestions";

export const maxDuration = 35;

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
  if (!input || typeof input.title !== "string" || input.title.length > 500 || typeof input.text !== "string" || input.text.length > MAX_TAG_TEXT || (!input.title.trim() && !input.text.trim())) {
    return Response.json({ error: "제목이나 본문을 작성해주세요. 제목은 500자 이하여야 합니다." }, { status: 400 });
  }
  try {
    const description = await suggestDescription({ title: input.title.trim(), text: input.text.trim() });
    return Response.json({ description }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof GenerationError) return Response.json({ error: error.message }, { status: error.status });
    const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    return Response.json({ error: timedOut ? "요약 시간이 초과되었습니다. 다시 시도해주세요." : "요약을 생성하지 못했습니다. 다시 시도해주세요." }, { status: timedOut ? 504 : 502 });
  }
}
