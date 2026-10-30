import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { redis, postViewKey } from "@/lib/redis";
import { koreaDate } from "@/lib/stats-date";

export async function GET() {
  if (!(await isAuthenticated())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await db.select({ id: posts.id }).from(posts);
    const [views, visitors, started, totalVisitors, counts] = await Promise.all([
      redis.hgetall<Record<string, number>>("stats:v1:views"),
      redis.hgetall<Record<string, number>>("stats:v1:visitors"),
      redis.get<string>("stats:v1:started"),
      redis.get<number>("visitors:total"),
      rows.length ? redis.mget<number[]>(...rows.map(({ id }) => postViewKey(id))) : Promise.resolve([]),
    ]);
    return Response.json({ asOf: new Date().toISOString(), today: koreaDate(), started, views: views ?? {}, visitors: visitors ?? {},
      totalVisitors: Number(totalVisitors ?? 0), totalViews: counts.reduce((sum, count) => sum + Number(count ?? 0), 0),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "통계를 불러오지 못했습니다. 잠시 후 다시 시도하세요." }, { status: 503 });
  }
}
