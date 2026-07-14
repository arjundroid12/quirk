import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { Resend } from "resend";
import { db } from "@/lib/db";

/**
 * QUIRK Auth
 *
 * Two providers:
 *  1. Email (magic link) via Resend HTTP API — requires DB adapter for verification tokens.
 *     Currently disabled (no PrismaAdapter since we use raw Turso HTTP API).
 *     Will be re-enabled with a custom adapter in future CMD.
 *  2. Credentials (dev bypass) — bypasses email, lets you sign in with any email.
 *     Only enabled when DEV_AUTO_SIGNIN=1 env is set.
 *
 * Session strategy: JWT (no DB-backed sessions needed).
 * User creation: handled in CredentialsProvider.authorize() via db.user.upsert().
 */

const enableDevBypass = process.env.DEV_AUTO_SIGNIN === "1";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const enableEmailProvider = !!resend && process.env.ENABLE_EMAIL_AUTH === "1";

export const authOptions: NextAuthOptions = {
  // No adapter — JWT-only auth. User creation happens in CredentialsProvider.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin?check=mail",
    error: "/signin?error=1",
  },
  providers: [
    ...(enableEmailProvider
      ? [
          EmailProvider({
            from: process.env.SMTP_FROM || "QUIRK <onboarding@resend.dev>",
            sendVerificationRequest: async ({ identifier, url, provider }) => {
              if (!resend) {
                console.log(`\n🔗 [DEV MAGIC LINK] ${identifier}\n   ${url}\n`);
                return;
              }
              await resend.emails.send({
                from: provider.from,
                to: identifier,
                subject: "Sign in to QUIRK",
                html: `
                  <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #7C3AED, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">QUIRK</h1>
                    </div>
                    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">Sign in to QUIRK</h2>
                    <p style="color: #6B6B7B; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                      Click the link below to sign in. This magic link expires in 24 hours.
                    </p>
                    <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; font-weight: 600; font-size: 15px; padding: 12px 32px; border-radius: 10px; text-decoration: none;">
                      Sign in to QUIRK
                    </a>
                  </div>
                `,
              });
            },
          }),
        ]
      : []),
    ...(enableDevBypass
      ? [
          CredentialsProvider({
            id: "dev-bypass",
            name: "Dev Sign-in",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "you@email.com" },
              name: { label: "Name", type: "text", placeholder: "Your name" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              const email = credentials.email.toLowerCase().trim();
              const name = credentials.name?.trim() || email.split("@")[0];

              try {
                const user = await db.user.upsert({
                  where: { email },
                  update: { name },
                  create: { email, name, emailVerified: new Date() },
                });
                // Verify the user actually exists in the DB before returning
                if (!user.id || user.id.startsWith("transient_")) {
                  throw new Error("User upsert returned invalid ID");
                }
                return { id: user.id, email: user.email, name: user.name } as any;
              } catch (err) {
                console.error("[auth] DB upsert failed:", err);
                // Don't return a transient user — that causes FK violations later.
                // Return null so NextAuth shows an error instead of silent failure.
                return null;
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,
};
