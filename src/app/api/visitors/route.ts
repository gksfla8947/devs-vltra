import { redis } from "@/lib/redis";
import { koreaDate } from "@/lib/stats-date";

function getTodayKey() {
  return `visitors:${koreaDate()}`;
}

export async function POST() {
  try {
    const day = koreaDate();
    const todayKey = `visitors:${day}`;

    const result = await redis.multi().incr(todayKey).incr("visitors:total")
      .expire(todayKey, 60 * 60 * 48)
      .hincrby("stats:v1:visitors", day, 1)
      .set("stats:v1:started", day, { nx: true }).exec();
    const [today, total] = result;

    return Response.json({ today, total });
  } catch {
    return Response.json({ error: "방문 집계에 실패했습니다." }, { status: 503 });
  }
}

export async function GET() {
  try {
    const todayKey = getTodayKey();

    const [today, total] = await Promise.all([
      redis.get<number>(todayKey),
      redis.get<number>("visitors:total"),
    ]);

    return Response.json({ today: today ?? 0, total: total ?? 0 });
  } catch {
    return Response.json({ error: "방문 통계를 불러오지 못했습니다." }, { status: 503 });
  }
}
