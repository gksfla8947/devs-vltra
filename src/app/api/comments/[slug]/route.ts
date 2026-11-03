import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { comments, authUsers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getPostVisibility } from "@/lib/posts";
import { allowRequest } from "@/lib/rate-limit";
import { clientIdentity, opaqueIdentity, isSameOriginRequest, tooManyRequests } from "@/lib/request-security";
import { BodyError, readBoundedBody } from "@/lib/bounded-body";

type Params = { params: Promise<{ slug: string }> };

// GET /api/comments/[slug] — 포스트의 댓글 목록 (공개)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    if (!(await allowRequest("comments-read", clientIdentity(_req.headers), 60, 60))) return tooManyRequests(60);
    const { slug } = await params;
    if (await getPostVisibility(slug) !== "public") return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: authUsers.id,
          name: authUsers.name,
          image: authUsers.image,
        },
      })
      .from(comments)
      .innerJoin(authUsers, eq(comments.userId, authUsers.id))
      .where(eq(comments.postSlug, slug))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "댓글을 불러오지 못했습니다." }, { status: 503 }); }
}

// POST /api/comments/[slug] — 댓글 작성 (로그인 필요)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!(await allowRequest("comments-post-ip", clientIdentity(req.headers), 20, 60))) return tooManyRequests(60);
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { slug } = await params;
    if (!(await allowRequest("comments-write", opaqueIdentity(session.user.id), 5, 60))) return tooManyRequests(60);
    if (!(await allowRequest("comments-hour", opaqueIdentity(session.user.id), 20, 3600))) return tooManyRequests(3600);
    if (await getPostVisibility(slug) !== "public") return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = JSON.parse(new TextDecoder().decode(await readBoundedBody(req, 8192)));
    const content: unknown = body?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "댓글 내용을 입력해주세요" }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "댓글은 1000자 이하로 작성해주세요" },
        { status: 400 }
      );
    }

    const [comment] = await db
      .insert(comments)
      .values({
        postSlug: slug,
        userId: session.user.id,
        content: content.trim(),
      })
      .returning();

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof BodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "올바른 댓글 요청이 아닙니다." }, { status: 400 });
    return NextResponse.json({ error: "댓글을 저장하지 못했습니다." }, { status: 503 });
  }
}
