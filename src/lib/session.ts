import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions as NextAuthOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export { authOptions };
