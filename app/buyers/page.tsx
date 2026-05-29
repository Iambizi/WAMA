"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Search, Plus, ArrowUpDown } from "lucide-react";
import { COPY } from "@/lib/copy";
import { SECTORS } from "@/lib/constants";
import { BuyerStatusBadge } from "@/components/buyers/buyer-status-badge";

function formatCAD(amount: number) {
  if (amount >= 1_000_000) {
    const formatted = (amount / 1_000_000).toFixed(1);
    // Remove trailing .0 for cleaner view if integer
    return `$${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}M CAD`;
  }
  return `$${(amount / 1_000).toLocaleString()}k CAD`;
}

export default function Buyers() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "qualified" | "disqualified">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Query Convex database
  const buyersList = useQuery(api.buyers.list);

  // Loading state
  const isLoading = buyersList === undefined;

  // Filtered and searched buyers list
  const filteredBuyers = (buyersList || []).filter((buyer) => {
    const matchesTab = activeTab === "all" || buyer.qualificationStatus === activeTab;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      buyer.name.toLowerCase().includes(searchLower) ||
      buyer.email.toLowerCase().includes(searchLower) ||
      (buyer.phone || "").toLowerCase().includes(searchLower) ||
      buyer.sectorInterest.some(s => {
        const label = SECTORS.find(x => x.value === s)?.label || s;
        return label.toLowerCase().includes(searchLower);
      });

    return matchesTab && matchesSearch;
  });

  // Sorted buyers list
  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
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
            <Users className="h-6 w-6 text-zinc-400" />
            <span>{COPY.buyers.pageTitle}</span>
          </h1>
          <p className="text-xs text-zinc-400">
            {COPY.buyers.listSubtitle}
          </p>
        </div>

        <Link
          href="/buyers/new"
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 rounded-xl text-xs font-semibold text-zinc-950 transition-all duration-300 shadow-md shadow-amber-500/10"
        >
          <Plus className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
          <span>{COPY.buyers.newButton}</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex bg-zinc-900/60 border border-zinc-900 p-1.5 rounded-xl gap-1 shrink-0 overflow-x-auto">
          {(["all", "pending", "qualified", "disqualified"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 capitalize shrink-0 select-none ${
                activeTab === tab
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab === "all" ? COPY.buyers.tabs.all : COPY.buyers.statusLabels[tab]}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or sector..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/30 hover:bg-zinc-900/50 focus:bg-zinc-900 border border-zinc-900 focus:border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300"
            />
          </div>
          <button 
            onClick={toggleSortDirection}
            title={sortDirection === "asc" ? "Sort Oldest First" : "Sort Newest First"}
            className="p-2.5 bg-zinc-900 border border-zinc-900 rounded-xl hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all duration-300 flex items-center justify-center shrink-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buyers Data Grid */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/20">
                <th className="py-4.5 px-6">Name</th>
                <th className="py-4.5 px-6">Target Budget</th>
                <th className="py-4.5 px-6">Preferred Sectors</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 text-xs">
              {isLoading ? (
                // Pulse rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col gap-2">
                        <div className="h-3.5 bg-zinc-800/80 rounded w-28" />
                        <div className="h-2.5 bg-zinc-900/80 rounded w-36" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="h-3.5 bg-zinc-850 rounded w-32" />
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex gap-1.5">
                        <div className="h-4 bg-zinc-900 rounded w-16" />
                        <div className="h-4 bg-zinc-900 rounded w-12" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="h-5 bg-zinc-900 rounded w-20" />
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="h-7 bg-zinc-900 rounded-lg w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : sortedBuyers.length > 0 ? (
                sortedBuyers.map((buyer) => (
                  <tr key={buyer._id} className="hover:bg-zinc-900/10 transition-colors group">
                    <td className="py-4.5 px-6 font-semibold text-zinc-200 group-hover:text-white">
                      <div className="flex flex-col">
                        <span>{buyer.name}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">{buyer.email}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-medium text-zinc-300">
                      {formatCAD(buyer.budgetMin)} – {formatCAD(buyer.budgetMax)}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {buyer.sectorInterest.map((s, idx) => {
                          const label = SECTORS.find(x => x.value === s)?.label || s;
                          return (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-semibold rounded"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <BuyerStatusBadge status={buyer.qualificationStatus} />
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`/buyers/${buyer._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-lg text-[10px] font-bold text-zinc-300 transition-colors"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center space-y-3">
                    <Users className="mx-auto h-10 w-10 text-zinc-600" />
                    <p className="text-sm font-semibold text-zinc-300">{COPY.common.noResults}</p>
                    <p className="text-xs text-zinc-500">There are no buyers in this category matching your criteria.</p>
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
