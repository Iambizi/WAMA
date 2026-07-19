"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { CheckCircle2, Clock, Users, ShieldAlert, Award, FileText, ChevronRight } from "lucide-react";

export default function BuyerDashboard() {
  const profile = useQuery(api.buyers.currentBuyer);
  const matches = useQuery(api.matches.listPopulatedForBuyer);

  if (profile === undefined || matches === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-sm">Loading your dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">No Application Found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          You haven&apos;t completed your Buyer Onboarding Application yet. Apply now to target private mandates.
        </p>
        <Link
          href="/buyer/apply"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
        >
          Start Application
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: "pending" | "qualified" | "disqualified") => {
    switch (status) {
      case "pending":
        return {
          label: "Under Review",
          icon: <Clock className="h-4 w-4" />,
          classes: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
        };
      case "qualified":
        return {
          label: "Verified Buyer",
          icon: <CheckCircle2 className="h-4 w-4" />,
          classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
        };
      case "disqualified":
        return {
          label: "Application Closed",
          icon: <ShieldAlert className="h-4 w-4" />,
          classes: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/50",
        };
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statusInfo = getStatusBadge(profile.qualificationStatus);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Buyer Portal</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">Acquisition Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your verification status, target criteria preferences, and review shared mandates.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Side: Status & Criteria */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Verification Status
            </h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.classes}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {profile.qualificationStatus === "pending"
                ? "Your criteria is registered. Once William reviews your details and checks background assets, your account status will transition to Verified."
                : profile.qualificationStatus === "qualified"
                ? "Verified Account. You have access to receive curated target mandates from our private files."
                : "Your account is not active for deal flow requests at this time."}
            </p>
          </div>

          {/* Criteria Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
              <h2 className="text-sm font-bold">Acquisition Criteria</h2>
            </div>
            <dl className="space-y-4 text-xs">
              <div>
                <dt className="text-muted-foreground">Budget Scope (CAD)</dt>
                <dd className="font-semibold mt-1">
                  {formatCurrency(profile.budgetMin)} - {formatCurrency(profile.budgetMax)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sectors of Interest</dt>
                <dd className="flex flex-wrap gap-1 mt-1.5">
                  {profile.sectorInterest.map((s, idx) => (
                    <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[10px] border border-border/55 capitalize">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Target Geographies</dt>
                <dd className="font-semibold mt-1 capitalize">{profile.geography.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Deal Strategy preference</dt>
                <dd className="font-semibold mt-1 capitalize">{profile.financingType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Timeline parameters</dt>
                <dd className="font-semibold mt-1 capitalize">
                  {profile.acquisitionTimeline.replace("_", "-")}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Side: Curated Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Curated Target Opportunities</h2>
                <p className="text-xs text-muted-foreground">Private, de-identified mandates matching your target parameters.</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/10 text-primary">
                {matches.length} Shared
              </span>
            </div>

            <div className="divide-y divide-border">
              {matches.length === 0 ? (
                <div className="p-12 text-center text-sm">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                    <Award className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-foreground">No Shared Mandates Yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Once William approves your application, relevant seller portfolios matching your parameters will be privately shared and appear here.
                  </p>
                </div>
              ) : (
                matches.map((m, index) => (
                  <div key={`${m.sellerSector}-${m.sellerRevenueRange}-${index}`} className="p-6 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {m.sellerBusinessName}
                        </span>
                        {m.requiresNda && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                            NDA required
                          </span>
                        )}
                      </div>

                      {/* De-identified Parameters Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground/80 block">Sector</span>
                          {m.sellerSector}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block">Geography</span>
                          {m.sellerGeography}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block">Revenue</span>
                          <span className="capitalize">{m.sellerRevenueRange.replace("_", " ")}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block">EBITDA</span>
                          <span className="capitalize">{"sellerEbitdaRange" in m ? m.sellerEbitdaRange.replace("_", " ") : "Available after approval"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {m.requiresNda ? (
                        <button className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 shadow-sm transition-all cursor-pointer">
                          <FileText className="h-3.5 w-3.5" />
                          Sign NDA
                        </button>
                      ) : m.canContactAdvisor ? (
                        <button className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4 py-2 shadow-sm transition-all cursor-pointer">
                          Contact William
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
