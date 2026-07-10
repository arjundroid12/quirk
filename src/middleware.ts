import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * QUIRK middleware — edge-compatible JWT auth check.
 * Replaces NextAuth's withAuth (which isn't edge-compatible).
 */

const SESSION_COOKIE = "quirk-session";

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || "quirk-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: Request) {
  const url = new URL(request.url);

  // Read session cookie from the request headers
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, v.join("=")])
  );

  const token = cookies[SESSION_COOKIE];
  const isValid = token ? await verifyToken(token) : false;

  if (!isValid) {
    // Redirect to signin for page routes, 401 for API routes
    if (url.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const signinUrl = new URL("/signin", url.origin);
    signinUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/api/scripts/:path*",
    "/api/ideas/:path*",
    "/api/thumbnails/:path*",
  ],
};
