"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Search, ArrowUpDown } from "lucide-react";
import { COPY } from "@/lib/copy";

export default function Matches() {
  const [activeTab, setActiveTab] = useState<"all" | "suggested" | "approved" | "closed_won">("all");

  // Mock list for scaffold rendering
  const matchesList = [
    {
      id: "1",
      sellerName: "Metalworks Lanaudière",
      buyerName: "Acquisitions Group Inc.",
      score: 92,
      criteria: ["sector", "budget", "geography"],
      status: "approved",
      reasoning: "Excellent fit. Buyer target budget aligns perfectly with the seller's valuation range and has deep operations expertise in metallurgy.",
    },
    {
      id: "2",
      sellerName: "Boulangerie Artisanale Montreal",
      buyerName: "Jean-Francois Tremblay",
      score: 78,
      criteria: ["sector", "geography"],
      status: "suggested",
      reasoning: "Good industry overlap. Buyer has specified high interest in food services in the Montreal area, though budget details require vetting.",
    },
  ];

  const filteredMatches = matchesList.filter(m => activeTab === "all" || m.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-amber-400 fill-amber-500/10 stroke-[2.2]" />
          <span>{COPY.matches.pageTitle}</span>
        </h1>
        <p className="text-xs text-zinc-400">
          {COPY.matches.listSubtitle}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex bg-zinc-900/60 border border-zinc-900 p-1.5 rounded-xl gap-1 shrink-0 overflow-x-auto">
          {(["all", "suggested", "approved", "closed_won"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 capitalize shrink-0 select-none ${
                activeTab === tab
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab === "all" 
                ? "All Matches" 
                : COPY.matches.pipelineStages[tab as keyof typeof COPY.matches.pipelineStages] || tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by seller, buyer, or criteria..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/30 hover:bg-zinc-900/50 focus:bg-zinc-900 border border-zinc-900 focus:border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300"
            />
          </div>
          <button className="p-2.5 bg-zinc-900 border border-zinc-900 rounded-xl hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all duration-300">
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Matches Data Grid */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
        {filteredMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/20">
                  <th className="py-4.5 px-6">Match Fit (Score)</th>
                  <th className="py-4.5 px-6">Seller Mandate</th>
                  <th className="py-4.5 px-6">Qualified Buyer</th>
                  <th className="py-4.5 px-6">Matched Criteria</th>
                  <th className="py-4.5 px-6">Pipeline Stage</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs">
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-zinc-900/10 transition-colors group">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 flex items-center justify-center relative">
                          <span className="text-xs font-black text-amber-400">
                            {match.score}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-zinc-200 group-hover:text-white">
                      {match.sellerName}
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-zinc-200 group-hover:text-white">
                      {match.buyerName}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-wrap gap-1">
                        {match.criteria.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-amber-500/5 border border-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                          match.status === "approved"
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                            : "bg-amber-500/5 text-amber-400 border-amber-500/10"
                        }`}
                      >
                        {COPY.matches.pipelineStages[match.status as keyof typeof COPY.matches.pipelineStages]}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`/matches/${match.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-lg text-[10px] font-bold text-zinc-300 transition-colors"
                      >
                        Review Match
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="mx-auto h-10 w-10 text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">{COPY.common.noResults}</p>
            <p className="text-xs text-zinc-500">There are no matches under this status filter yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
