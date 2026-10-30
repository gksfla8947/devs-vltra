import assert from "node:assert/strict";
import test from "node:test";
import { koreaDate, periodBuckets, shiftDate, type StatsData } from "./stats-date";

const fixture: StatsData = { asOf: "2026-10-30T00:00:00Z", today: "2026-10-30", started: "2026-10-28", views: { "2026-10-28": 7, "2026-10-30": 3 }, visitors: {}, totalViews: 10, totalVisitors: 0 };

test("Korean midnight and year boundaries", () => {
  assert.equal(koreaDate(new Date("2026-12-31T14:59:59Z")), "2026-12-31");
  assert.equal(koreaDate(new Date("2026-12-31T15:00:00Z")), "2027-01-01");
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
});
test("Uncollected days differ from collected zero days", () => {
  const values = periodBuckets(fixture, "views", "day", 0);
  assert.equal(values.at(-4)?.value, null);
  assert.equal(values.at(-3)?.value, 7);
  assert.equal(values.at(-2)?.value, 0);
  assert.equal(values.at(-1)?.value, 3);
  assert.equal(values.at(-3)?.partial, true);
});
test("Weeks start Monday and sum only collected days", () => {
  const last = periodBuckets(fixture, "views", "week", 0).at(-1)!;
  assert.deepEqual(last, { from: "2026-10-26", to: "2026-11-01", value: 10, partial: true });
});
test("Monthly aggregation handles leap years and year boundaries", () => {
  const data = { ...fixture, today: "2024-03-01", started: "2024-01-01", views: { "2024-02-29": 5 } };
  const months = periodBuckets(data, "views", "month", 0);
  assert.equal(months.at(-2)?.to, "2024-02-29");
  assert.equal(months.at(-2)?.value, 5);
  assert.equal(months.at(-2)?.partial, false);
  assert.equal(months.at(-4)?.value, null);
});
test("Previous ranges do not overlap and absent collection remains unknown", () => {
  const latest = periodBuckets(fixture, "views", "day", 0);
  const previous = periodBuckets(fixture, "views", "day", 1);
  assert.equal(shiftDate(previous.at(-1)!.to, 1), latest[0].from);
  assert.ok(periodBuckets({ ...fixture, started: null }, "views", "month", 0).every((bucket) => bucket.value === null));
});
