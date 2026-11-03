import { SignJWT, jwtVerify } from "jose";

export function adminSecret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value || value.trim() !== value || new TextEncoder().encode(value).length < 32 || value === "fallback-dev-secret") {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes.");
  }
  return new TextEncoder().encode(value);
}

export async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setIssuer("devs-vltra").setAudience("admin")
    .setExpirationTime("7d").sign(adminSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, adminSecret(), {
      algorithms: ["HS256"], issuer: "devs-vltra", audience: "admin", requiredClaims: ["exp", "iat"],
    });
    return payload.role === "admin";
  } catch { return false; }
}
