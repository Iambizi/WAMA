"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Users, 
  Landmark, 
  Sparkles, 
  Building2
} from "lucide-react";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

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
    <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Top Branding Section */}
      <div className="flex flex-col pt-8 px-6 space-y-8">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-all duration-300">
            <Building2 className="h-5 w-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300">
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
                      ? "bg-gradient-to-r from-amber-500/15 to-yellow-500/5 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5"
                      : "bg-zinc-900 text-white border border-zinc-800"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent"
                )}
              >
                {/* Active Indicator dot */}
                {isActive && !item.highlight && (
                  <span className="absolute left-0 w-1 h-5 bg-white rounded-r-md" />
                )}
                {isActive && item.highlight && (
                  <span className="absolute left-0 w-1 h-5 bg-amber-400 rounded-r-md" />
                )}

                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                      isActive 
                        ? item.highlight ? "text-amber-400" : "text-white"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.highlight && !isActive && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 group-hover:bg-amber-500/20 transition-all duration-300">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-t border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-xl border border-zinc-800",
              },
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-zinc-200 truncate">
              {user?.fullName || "Advisor William"}
            </span>
            <span className="text-[10px] text-zinc-500 truncate">
              {COPY.app.advisor}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
