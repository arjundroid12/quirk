import { withAuth } from "next-auth/middleware";

export const middleware = withAuth({
  pages: { signIn: "/signin" },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/app/:path*", "/api/scripts/:path*", "/api/ideas/:path*", "/api/thumbnails/:path*"],
};
