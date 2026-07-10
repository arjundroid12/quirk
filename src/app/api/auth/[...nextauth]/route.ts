import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth route handler — must export HTTP method handlers explicitly for
// Next.js 16 App Router compatibility.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
