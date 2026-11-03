import { redis } from "@/lib/redis";
import { koreaDate } from "@/lib/stats-date";
import { trackVisitor } from "@/lib/visit-tracking";
import { allowRequest } from "@/lib/rate-limit";
import { clientIdentity, isSameOriginRequest, tooManyRequests } from "@/lib/request-security";

async function handle(request: Request, increment: boolean) {
  try {
    if (increment && !isSameOriginRequest(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (!(await allowRequest("visitors", clientIdentity(request.headers), 30, 60))) return tooManyRequests(60);
    const counts = increment ? await trackVisitor(request.headers) : await (async () => {
      const [today, total] = await Promise.all([redis.get<number>(`visitors:${koreaDate()}`), redis.get<number>("visitors:total")]);
      return { today: today ?? 0, total: total ?? 0 };
    })();
    return Response.json(counts, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "방문 통계를 불러오지 못했습니다." }, { status: 503 });
  }
}

export async function GET(request: Request) { return handle(request, false); }
export async function POST(request: Request) { return handle(request, true); }
