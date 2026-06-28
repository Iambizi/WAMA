"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Users, 
  Landmark, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  Activity,
  Loader2 
} from "lucide-react";
import { COPY } from "@/lib/copy";
import { useUser } from "@clerk/nextjs";

// Helper to format timestamps dynamically for William's activity feed
function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return "Just now";
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export default function Dashboard() {
  const { user } = useUser();
  // Query live backend stats and activities from Convex
  const statsData = useQuery(api.dashboard.getStats);
  const activitiesData = useQuery(api.activityLogs.list);

  const isLoading = statsData === undefined || activitiesData === undefined;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-xs text-zinc-500">{COPY.common.loading}</p>
      </div>
    );
  }

  // Construct active stats using live counts
  const stats = [
    {
      title: COPY.dashboard.stats.totalBuyers,
      value: String(statsData.totalBuyersCount),
      change: "Active acquirers",
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/10",
    },
    {
      title: COPY.dashboard.stats.totalSellers,
      value: String(statsData.totalSellersCount),
      change: "Active mandates",
      icon: Landmark,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/10",
    },
    {
      title: COPY.dashboard.stats.pendingReviews,
      value: String(statsData.pendingReviewsCount),
      change: "Action required",
      icon: ShieldAlert,
      color: "from-rose-500/10 to-orange-500/10 text-rose-400 border-rose-500/10",
    },
    {
      title: COPY.dashboard.stats.activeMatches,
      value: String(statsData.activeMatchesCount),
      change: "Staged deals",
      icon: Sparkles,
      color: "from-amber-500/10 to-yellow-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {user?.firstName || user?.username || user?.fullName?.split(" ")[0] || "William"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {COPY.dashboard.subtitle}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/buyers/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border hover:bg-muted rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span>Add Buyer</span>
          </Link>
          <Link
            href="/sellers/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 rounded-xl text-xs font-semibold text-zinc-950 transition-all duration-300 shadow-md shadow-amber-500/10"
          >
            <Plus className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
            <span>Add Seller</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card/60 border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-muted-foreground/30 transition-all duration-300 dark:bg-zinc-900/40 dark:border-zinc-900"
            >
              {/* Subtle visual gradient glow behind stats */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color.split(" ")[0]} opacity-20 blur-xl group-hover:scale-125 transition-transform duration-500`} />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-semibold">
                  {stat.title}
                </span>
                <div className={`p-2 bg-gradient-to-br ${stat.color.split(" ")[0]} ${stat.color.split(" ")[1]} border ${stat.color.split(" ")[3]} rounded-xl`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[2]}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                  {stat.value}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Sub-content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activities Section */}
        <div className="lg:col-span-2 bg-card/40 border border-border rounded-2xl p-6 space-y-6 dark:bg-zinc-900/30 dark:border-zinc-900">
          <div className="flex items-center space-x-2.5">
            <Activity className="h-4.5 w-4.5 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">
              {COPY.dashboard.activityFeedTitle}
            </h2>
          </div>

          <div className="divide-y divide-border/40">
            {activitiesData && activitiesData.length > 0 ? (
              activitiesData.map((activity) => (
                <div key={activity._id} className="py-4.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-amber-500 transition-colors duration-300 capitalize">
                      {activity.entityLabel} – <span className="text-xs text-muted-foreground font-normal uppercase tracking-wider">{activity.action.replace("_", " ")}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 font-semibold">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs font-medium">
                {COPY.dashboard.noActivity}
              </div>
            )}
          </div>
        </div>

        {/* Quick Help / Advisor Guide Section */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 dark:bg-gradient-to-br dark:from-zinc-900/50 dark:to-zinc-950 dark:border-zinc-900">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Matching Engine</span>
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Matches are generated by sending fully de-identified business criteria to Claude Sonnet. PII (names, business titles, company references) are strictly stripped beforehand.
            </p>
          </div>
          <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
              Advisor Notice
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Ensure document checklists are updated on seller profiles before triggering match recommendations to optimize match readiness scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
