import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import sharp from "sharp";
import { adminSecret, signToken, verifyToken } from "./admin-token";
import { clientIdentity, isSameOriginRequest } from "./request-security";
import { BodyError, readBoundedBody } from "./bounded-body";
import { MAX_UPLOAD_BYTES, validateUpload } from "./upload-validation";

test("admin authentication fails closed without a strong configured key", async () => {
  const previous = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(adminSecret);
    assert.equal(await verifyToken("invalid"), false);
    for (const secret of ["", "fallback-dev-secret", "short", " ".repeat(64)]) {
      process.env.JWT_SECRET = secret;
      assert.throws(adminSecret);
    }
    process.env.JWT_SECRET = "test-only-secret-".repeat(4);
    const token = await signToken();
    assert.equal(await verifyToken(token), true);
    assert.equal(await verifyToken(token + "x"), false);
    for (const claims of [
      { role: "user", iss: "devs-vltra", aud: "admin", exp: Math.floor(Date.now() / 1000) + 300 },
      { role: "admin", iss: "wrong", aud: "admin", exp: Math.floor(Date.now() / 1000) + 300 },
      { role: "admin", iss: "devs-vltra", aud: "admin", exp: 1 },
      { role: "admin" }, // Old/unscoped tokens must not grant administrator access.
    ]) {
      const signed = await new SignJWT(claims).setIssuedAt().setProtectedHeader({ alg: "HS256" }).sign(adminSecret());
      assert.equal(await verifyToken(signed), false);
    }
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous;
  }
});

test("rate-limit identity ignores spoofed forwarding headers outside Vercel", () => {
  const previous = { secret: process.env.JWT_SECRET, vercel: process.env.VERCEL };
  try {
    process.env.JWT_SECRET = "test-only-secret-".repeat(4);
    delete process.env.VERCEL;
    assert.equal(clientIdentity(new Headers()), clientIdentity(new Headers({ "x-forwarded-for": "192.0.2.1", "x-vercel-forwarded-for": "192.0.2.2" })));
    process.env.VERCEL = "1";
    const headers = new Headers({ "x-vercel-forwarded-for": "192.0.2.1" });
    const identity = clientIdentity(headers);
    headers.set("x-forwarded-for", "192.0.2.99");
    assert.equal(clientIdentity(headers), identity);
    assert(!identity.includes("192.0.2.1"));
    headers.set("x-vercel-forwarded-for", "192.0.2.2");
    assert.notEqual(clientIdentity(headers), identity);
  } finally {
    for (const [key, value] of Object.entries({ JWT_SECRET: previous.secret, VERCEL: previous.vercel })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("cross-site mutation requests are rejected", () => {
  assert.equal(isSameOriginRequest(new Request("https://example.test/api", { headers: { origin: "https://evil.test" } })), false);
  assert.equal(isSameOriginRequest(new Request("https://example.test/api", { headers: { "sec-fetch-site": "cross-site" } })), false);
  assert.equal(isSameOriginRequest(new Request("https://example.test/api", { headers: { origin: "https://example.test" } })), true);
});

test("request body cap uses actual bytes even without a trustworthy Content-Length", async () => {
  const request = new Request("https://example.test", { method: "POST", body: "x".repeat(20), headers: { "content-length": "1" } });
  await assert.rejects(readBoundedBody(request, 10), (error: unknown) => error instanceof BodyError && error.status === 413);
  const valid = new Request("https://example.test", { method: "POST", body: "한글" });
  assert.equal(new TextDecoder().decode(await readBoundedBody(valid, 6)), "한글");
});

test("uploads reject disguised, active, empty, and oversized files", async () => {
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).png().toBuffer();
  for (const file of [
    new File(["<script>alert(1)</script>"], "fake.png", { type: "image/png" }),
    new File(['<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2"/></svg>'], "image.svg", { type: "image/svg+xml" }),
    new File([png], "image.html", { type: "image/png" }),
    new File([png], "image.png", { type: "image/jpeg" }),
    new File([], "empty.png", { type: "image/png" }),
    new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "large.png", { type: "image/png" }),
  ]) await assert.rejects(validateUpload(file), BodyError);
});

test("uploads decode and re-encode supported images, discarding trailing payloads", async () => {
  for (const format of ["png", "jpeg", "webp", "gif"] as const) {
    const source = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).toFormat(format).toBuffer();
    const data = Buffer.concat([source, Buffer.from("<script>security-test-payload</script>")]);
    const result = await validateUpload(new File([data], `image.${format}`, { type: `image/${format}` }));
    assert.equal((await sharp(result.data).metadata()).format, format);
    assert.equal(result.data.includes(Buffer.from("security-test-payload")), false);
  }
});
