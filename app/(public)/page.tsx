"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.current);

  const getWorkspaceLink = () => {
    if (!currentUser) return "/dashboard";
    if (currentUser.role === "admin") return "/dashboard";
    if (currentUser.role === "buyer") return "/buyer/dashboard";
    if (currentUser.role === "seller") return "/seller/dashboard";
    if (currentUser.role === "unassigned") {
      if (currentUser.onboardingIntent === "buyer") return "/buyer/apply";
      if (currentUser.onboardingIntent === "seller") return "/seller/intake";
    }
    return "/";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold text-base shadow-sm">
              W
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">WAMA</span>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                href={getWorkspaceLink()}
                className="rounded-lg bg-muted px-4 py-2 text-xs font-semibold hover:bg-muted/80 transition-colors"
              >
                Go to Workspace
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center px-6 py-20 lg:py-32 relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6 animate-pulse">
            Advisor-Led Private Network
          </span>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-foreground to-foreground/85 bg-clip-text mb-6">
            Private SME Acquisition <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Matching & Deal Readiness</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
            WAMA connects verified buyers and transaction-ready small-to-medium enterprises in Montreal and across Quebec. Managed by William, M&A advisor, to ensure confidentiality and alignment.
          </p>

          {/* Action Cards */}
          <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-2 text-left mt-8">
            {/* Seller Pathway */}
            <div className="group rounded-2xl border border-border/80 bg-card/50 p-8 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30 relative flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-3">For Business Owners</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Assess your exit readiness, track document checklist completeness, and enter the private advisory pipeline securely.
                </p>
                <ul className="space-y-2 mb-8 text-xs text-muted-foreground/90">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Evaluate corporate exit readiness snapshot
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    De-identified data structure protects identity
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Advisor review and qualification process
                  </li>
                </ul>
              </div>
              <Link
                href="/seller/intake"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border hover:border-primary/30 bg-muted/20 hover:bg-muted/40 px-5 py-3 text-sm font-semibold transition-all active:scale-98"
              >
                Assess Exit Readiness
              </Link>
            </div>

            {/* Buyer Pathway */}
            <div className="group rounded-2xl border border-border/80 bg-card/50 p-8 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30 relative flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mb-6">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-3">For Serious Buyers</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Apply for verified buyer status, define your specific acquisition target criteria, and review curated opportunities.
                </p>
                <ul className="space-y-2 mb-8 text-xs text-muted-foreground/90">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Detailed criteria matching algorithm
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Direct proof-of-funds qualification
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Explicit advisor-approved visibility
                  </li>
                </ul>
              </div>
              <Link
                href="/buyer/apply"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3 text-sm font-semibold transition-all shadow-sm active:scale-98"
              >
                Apply for Verification
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} WAMA Network. Operated by William (M&A Advisor). Montreal, QC.
        </div>
      </footer>
    </div>
  );
}
