"use server";

import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import { headers } from "next/headers";
import { clientIdentity } from "@/lib/request-security";
import { allowRequest } from "@/lib/rate-limit";

export async function login(
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const identity = clientIdentity(await headers());
    if (!(await allowRequest("admin-login", identity, 5, 15 * 60))) {
      return { success: false, error: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요." };
    }
    if (!(await verifyPassword(password))) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }
    const token = await signToken();
    await setAuthCookie(token);
    return { success: true };
  } catch {
    // Never let Redis or missing configuration disable authentication protections.
    return { success: false, error: "로그인 서비스를 사용할 수 없습니다. 인증 환경변수와 Redis 연결을 확인해주세요." };
  }
}
