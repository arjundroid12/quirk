"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogoMark, Logo } from "@/components/logo";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  Lightbulb,
  ImagePlus,
  LayoutDashboard,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
} from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/scripts", label: "Script Studio", icon: PenLine },
  { href: "/app/ideas", label: "Idea Engine", icon: Lightbulb },
  { href: "/app/thumbnails", label: "Thumbnail Tester", icon: ImagePlus },
];

export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <Link href="/app" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-display font-bold tracking-tight">QUIRK</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Button
            asChild
            className="w-full brand-gradient text-white hover:opacity-90 mb-3 justify-start"
            size="sm"
          >
            <Link href="/app/scripts/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New script
            </Link>
          </Button>

          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                  active
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono uppercase tracking-widest text-brand-pink bg-brand-pink/15 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white transition"
          >
            <ExternalLink className="h-4 w-4" />
            Back to site
          </Link>
          <Link
            href="/app/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
              pathname === "/app/settings"
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials(user.name ?? user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">
                {user.name ?? "Creator"}
              </div>
              <div className="text-[10px] text-sidebar-foreground/50 truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 glass border-b border-border flex items-center px-4 justify-between">
        <Link href="/app">
          <Logo size={26} />
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="brand-gradient text-white">
            <Link href="/app/scripts/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-8 w-8 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
            {initials(user.name ?? user.email)}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                  active ? "text-brand" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-full px-1">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
