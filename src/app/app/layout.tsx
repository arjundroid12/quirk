import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-edge";
import { AppShell } from "@/components/app/shell";

export const runtime = "edge";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/signin?next=/app");
  }
  return <AppShell user={session.user}>{children}</AppShell>;
}
