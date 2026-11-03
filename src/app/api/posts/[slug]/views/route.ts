import { redis, postViewKey } from "@/lib/redis";
import { getPostVisibility } from "@/lib/posts";
import { allowRequest } from "@/lib/rate-limit";
import { clientIdentity, isSameOriginRequest, tooManyRequests } from "@/lib/request-security";
import { trackPostView } from "@/lib/visit-tracking";

type Params = { params: Promise<{ slug: string }> };

async function handle(request: Request, { params }: Params, increment: boolean) {
  try {
    if (increment && !isSameOriginRequest(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (!(await allowRequest("views", clientIdentity(request.headers), 60, 60))) return tooManyRequests(60);
    const { slug } = await params;
    // Never create Redis counters for arbitrary/private slugs.
    if (await getPostVisibility(slug) !== "public") return Response.json({ error: "Not found" }, { status: 404 });
    const views = increment ? await trackPostView(request.headers, slug) : await redis.get<number>(postViewKey(slug)) ?? 0;
    return Response.json({ views }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "조회 집계를 사용할 수 없습니다." }, { status: 503 });
  }
}

export async function GET(request: Request, context: Params) { return handle(request, context, false); }
export async function POST(request: Request, context: Params) { return handle(request, context, true); }
