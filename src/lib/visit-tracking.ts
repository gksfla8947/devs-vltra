import { redis, postViewKey } from "./redis";
import { koreaDate } from "./stats-date";
import { clientIdentity, opaqueIdentity } from "./request-security";

export const TRACK_VISITOR_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', 172800) then
  redis.call('INCR', KEYS[2])
  redis.call('EXPIRE', KEYS[2], 172800)
  redis.call('INCR', KEYS[3])
  redis.call('HINCRBY', KEYS[4], ARGV[1], 1)
  redis.call('SETNX', KEYS[5], ARGV[1])
end
return {tonumber(redis.call('GET', KEYS[2]) or '0'), tonumber(redis.call('GET', KEYS[3]) or '0')}
`;

export const TRACK_VIEW_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', 172800) then
  redis.call('INCR', KEYS[2])
  redis.call('HINCRBY', KEYS[3], ARGV[1], 1)
  redis.call('SETNX', KEYS[4], ARGV[1])
end
return tonumber(redis.call('GET', KEYS[2]) or '0')
`;

// Approximate browser counting: shared networks/browsers can be counted together.
// Never store the raw IP or User-Agent in Redis.
function visitorKey(headers: Headers): string {
  return opaqueIdentity(`${clientIdentity(headers)}:${(headers.get("user-agent") ?? "").slice(0, 512)}`);
}

export async function trackVisitor(headers: Headers) {
  const day = koreaDate();
  const [today, total] = await redis.eval<string[], [number, number]>(TRACK_VISITOR_SCRIPT, [
    `dedup:v1:visitor:${day}:${visitorKey(headers)}`, `visitors:${day}`, "visitors:total", "stats:v1:visitors", "stats:v1:started",
  ], [day]);
  return { today: Number(today), total: Number(total) };
}

export async function trackPostView(headers: Headers, slug: string) {
  const day = koreaDate();
  return Number(await redis.eval(TRACK_VIEW_SCRIPT, [
    `dedup:v1:view:${day}:${slug}:${visitorKey(headers)}`, postViewKey(slug), "stats:v1:views", "stats:v1:started",
  ], [day]));
}
