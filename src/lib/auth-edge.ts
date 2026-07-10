import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

/**
 * QUIRK custom edge-compatible auth.
 *
 * Replaces NextAuth v4 (which isn't edge-compatible) with a lightweight JWT auth
 * using `jose` (edge-compatible). Supports:
 * - Sign in with email (+ optional name) via /api/auth/signin
 * - Sign out via /api/auth/signout
 * - Session retrieval via /api/auth/session
 * - Middleware protection via JWT verification
 *
 * No magic link / email auth for now — that requires a DB-backed verification
 * token store (will be added with custom libsql adapter later).
 */

const SESSION_COOKIE = "quirk-session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days (seconds)

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || "quirk-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.id || !payload.email) return null;
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      image: (payload.image as string) || null,
    };
  } catch {
    return null;
  }
}

/** Server-side: get current session from cookies. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const user = await verifySession(token);
  if (!user) return null;

  return {
    user,
    expires: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
  };
}

/** Server-side: get current user (convenience). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** API route helper: sign in user and set cookie. */
export async function signInAndSetCookie(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/** API route helper: clear session cookie. */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
