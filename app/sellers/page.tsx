"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Landmark, Search, Plus, Sparkles, ArrowUpDown } from "lucide-react";
import { COPY } from "@/lib/copy";
import { SECTORS, REVENUE_RANGES } from "@/lib/constants";

export default function Sellers() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "qualified" | "disqualified">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Query Convex database
  const sellersList = useQuery(api.sellers.list);

  // Loading state
  const isLoading = sellersList === undefined;

  // Filtered and searched sellers list
  const filteredSellers = (sellersList || []).filter((seller) => {
    const matchesTab = activeTab === "all" || seller.qualificationStatus === activeTab;
    
    const searchLower = searchQuery.toLowerCase();
    const sectorLabel = SECTORS.find(x => x.value === seller.sector)?.label || seller.sector;
    const matchesSearch = 
      seller.businessName.toLowerCase().includes(searchLower) ||
      seller.name.toLowerCase().includes(searchLower) ||
      seller.email.toLowerCase().includes(searchLower) ||
      (seller.phone || "").toLowerCase().includes(searchLower) ||
      sectorLabel.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  // Sorted list
  const sortedSellers = [...filteredSellers].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.createdAt - b.createdAt;
    } else {
      return b.createdAt - a.createdAt;
    }
  });

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Landmark className="h-6 w-6 text-zinc-400" />
            <span>{COPY.sellers.pageTitle}</span>
          </h1>
          <p className="text-xs text-zinc-400">
            {COPY.sellers.listSubtitle}
          </p>
        </div>

        <Link
          href="/sellers/new"
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 rounded-xl text-xs font-semibold text-zinc-950 transition-all duration-300 shadow-md shadow-amber-500/10"
        >
          <Plus className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
          <span>{COPY.sellers.newButton}</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex bg-card border border-border p-1.5 rounded-xl gap-1 shrink-0 overflow-x-auto dark:bg-zinc-900/60 dark:border-zinc-900">
          {(["all", "pending", "qualified", "disqualified"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 capitalize shrink-0 select-none ${
                activeTab === tab
                  ? "bg-muted text-foreground border border-border shadow-sm dark:bg-zinc-800 dark:text-white dark:border-zinc-800"
                  : "text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab === "all" ? COPY.sellers.tabs.all : COPY.sellers.tabs[tab]}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, sector, owner, or criteria..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground outline-none transition-all duration-300 dark:bg-zinc-900/30 dark:border-zinc-900"
            />
          </div>
          <button 
            onClick={toggleSortDirection}
            title={sortDirection === "asc" ? "Sort Oldest First" : "Sort Newest First"}
            className="p-2.5 bg-card border border-border rounded-xl hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center justify-center shrink-0 dark:bg-zinc-900 dark:border-zinc-900"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sellers Data Grid */}
      <div className="bg-card/40 border border-border rounded-2xl overflow-hidden shadow-sm dark:bg-zinc-900/30 dark:border-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 dark:border-zinc-900 dark:text-zinc-400 dark:bg-zinc-950/20">
                <th className="py-4.5 px-6">Mandate / Business Name</th>
                <th className="py-4.5 px-6">Sector</th>
                <th className="py-4.5 px-6">Revenue range</th>
                <th className="py-4.5 px-6">Readiness</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs dark:divide-zinc-900/40">
              {isLoading ? (
                // Pulse rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col gap-2">
                        <div className="h-3.5 bg-zinc-800/80 rounded w-36" />
                        <div className="h-2.5 bg-zinc-900/80 rounded w-24" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="h-3.5 bg-zinc-900 rounded w-28" />
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="h-3.5 bg-zinc-850 rounded w-24" />
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-zinc-900 rounded w-16" />
                        <div className="h-3 bg-zinc-900 rounded w-6" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="h-5 bg-zinc-900 rounded w-16" />
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="h-7 bg-zinc-900 rounded-lg w-24 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : sortedSellers.length > 0 ? (
                sortedSellers.map((seller) => {
                  const sectorLabel = SECTORS.find(x => x.value === seller.sector)?.label || seller.sector;
                  const revenueLabel = REVENUE_RANGES.find(x => x.value === seller.revenueRange)?.label || seller.revenueRange;
                  const readinessScore = seller.readinessScore ?? 0;

                  return (
                    <tr key={seller._id} className="hover:bg-muted/10 transition-colors group">
                      <td className="py-4.5 px-6 font-semibold text-foreground group-hover:text-amber-500">
                        <div className="flex flex-col">
                          <span>{seller.businessName}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">{seller.name}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-muted-foreground">
                        {sectorLabel}
                      </td>
                      <td className="py-4.5 px-6 font-medium text-foreground/80">
                        {revenueLabel}
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden shrink-0 dark:bg-zinc-800">
                            <div
                              className={`h-full rounded-full ${
                                readinessScore >= 80 
                                  ? "bg-emerald-500" 
                                  : readinessScore >= 50 
                                    ? "bg-amber-500" 
                                    : "bg-rose-500"
                              }`}
                              style={{ width: `${readinessScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {readinessScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                            seller.qualificationStatus === "qualified"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10"
                              : seller.qualificationStatus === "disqualified"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:border-rose-500/10"
                                : "bg-muted text-muted-foreground border-border dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800"
                          }`}
                        >
                          {seller.qualificationStatus === "qualified" 
                            ? "Qualified" 
                            : seller.qualificationStatus === "disqualified" 
                              ? "Disqualified" 
                              : "Pending"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {seller.qualificationStatus === "qualified" && (
                            <Link 
                              href="/matches"
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-500 rounded-lg transition-all duration-300 dark:text-amber-400" 
                              title="View AI Matches"
                            >
                              <Sparkles className="h-3.5 w-3.5 stroke-[2.2]" />
                            </Link>
                          )}
                          <Link
                            href={`/sellers/${seller._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-bold transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/80 dark:text-zinc-300"
                          >
                            View Mandate
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center space-y-3">
                    <Landmark className="mx-auto h-10 w-10 text-zinc-600" />
                    <p className="text-sm font-semibold text-zinc-300">{COPY.common.noResults}</p>
                    <p className="text-xs text-zinc-500">There are no seller mandates in this category yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
