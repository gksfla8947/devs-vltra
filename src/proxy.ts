import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/admin-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /manage routes (except /manage/login)
  if (!pathname.startsWith("/manage") || pathname === "/manage/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/manage/login", request.url));
  }

  if (await verifyToken(token)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/manage/login", request.url));
}

export const config = {
  matcher: ["/manage/:path*"],
};
