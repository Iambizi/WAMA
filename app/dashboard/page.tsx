"use client";

import Link from "next/link";
import { 
  Users, 
  Landmark, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  Activity 
} from "lucide-react";
import { COPY } from "@/lib/copy";

export default function Dashboard() {
  // Mock data for initial scaffold visual presentation
  const stats = [
    {
      title: COPY.dashboard.stats.totalBuyers,
      value: "14",
      change: "+2 this week",
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/10",
    },
    {
      title: COPY.dashboard.stats.totalSellers,
      value: "8",
      change: "Active mandates",
      icon: Landmark,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/10",
    },
    {
      title: COPY.dashboard.stats.pendingReviews,
      value: "3",
      change: "Action required",
      icon: ShieldAlert,
      color: "from-rose-500/10 to-orange-500/10 text-rose-400 border-rose-500/10",
    },
    {
      title: COPY.dashboard.stats.activeMatches,
      value: "22",
      change: "AI recommended",
      icon: Sparkles,
      color: "from-amber-500/10 to-yellow-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  const activities = [
    {
      id: "1",
      action: "buyer_created",
      label: "Acquisitions Group Inc.",
      details: "Budget: $3.0M - $5.0M CAD",
      time: "10 minutes ago",
    },
    {
      id: "2",
      action: "match_stage_advanced",
      label: "TechCorp Quebec / Serial Buyer #4",
      details: "Stage advanced: suggested → reviewed",
      time: "2 hours ago",
    },
    {
      id: "3",
      action: "seller_created",
      label: "Boulangerie Artisanale Montreal",
      details: "Readiness checklist: 80% complete",
      time: "Yesterday",
    },
    {
      id: "4",
      action: "match_approved",
      label: "Mandate #08 / Buyer #11",
      details: "Introduction approved by advisor",
      time: "Yesterday",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {COPY.dashboard.welcome}
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            {COPY.dashboard.subtitle}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/buyers/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-xl text-xs font-semibold text-zinc-200 transition-all duration-300 shadow-sm"
          >
            <Plus className="h-4 w-4 text-zinc-400" />
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
              className={`bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300`}
            >
              {/* Subtle visual gradient glow behind stats */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color.split(" ")[0]} opacity-20 blur-xl group-hover:scale-125 transition-transform duration-500`} />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 bg-gradient-to-br ${stat.color.split(" ")[0]} ${stat.color.split(" ")[1]} border ${stat.color.split(" ")[3]} rounded-xl`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.color.split(" ")[2]}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {stat.value}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
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
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Activity className="h-4.5 w-4.5 text-amber-500" />
              <h2 className="text-base font-bold text-white">
                {COPY.dashboard.activityFeedTitle}
              </h2>
            </div>
          </div>

          <div className="divide-y divide-zinc-900/60">
            {activities.map((activity) => (
              <div key={activity.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors duration-300">
                    {activity.label}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {activity.details}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 mt-0.5">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help / Advisor Guide Section */}
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Matching Engine</span>
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Matches are generated by sending fully de-identified business criteria to Claude Sonnet. PII (names, business titles, company references) are strictly stripped beforehand.
            </p>
          </div>
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Advisor Notice
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Ensure document checklists are updated on seller profiles before triggering match recommendations to optimize match readiness scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
