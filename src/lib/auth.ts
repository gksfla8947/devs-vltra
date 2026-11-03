import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyToken } from "./admin-token";
export { signToken, verifyToken } from "./admin-token";

const COOKIE_NAME = "admin_token";

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected?.trim()) throw new Error("ADMIN_PASSWORD must be configured.");
  if (typeof password !== "string" || password.length > 1024) return false;
  const hash = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(hash(password), hash(expected));
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;
  return verifyToken(token);
}
