import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * CreateOS Auth
 *
 * Two providers:
 *  1. Email (magic link) — for production, once SMTP is configured.
 *     In dev (no SMTP env), NextAuth prints the magic link to server logs.
 *  2. Credentials (dev) — bypasses email, lets you sign in with any email.
 *     Only enabled when DEV_AUTO_SIGNIN=1 env is set. Used for local testing
 *     and sandbox demos. Disable in production by removing the env var.
 */

const enableDevBypass = process.env.DEV_AUTO_SIGNIN === "1";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as any) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin?check=mail",
    error: "/signin?error=1",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM ?? "CreateOS <noreply@createos.app>",
    }),
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

              // Upsert user
              const user = await db.user.upsert({
                where: { email },
                update: { name },
                create: {
                  email,
                  name,
                  emailVerified: new Date(),
                },
              });

              return {
                id: user.id,
                email: user.email,
                name: user.name,
              } as any;
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
