"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sparkles, Search, ArrowUpDown } from "lucide-react";
import { COPY } from "@/lib/copy";

export default function Matches() {
  const [activeTab, setActiveTab] = useState<
    "all" | "suggested" | "reviewed" | "approved" | "introduced" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Query live populated matches from Convex (database join)
  const matchesList = useQuery(api.matches.listPopulated);

  const isLoading = matchesList === undefined;

  // Filter list by tab and search inputs
  const filteredMatches = (matchesList || []).filter((m) => {
    const matchesTab = activeTab === "all" || m.status === activeTab;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      m.buyerName.toLowerCase().includes(searchLower) ||
      m.buyerEmail.toLowerCase().includes(searchLower) ||
      m.sellerBusinessName.toLowerCase().includes(searchLower) ||
      m.sellerSector.toLowerCase().includes(searchLower) ||
      m.aiMatchedCriteria.some((c: string) => c.toLowerCase().includes(searchLower));

    return matchesTab && matchesSearch;
  });

  // Sort matches by AI score
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.aiScore - b.aiScore;
    } else {
      return b.aiScore - a.aiScore;
    }
  });

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500/10 stroke-[2.2]" />
          <span>{COPY.matches.pageTitle}</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          {COPY.matches.listSubtitle}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex bg-card border border-border p-1.5 rounded-xl gap-1 shrink-0 overflow-x-auto dark:bg-zinc-900/60 dark:border-zinc-900">
          {(["all", "suggested", "reviewed", "approved", "introduced", "rejected"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 capitalize shrink-0 select-none ${
                  activeTab === tab
                    ? "bg-muted text-foreground border border-border shadow-sm dark:bg-zinc-800 dark:text-white dark:border-zinc-800"
                    : "text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab === "all" ? "All Matches" : COPY.matches.pipelineStages[tab] || tab}
              </button>
            )
          )}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full xl:max-w-md shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mandate, buyer, or criteria..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground outline-none transition-all duration-300 dark:bg-zinc-900/30 dark:border-zinc-900"
            />
          </div>
          <button
            onClick={toggleSortDirection}
            title={sortDirection === "asc" ? "Sort Lowest Score First" : "Sort Highest Score First"}
            className="p-2.5 bg-card border border-border rounded-xl hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center justify-center shrink-0 dark:bg-zinc-900 dark:border-zinc-900"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Matches Data Grid */}
      <div className="bg-card/40 border border-border rounded-2xl overflow-hidden shadow-sm dark:bg-zinc-900/30 dark:border-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 dark:border-zinc-900 dark:text-zinc-400 dark:bg-zinc-950/20">
                <th className="py-4.5 px-6">Match Fit (Score)</th>
                <th className="py-4.5 px-6">Seller Mandate</th>
                <th className="py-4.5 px-6">Qualified Buyer</th>
                <th className="py-4.5 px-6">Matched Criteria</th>
                <th className="py-4.5 px-6">Pipeline Stage</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs dark:divide-zinc-900/40">
              {isLoading ? (
                // Pulse rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4.5 px-6">
                      <div className="h-10 w-10 bg-muted rounded-xl dark:bg-zinc-900" />
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col gap-2">
                        <div className="h-3.5 bg-muted rounded w-32 dark:bg-zinc-800/80" />
                        <div className="h-2.5 bg-muted rounded w-20 dark:bg-zinc-900/80" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col gap-2">
                        <div className="h-3.5 bg-muted rounded w-28 dark:bg-zinc-800/80" />
                        <div className="h-2.5 bg-muted rounded w-36 dark:bg-zinc-900/80" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex gap-1">
                        <div className="h-4 bg-muted rounded w-12 dark:bg-zinc-900" />
                        <div className="h-4 bg-muted rounded w-16 dark:bg-zinc-900" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="h-5 bg-muted rounded w-16 dark:bg-zinc-900" />
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="h-7 bg-muted rounded-lg w-24 ml-auto dark:bg-zinc-900" />
                    </td>
                  </tr>
                ))
              ) : sortedMatches.length > 0 ? (
                sortedMatches.map((match) => (
                  <tr key={match._id} className="hover:bg-muted/10 transition-colors group">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center relative border ${
                          match.aiScore >= 80 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                            : match.aiScore >= 50 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" 
                              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                        }`}>
                          <span className="text-xs font-black">
                            {match.aiScore}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-foreground group-hover:text-amber-500">
                      <div className="flex flex-col">
                        <span>{match.sellerBusinessName}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{match.sellerSector}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-foreground group-hover:text-amber-500">
                      <div className="flex flex-col">
                        <span>{match.buyerName}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{match.buyerEmail}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-wrap gap-1">
                        {match.aiMatchedCriteria.map((c: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[9px] font-bold uppercase tracking-wider rounded dark:bg-amber-500/5 dark:border-amber-500/10 dark:text-amber-400"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                          match.status === "approved" || match.status === "closed_won"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10"
                            : match.status === "rejected" || match.status === "closed_lost"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:border-rose-500/10"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/10"
                        }`}
                      >
                        {COPY.matches.pipelineStages[match.status as keyof typeof COPY.matches.pipelineStages]}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`/matches/${match._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-bold transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/80 dark:text-zinc-300"
                      >
                        Review Match
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center space-y-3">
                    <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">{COPY.common.noResults}</p>
                    <p className="text-xs text-muted-foreground">There are no match recommendations under this status filter yet.</p>
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
