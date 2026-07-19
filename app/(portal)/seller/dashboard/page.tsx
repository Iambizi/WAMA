"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { CheckCircle2, Clock, Landmark, AlertCircle } from "lucide-react";

export default function SellerDashboard() {
  const profile = useQuery(api.sellers.currentSeller);

  if (profile === undefined) {
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
          <Landmark className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">No Profile Found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          You haven&apos;t completed your Exit Readiness Intake yet. Start now to evaluate your readiness.
        </p>
        <Link
          href="/seller/intake"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
        >
          Start Exit Intake
        </Link>
      </div>
    );
  }

  const checklistItems = [
    { label: "CPA-signed Financials (last 5 years)", value: profile.docFinancialsCpa },
    { label: "Interim Financials (current year)", value: profile.docFinancialsInterim },
    { label: "Detailed Accounts Receivable (A/R)", value: profile.docAccountsReceivable },
    { label: "Detailed Accounts Payable (A/P)", value: profile.docAccountsPayable },
    { label: "Employee Org Chart", value: profile.docEmployeeOrgChart },
    { label: "Executive & Employee Salaries", value: profile.docExecutiveSalaries },
  ];
  const completedCount = checklistItems.filter((i) => i.value).length;

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
          label: "Qualified",
          icon: <CheckCircle2 className="h-4 w-4" />,
          classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
        };
      case "disqualified":
        return {
          label: "Disqualified",
          icon: <AlertCircle className="h-4 w-4" />,
          classes: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/50",
        };
    }
  };

  const statusInfo = getStatusBadge(profile.qualificationStatus);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Seller Portal</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">Exit Readiness Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your qualification status, exit preparation checklists, and submitted criteria.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Status Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Submission Status
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.classes}`}>
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            {profile.qualificationStatus === "pending"
              ? "William is reviewing your exit profile to verify documentation completeness and criteria alignment."
              : profile.qualificationStatus === "qualified"
              ? "Your profile has been qualified. Your mandate is now active in our private network."
              : "Your application does not align with WAMA parameters at this time."}
          </p>
        </div>

        {/* Checklist Progress */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Checklist Completeness
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight">{completedCount}</span>
            <span className="text-sm text-muted-foreground">/ 6 verified</span>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500"
              style={{ width: `${(completedCount / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Advisor Notice */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Advisor Next Steps
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            William (M&A Advisor) handles all match validations manually. When an appropriate buyer is identified, William will contact you to request authorization before sharing any de-identified teasers.
          </p>
          <div className="mt-4 border-t border-border/50 pt-3 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">W</div>
            <span className="text-[10px] text-muted-foreground">Managed privately by William</span>
          </div>
        </div>
      </div>

      {/* Submitted Information Summary */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <h2 className="text-base font-bold">Submitted Business Profile</h2>
          <p className="text-xs text-muted-foreground">Read-only copy of your onboarding details.</p>
        </div>
        <div className="p-6">
          <dl className="grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Business Name</dt>
              <dd className="font-medium mt-0.5">{profile.businessName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Target Sector</dt>
              <dd className="font-medium mt-0.5">{profile.sector}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Location</dt>
              <dd className="font-medium mt-0.5">{profile.geography}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Years in Operation</dt>
              <dd className="font-medium mt-0.5">{profile.yearsInOperation} years</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Revenue Range</dt>
              <dd className="font-medium mt-0.5 capitalize">{profile.revenueRange.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">EBITDA Range</dt>
              <dd className="font-medium mt-0.5 capitalize">{profile.ebitdaRange.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Employee Count</dt>
              <dd className="font-medium mt-0.5 capitalize">{profile.employeeCount.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Transaction Strategy</dt>
              <dd className="font-medium mt-0.5 capitalize">{profile.transactionType.replace("_", " ")}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Reason for Considering Sale</dt>
              <dd className="mt-1 text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                {profile.reasonForSale}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
