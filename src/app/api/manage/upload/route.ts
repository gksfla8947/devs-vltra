import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db/retry";
import { blobFiles, posts } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { BodyError, readBoundedBody } from "@/lib/bounded-body";
import { MAX_UPLOAD_BYTES, validateUpload } from "@/lib/upload-validation";
import { allowRequest } from "@/lib/rate-limit";
import { clientIdentity, isSameOriginRequest, tooManyRequests } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    if (!(await allowRequest("upload", clientIdentity(request.headers), 30, 60))) return tooManyRequests(60);
    const body = await readBoundedBody(request, MAX_UPLOAD_BYTES + 64 * 1024);
    const formData = await new Response(Buffer.from(body), { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData()
      .catch(() => { throw new BodyError("올바른 업로드 요청이 아닙니다.", 400); });
    const file = formData.get("file");
    const postSlug = formData.get("postSlug");
    if (!(file instanceof File)) throw new BodyError("이미지 파일을 선택해주세요.", 400);
    if (postSlug !== null && (typeof postSlug !== "string" || !/^[a-z0-9-]{1,200}$/.test(postSlug))) throw new BodyError("올바른 게시글 주소가 아닙니다.", 400);
    const { data, contentType, extension } = await validateUpload(file);
    const pathname = `devs-vltra/${postSlug ?? "uploads"}/${randomUUID()}.${extension}`;

    // postSlug FK 검증: 아직 저장되지 않은 새 글 작성 중일 수 있으므로
    // posts 테이블에 실제로 존재하는 경우에만 FK로 연결, 없으면 null.
    // Neon control-plane 일시 오류는 withDbRetry 가 자동으로 흡수.
    let resolvedPostSlug: string | null = null;
    if (postSlug) {
      const existing = await withDbRetry(() =>
        db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.id, postSlug))
          .limit(1),
      );
      resolvedPostSlug = existing.length > 0 ? postSlug : null;
    }

    const blob = await put(pathname, data, { access: "public", contentType });
    try {
      await withDbRetry(() =>
        db.insert(blobFiles).values({
          id: randomUUID(),
          url: blob.url,
          pathname: blob.pathname,
          size: data.byteLength,
          contentType: contentType,
          postSlug: resolvedPostSlug,
        }).onConflictDoNothing({ target: blobFiles.url }),
      );
    } catch (error) {
      await del(blob.url).catch(() => undefined);
      throw error;
    }

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof BodyError ? error.message : "이미지 업로드를 완료하지 못했습니다." }, { status: error instanceof BodyError ? error.status : 503 });
  }
}
