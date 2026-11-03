import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Opt-in integration test. All writes/deletes are restricted to this run's UUID
// prefix; no production counters, posts, or authentication records are touched.
test("Redis atomically enforces request limits and daily deduplication", { skip: process.env.RUN_REDIS_SECURITY_TESTS !== "1" }, async () => {
  const { redis } = await import("./redis");
  const { RATE_LIMIT_SCRIPT } = await import("./rate-limit");
  const { TRACK_VIEW_SCRIPT, TRACK_VISITOR_SCRIPT } = await import("./visit-tracking");
  const prefix = `security-test:${randomUUID()}`;
  const keys = Array.from({ length: 10 }, (_, i) => `${prefix}:${i}`);
  try {
    const attempts = await Promise.all(Array.from({ length: 8 }, () => redis.eval(RATE_LIMIT_SCRIPT, [keys[0]], [5, 30])));
    assert.equal(attempts.filter(value => Number(value) === 1).length, 5);
    assert.equal(await redis.get(keys[0]), 5);
    assert((await redis.ttl(keys[0])) > 0);
    await redis.del(keys[0]);
    assert.equal(Number(await redis.eval(RATE_LIMIT_SCRIPT, [keys[0]], [5, 30])), 1);
    const viewKeys = keys.slice(1, 5);
    const views = await Promise.all(Array.from({ length: 6 }, () => redis.eval(TRACK_VIEW_SCRIPT, viewKeys, ["2026-11-03"])));
    assert(views.every(value => Number(value) === 1));
    assert.equal(Number(await redis.hget(viewKeys[2], "2026-11-03")), 1);
    assert((await redis.ttl(viewKeys[0])) > 0);
    const visitorKeys = keys.slice(5, 10);
    await Promise.all(Array.from({ length: 6 }, () => redis.eval(TRACK_VISITOR_SCRIPT, visitorKeys, ["2026-11-03"])));
    assert.equal(await redis.get(visitorKeys[1]), 1);
    assert.equal(await redis.get(visitorKeys[2]), 1);
    assert((await redis.ttl(visitorKeys[0])) > 0);
    assert((await redis.ttl(visitorKeys[1])) > 0);
  } finally { await redis.del(...keys); }
});
