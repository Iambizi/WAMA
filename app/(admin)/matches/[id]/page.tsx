"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle,
  Lock,
  Building,
  Briefcase,
  Layers,
  AlertCircle,
  Loader2,
  Bookmark,
  CheckCircle2,
  XCircle,
  Send,
  HelpCircle
} from "lucide-react";
import { COPY } from "@/lib/copy";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  SECTORS,
  GEOGRAPHIES,
  REVENUE_RANGES,
  EBITDA_RANGES,
  EMPLOYEE_COUNTS,
  TRANSACTION_TYPES,
  FINANCING_TYPES,
  ACQUISITION_EXPERIENCE,
  ACQUISITION_TIMELINE
} from "@/lib/constants";

// Available pipeline stages in chronological order (excluding 'rejected' and 'closed_lost' which are terminal/side actions)
const PIPELINE_STAGES = [
  { value: "suggested", label: "Suggested", color: "from-zinc-500 to-zinc-400" },
  { value: "reviewed", label: "Reviewed", color: "from-blue-500 to-indigo-400" },
  { value: "approved", label: "Approved", color: "from-emerald-500 to-teal-400" },
  { value: "introduced", label: "Introduced", color: "from-amber-500 to-yellow-400" },
  { value: "nda_signed", label: "NDA Signed", color: "from-violet-500 to-purple-400" },
  { value: "in_discussions", label: "In Discussions", color: "from-pink-500 to-rose-400" },
  { value: "closed_won", label: "Closed — Won", color: "from-emerald-600 to-teal-500" }
] as const;

export default function MatchDetail() {
  const params = useParams();
  const id = params.id as string;

  // Local state for advisor notes and UI loading animations
  const [advisorNotes, setAdvisorNotes] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingStatus, setPendingStatus] = useState<typeof PIPELINE_STAGES[number]["value"] | "rejected" | "closed_lost" | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch populated match recommendation from Convex
  const match = useQuery(api.matches.getPopulated, { id: id as Id<"matches"> });
  const updateMatchStatus = useMutation(api.matches.updateStatus);

  // Sync database notes to local text area state when loaded
  if (advisorNotes === null && match !== undefined && match !== null) {
    setAdvisorNotes(match.advisorNotes || "");
  }

  if (match === undefined) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-xs text-zinc-500">{COPY.common.loading}</p>
      </div>
    );
  }

  if (match === null) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Match Not Found</h2>
        <p className="text-xs text-zinc-500">The match recommendation profile you are trying to review does not exist.</p>
        <Link
          href="/matches"
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Return to Matches
        </Link>
      </div>
    );
  }

  const handleStageTransition = async (newStatus: typeof PIPELINE_STAGES[number]["value"] | "rejected" | "closed_lost") => {
    if (newStatus === "rejected") {
      setPendingStatus(newStatus);
      setIsConfirmOpen(true);
    } else {
      await performStageTransition(newStatus);
    }
  };

  const performStageTransition = async (newStatus: typeof PIPELINE_STAGES[number]["value"] | "rejected" | "closed_lost") => {
    setUpdatingStatus(true);
    setStatusMessage(null);
    try {
      await updateMatchStatus({
        id: match._id,
        status: newStatus,
        advisorNotes: advisorNotes || undefined
      });
      setStatusMessage({ type: "success", text: `Match pipeline successfully updated to: ${newStatus.replace("_", " ")}` });
    } catch (err) {
      console.error("Failed to update pipeline stage:", err);
      setStatusMessage({ type: "error", text: "An error occurred while attempting to advance pipeline stage." });
    } finally {
      setUpdatingStatus(false);
      setIsConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setStatusMessage(null);
    try {
      await updateMatchStatus({
        id: match._id,
        status: match.status,
        advisorNotes: advisorNotes || ""
      });
      setStatusMessage({ type: "success", text: "Confidential remarks saved successfully." });
    } catch (err) {
      console.error("Failed to save remarks:", err);
      setStatusMessage({ type: "error", text: "An error occurred while saving advisor notes." });
    } finally {
      setSavingNotes(false);
    }
  };

  // Human-readable labels for Seller
  const sellerSectorLabel = SECTORS.find((s) => s.value === match.sellerSector)?.label || match.sellerSector;
  const sellerGeographyLabel = GEOGRAPHIES.find((g) => g.value === match.sellerGeography)?.label || match.sellerGeography;
  const sellerRevenueLabel = REVENUE_RANGES.find((r) => r.value === match.sellerRevenueRange)?.label || match.sellerRevenueRange;
  const sellerEbitdaLabel = EBITDA_RANGES.find((eb) => eb.value === match.sellerEbitdaRange)?.label || match.sellerEbitdaRange;
  const sellerEmployeeLabel = EMPLOYEE_COUNTS.find((ec) => ec.value === match.sellerEmployeeCount)?.label || match.sellerEmployeeCount;
  const sellerTransactionLabel = TRANSACTION_TYPES.find((t) => t.value === match.sellerTransactionType)?.label || match.sellerTransactionType;

  // Human-readable labels for Buyer
  const buyerFinancingLabel = FINANCING_TYPES.find((f) => f.value === match.buyerFinancingType)?.label || match.buyerFinancingType;
  const buyerExperienceLabel = ACQUISITION_EXPERIENCE.find((ae) => ae.value === match.buyerAcquisitionExperience)?.label || match.buyerAcquisitionExperience;
  const buyerTimelineLabel = ACQUISITION_TIMELINE.find((at) => at.value === match.buyerAcquisitionTimeline)?.label || match.buyerAcquisitionTimeline;

  // Circular Radial progress math
  const radialRadius = 40;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const radialOffset = radialCircumference - (match.aiScore / 100) * radialCircumference;

  return (
    <div className="space-y-8 max-w-7xl relative pb-16">
      
      {/* HEADER NAVIGATION */}
      <div className="flex flex-col space-y-4">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          id="match-back-nav"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to matches dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted border border-border rounded-2xl hidden sm:block shrink-0">
              <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500/10" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                <span>Advisor Match Review</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-muted border border-border text-muted-foreground rounded-md">
                  Ref: {String(match._id).slice(-6)}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Detailed matching evaluation for sell-side mandate <span className="font-semibold text-foreground">{match.sellerBusinessName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStageTransition("rejected")}
              disabled={updatingStatus || match.status === "rejected"}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                match.status === "rejected"
                  ? "bg-rose-500/5 text-rose-500 border-rose-500/20"
                  : "bg-card hover:bg-rose-500/5 text-rose-600 hover:text-rose-500 border border-border hover:border-rose-500/20"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject Match</span>
            </button>
            
            <button
              onClick={() => handleStageTransition("closed_lost")}
              disabled={updatingStatus || match.status === "closed_lost"}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                match.status === "closed_lost"
                  ? "bg-rose-950/30 text-rose-500 border-rose-900/20"
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <span>Closed — Lost</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATUS SYSTEM MESSAGES */}
      {statusMessage && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
              : "bg-rose-500/5 border-rose-500/10 text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          )}
          <p>{statusMessage.text}</p>
        </div>
      )}

      {/* CORE EVALUATION SECTION: AI SCORE & REASONING SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RADIAL SCORE CARD */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-40 pointer-events-none" />
          
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Fit Match score</span>
          </h2>

          {/* SVG Radial progress bar */}
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="absolute transform -rotate-90 w-full h-full">
              <circle
                cx="64"
                cy="64"
                r={radialRadius}
                className="stroke-muted fill-transparent"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r={radialRadius}
                className={`fill-transparent transition-all duration-1000 ${
                  match.aiScore >= 80
                    ? "stroke-emerald-500"
                    : match.aiScore >= 50
                      ? "stroke-amber-500"
                      : "stroke-rose-500"
                }`}
                strokeWidth="8"
                strokeDasharray={radialCircumference}
                strokeDashoffset={radialOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-foreground">{match.aiScore}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Match Strength</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
              match.aiScore >= 80
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : match.aiScore >= 50
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}>
              {match.aiScore >= 80 ? "Premium Strong Fit" : match.aiScore >= 50 ? "Qualified Standard Fit" : "Speculative Fit"}
            </span>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px] pt-1">
              Calculated dynamically on de-identified acquisition criteria and mandating constraints.
            </p>
          </div>
        </div>

        {/* AI REASONING CARD */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
              <span>{COPY.matches.details.fitReasoning}</span>
            </h2>
            <div className="p-4.5 bg-muted/20 border border-border rounded-xl relative group">
              <div className="absolute top-2 right-2 p-1 bg-amber-500/5 border border-amber-500/10 rounded-md opacity-40 group-hover:opacity-100 transition-opacity">
                <Sparkles className="h-3 w-3 text-amber-400" />
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line italic">
                &ldquo;{match.aiReasoning}&rdquo;
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {COPY.matches.details.matchedCriteria}
            </h3>
            <div className="flex flex-wrap gap-2">
              {match.aiMatchedCriteria.map((criterion: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 hover:border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300"
                >
                  <CheckCircle className="h-3 w-3 stroke-[2.5]" />
                  <span>{criterion}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DEAL PIPELINE TRACKER */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-amber-500" />
            <span>Interactive Deal Pipeline Stage</span>
          </h2>
          <span className="text-[10px] text-muted-foreground font-semibold">
            Current: <span className="font-bold text-foreground capitalize">{match.status.replace("_", " ")}</span>
          </span>
        </div>

        {/* Dynamic Stepper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = PIPELINE_STAGES.findIndex(s => s.value === match.status) >= idx;
            const isActive = match.status === stage.value;

            return (
              <button
                key={stage.value}
                disabled={updatingStatus || match.status === "rejected" || match.status === "closed_lost"}
                onClick={() => handleStageTransition(stage.value)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer disabled:cursor-not-allowed group relative overflow-hidden ${
                  isActive
                    ? "bg-card border-amber-500/60 shadow-lg shadow-amber-500/5"
                    : isCompleted
                      ? "bg-muted/30 border-border text-foreground hover:border-muted-foreground/30"
                      : "bg-muted/10 border-border/40 text-muted-foreground hover:border-border"
                }`}
              >
                {/* Visual completion indicators */}
                <span className={`h-1.5 w-1.5 rounded-full mb-1.5 transition-all duration-300 ${
                  isActive 
                    ? "bg-amber-400 animate-pulse scale-125" 
                    : isCompleted 
                      ? "bg-emerald-500" 
                      : "bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
                }`} />

                <span className={`text-[10px] font-bold uppercase tracking-wider block transition-colors ${
                  isActive 
                    ? "text-amber-500 dark:text-amber-400" 
                    : isCompleted 
                      ? "text-foreground" 
                      : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  {stage.label}
                </span>

                {/* Progress glow bar underneath active item */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Conditional stage status advice helpers */}
        <div className="p-4 bg-muted/20 border border-border rounded-xl flex items-start gap-3">
          <HelpCircle className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Advisors can manually push the mandate pipeline forward as buy-sell discussions advance. Transitioning a match records an append-only log in the advisor activity tracking database. Closed deals should be archived using the <span className="font-semibold text-foreground">Closed — Won</span> or <span className="font-semibold text-foreground">Closed — Lost</span> triggers.
          </p>
        </div>
      </div>

      {/* SPLIT COLUMN PROFILE SUMMARY COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SELLER FIT PROFILE */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-amber-500" />
              <span>Seller profile summary</span>
            </h2>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
              Readiness: {match.sellerReadinessScore}%
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Financial Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3.5 bg-muted/20 border border-border rounded-xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Revenue range</span>
                <p className="text-xs font-semibold text-foreground">{sellerRevenueLabel}</p>
              </div>
              <div className="space-y-1.5 p-3.5 bg-muted/20 border border-border rounded-xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">EBITDA range</span>
                <p className="text-xs font-semibold text-foreground">{sellerEbitdaLabel}</p>
              </div>
            </div>

            {/* Criteria List */}
            <div className="divide-y divide-border text-xs">
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Business sector</span>
                <span className="font-semibold text-foreground">{sellerSectorLabel}</span>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Business geography</span>
                <span className="font-semibold text-foreground">{sellerGeographyLabel}</span>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Structure structure</span>
                <span className="font-semibold text-foreground">{sellerTransactionLabel}</span>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Employee strength</span>
                <span className="font-semibold text-foreground">{sellerEmployeeLabel}</span>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Operating timeline</span>
                <span className="font-semibold text-foreground">{match.sellerYearsInOperation} Years</span>
              </div>
            </div>

            {/* AI Summary block */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>Advisor summarized reason for sale</span>
              </span>
              <p className="text-xs leading-relaxed text-foreground p-3 bg-muted/10 border border-border/80 rounded-xl">
                {match.sellerReasonForSale}
              </p>
            </div>
            
            {/* Identity details (PII) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Lock className="h-3 w-3 text-amber-500" />
                <span>Authorized advisor contact records</span>
              </span>
              <div className="p-3.5 bg-muted/20 border border-border rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner name:</span>
                  <span className="font-semibold text-foreground">{match.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direct email:</span>
                  <a href={`mailto:${match.sellerEmail}`} className="font-semibold text-foreground hover:text-primary transition-colors">{match.sellerEmail}</a>
                </div>
                {match.sellerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direct phone:</span>
                    <span className="font-semibold text-foreground">{match.sellerPhone}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* BUYER PROFILE */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-amber-500" />
              <span>Buyer profile summary</span>
            </h2>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20">
              Acquirer criteria
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Financial Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3.5 bg-muted/20 border border-border rounded-xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Minimum budget</span>
                <p className="text-xs font-semibold text-foreground">
                  ${(match.buyerBudgetMin / 1000000).toFixed(1)}M CAD
                </p>
              </div>
              <div className="space-y-1.5 p-3.5 bg-muted/20 border border-border rounded-xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Maximum budget</span>
                <p className="text-xs font-semibold text-foreground">
                  ${(match.buyerBudgetMax / 1000000).toFixed(1)}M CAD
                </p>
              </div>
            </div>

            {/* Criteria List */}
            <div className="divide-y divide-border text-xs">
              <div className="py-3 flex flex-col gap-1.5">
                <span className="text-muted-foreground">Sectors of interest</span>
                <div className="flex flex-wrap gap-1">
                  {match.buyerSectorInterest.map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-muted border border-border text-[10px] text-foreground font-semibold rounded-lg capitalize"
                    >
                      {s.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div className="py-3 flex flex-col gap-1.5">
                <span className="text-muted-foreground">Preferred geographies</span>
                <div className="flex flex-wrap gap-1">
                  {match.buyerGeography.map((g: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-muted border border-border text-[10px] text-foreground font-semibold rounded-lg capitalize"
                    >
                      {g.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Financing preference</span>
                <span className="font-semibold text-foreground">{buyerFinancingLabel}</span>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">M&A experience level</span>
                <span className="font-semibold text-foreground">{buyerExperienceLabel}</span>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <span className="text-muted-foreground">Desired deal timeline</span>
                <span className="font-semibold text-foreground">{buyerTimelineLabel}</span>
              </div>
            </div>

            {/* Safeguard Indicators */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className={`p-2 rounded-xl border text-[9px] font-bold uppercase tracking-wider ${
                match.buyerNdaSigned
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted/10 border-border text-muted-foreground"
              }`}>
                NDA Signed
              </div>
              <div className={`p-2 rounded-xl border text-[9px] font-bold uppercase tracking-wider ${
                match.buyerProofOfFundsReviewed
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted/10 border-border text-muted-foreground"
              }`}>
                Funds Verified
              </div>
              <div className={`p-2 rounded-xl border text-[9px] font-bold uppercase tracking-wider ${
                match.buyerBackgroundCheckComplete
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted/10 border-border text-muted-foreground"
              }`}>
                BG Check
              </div>
            </div>

            {/* Identity details (PII) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Lock className="h-3 w-3 text-amber-500" />
                <span>Authorized advisor contact records</span>
              </span>
              <div className="p-3.5 bg-muted/20 border border-border rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyer name:</span>
                  <span className="font-semibold text-foreground">{match.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direct email:</span>
                  <a href={`mailto:${match.buyerEmail}`} className="font-semibold text-foreground hover:text-primary transition-colors">{match.buyerEmail}</a>
                </div>
                {match.buyerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direct phone:</span>
                    <span className="font-semibold text-foreground">{match.buyerPhone}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* INTERNAL ADVISOR NOTES / REMARKS */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Bookmark className="h-4.5 w-4.5 text-amber-500" />
            <span>Confidential Internal Advisor Remarks</span>
          </h2>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">
            Advisor Eyes Only
          </span>
        </div>

        <div className="space-y-4">
          <textarea
            value={advisorNotes ?? ""}
            onChange={(e) => setAdvisorNotes(e.target.value)}
            placeholder="Record transaction negotiation remarks, buyer responses, NDA updates, and upcoming calendar meetings specific to this deal matchup..."
            rows={5}
            className="w-full p-4 bg-muted/20 focus:bg-muted/40 border border-border focus:border-muted-foreground/30 rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-300 resize-none"
          />
          
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xl">
              Confidential remarks written here are strictly protected on the data layer and will never be exposed during any background AI matching routines or exports.
            </p>
            
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-muted disabled:text-muted-foreground text-zinc-950 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-md shadow-amber-500/10 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {savingNotes ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-950" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 text-zinc-950 stroke-[2.5]" />
                  <span>Save Remarks</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Confirm Match Rejection"
        description="Are you sure you want to reject and archive this recommendation? It will be moved to rejected status and marked as inactive."
        confirmLabel="Reject Match"
        cancelLabel="Keep Reviewing"
        onConfirm={() => pendingStatus && performStageTransition(pendingStatus)}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingStatus(null);
        }}
        variant="destructive"
      />
    </div>
  );
}
