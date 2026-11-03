import { redis } from "./redis";

// Atomic counter with a bounded lifetime, even when requests arrive concurrently.
export const RATE_LIMIT_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if current >= tonumber(ARGV[1]) then return 0 end
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[2]) end
return 1
`;

export async function allowRequest(scope: string, identity: string, limit: number, seconds: number): Promise<boolean> {
  return Number(await redis.eval(RATE_LIMIT_SCRIPT, [`security:v1:${scope}:${identity}`], [limit, seconds])) === 1;
}
