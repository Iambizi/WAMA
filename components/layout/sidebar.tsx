"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Users, 
  Landmark, 
  Sparkles, 
  Building2,
  Sun,
  Moon
} from "lucide-react";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      href: "/dashboard",
      label: COPY.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: "/buyers",
      label: COPY.nav.buyers,
      icon: Users,
    },
    {
      href: "/sellers",
      label: COPY.nav.sellers,
      icon: Landmark,
    },
    {
      href: "/matches",
      label: COPY.nav.matches,
      icon: Sparkles,
      highlight: true,
    },
  ];

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col justify-between h-screen shrink-0 select-none transition-colors duration-300">
      {/* Top Branding Section */}
      <div className="flex flex-col pt-8 px-6 space-y-8">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-all duration-300">
            <Building2 className="h-5 w-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-sidebar-foreground group-hover:text-amber-500 transition-colors duration-300">
              {COPY.app.title}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              {COPY.app.subtitle}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group",
                  isActive
                    ? item.highlight
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-md shadow-amber-500/5 dark:bg-gradient-to-r dark:from-amber-500/15 dark:to-yellow-500/5 dark:text-amber-400 dark:border-amber-500/20"
                      : "bg-muted text-foreground border border-border shadow-sm dark:bg-zinc-900 dark:text-white dark:border-zinc-800"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/50"
                )}
              >
                {/* Active Indicator dot */}
                {isActive && !item.highlight && (
                  <span className="absolute left-0 w-1 h-5 bg-foreground rounded-r-md" />
                )}
                {isActive && item.highlight && (
                  <span className="absolute left-0 w-1 h-5 bg-amber-500 rounded-r-md" />
                )}

                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                      isActive 
                        ? item.highlight ? "text-amber-500" : "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.highlight && !isActive && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 group-hover:bg-amber-500/20 transition-all duration-300 dark:text-amber-400">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-t border-sidebar-border bg-sidebar/50 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-xl border border-sidebar-border",
              },
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-sidebar-foreground truncate">
              {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Advisor William"}
            </span>
            <span className="text-[10px] text-zinc-500 truncate">
              {COPY.app.advisor}
            </span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border transition-all duration-300 flex items-center justify-center shrink-0 shadow-sm"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 text-zinc-700 stroke-[2.2] animate-pulse" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400 stroke-[2.2]" />
          )}
        </button>
      </div>
    </aside>
  );
}
