"use client";

import Link from "next/link";
import { useState } from "react";
import { Users, Search, Plus, Filter, ArrowUpDown } from "lucide-react";
import { COPY } from "@/lib/copy";

export default function Buyers() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "qualified" | "disqualified">("all");

  // Mock list for scaffold rendering
  const buyersList = [
    {
      id: "1",
      name: "Acquisitions Group Inc. (William B.)",
      email: "wb@acqgroup.com",
      budgetMin: "$3.0M",
      budgetMax: "$5.0M",
      sectors: ["Manufacturing", "Distribution"],
      status: "qualified",
    },
    {
      id: "2",
      name: "Jean-Francois Tremblay",
      email: "jf.tremblay@investqc.ca",
      budgetMin: "$1.0M",
      budgetMax: "$3.0M",
      sectors: ["Business Services"],
      status: "pending",
    },
    {
      id: "3",
      name: "Capital M&A Partners",
      email: "dealflow@capma.com",
      budgetMin: "$5.0M",
      budgetMax: "$10.0M",
      sectors: ["Technology", "Healthcare"],
      status: "qualified",
    },
  ];

  const filteredBuyers = buyersList.filter(b => activeTab === "all" || b.status === activeTab);

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
              placeholder="Search by buyer name, email, or criteria..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/30 hover:bg-zinc-900/50 focus:bg-zinc-900 border border-zinc-900 focus:border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none transition-all duration-300"
            />
          </div>
          <button className="p-2.5 bg-zinc-900 border border-zinc-900 rounded-xl hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all duration-300">
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buyers Data Grid */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
        {filteredBuyers.length > 0 ? (
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
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-zinc-900/10 transition-colors group">
                    <td className="py-4.5 px-6 font-semibold text-zinc-200 group-hover:text-white">
                      <div className="flex flex-col">
                        <span>{buyer.name}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">{buyer.email}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-medium text-zinc-300">
                      {buyer.budgetMin} – {buyer.budgetMax}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {buyer.sectors.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-semibold rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                          buyer.status === "qualified"
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                            : buyer.status === "disqualified"
                              ? "bg-rose-500/5 text-rose-400 border-rose-500/10"
                              : "bg-zinc-800 text-zinc-400 border-zinc-800"
                        }`}
                      >
                        {COPY.buyers.statusLabels[buyer.status as keyof typeof COPY.buyers.statusLabels]}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`/buyers/${buyer.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-lg text-[10px] font-bold text-zinc-300 transition-colors"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Users className="mx-auto h-10 w-10 text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">{COPY.common.noResults}</p>
            <p className="text-xs text-zinc-500">There are no buyers in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
