"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  Building,
  DollarSign,
  Globe,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Edit,
  Lock,
  Loader2,
  Sparkles
} from "lucide-react";
import { COPY } from "@/lib/copy";
import { 
  SECTORS, 
  GEOGRAPHIES, 
  FINANCING_TYPES, 
  ACQUISITION_EXPERIENCE, 
  ACQUISITION_TIMELINE 
} from "@/lib/constants";
import { BuyerStatusBadge } from "@/components/buyers/buyer-status-badge";
import { BuyerForm, BuyerFormValues } from "@/components/buyers/buyer-form";
import { ConfirmModal } from "@/components/ui/confirm-modal";

function formatCAD(amount: number) {
  if (amount >= 1_000_000) {
    const formatted = (amount / 1_000_000).toFixed(1);
    return `$${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}M CAD`;
  }
  return `$${(amount / 1_000).toLocaleString()}k CAD`;
}

export default function BuyerProfile() {
  const params = useParams();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"pending" | "qualified" | "disqualified" | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch buyer by id from Convex
  const buyer = useQuery(api.buyers.get, { id: id as Id<"buyers"> });
  const updateStatus = useMutation(api.buyers.updateStatus);
  const updateBuyer = useMutation(api.buyers.update);

  if (buyer === undefined) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-xs text-zinc-500">{COPY.common.loading}</p>
      </div>
    );
  }

  if (buyer === null) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Buyer Not Found</h2>
        <p className="text-xs text-zinc-500">The buyer profile you are looking for does not exist or you do not have permission to view it.</p>
        <Link
          href="/buyers"
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Return to Buyers
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "pending" | "qualified" | "disqualified";
    if (newStatus === "disqualified") {
      setPendingStatus(newStatus);
      setIsConfirmOpen(true);
    } else {
      await performStatusChange(newStatus);
    }
  };

  const performStatusChange = async (status: "pending" | "qualified" | "disqualified") => {
    setUpdatingStatus(true);
    try {
      await updateStatus({ id: buyer._id, status });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
      setIsConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  const handleEditSubmit = async (values: BuyerFormValues) => {
    await updateBuyer({ id: buyer._id, ...values });
    setIsEditing(false);
  };

  // Maps values to human-readable labels
  const sectorsLabels = buyer.sectorInterest.map(
    (s) => SECTORS.find((x) => x.value === s)?.label || s
  );

  const geographiesLabels = buyer.geography.map(
    (g) => GEOGRAPHIES.find((x) => x.value === g)?.label || g
  );

  const financingLabel = FINANCING_TYPES.find(
    (x) => x.value === buyer.financingType
  )?.label || buyer.financingType;

  const experienceLabel = ACQUISITION_EXPERIENCE.find(
    (x) => x.value === buyer.acquisitionExperience
  )?.label || buyer.acquisitionExperience;

  const timelineLabel = ACQUISITION_TIMELINE.find(
    (x) => x.value === buyer.acquisitionTimeline
  )?.label || buyer.acquisitionTimeline;

  return (
    <div className="space-y-8 max-w-7xl relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col space-y-4">
        <Link
          href="/buyers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to buyers list</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hidden sm:block shrink-0">
              <Building className="h-6 w-6 text-zinc-400" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {buyer.name}
                </h1>
                <BuyerStatusBadge status={buyer.qualificationStatus} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                <a href={`mailto:${buyer.email}`} className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{buyer.email}</span>
                </a>
                {buyer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{buyer.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Status Mutation Select */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Status
              </label>
              {updatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              ) : (
                <select
                  value={buyer.qualificationStatus}
                  onChange={handleStatusChange}
                  className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  <option value="pending" className="bg-zinc-950 text-zinc-300">Pending Review</option>
                  <option value="qualified" className="bg-zinc-950 text-emerald-400">Qualified</option>
                  <option value="disqualified" className="bg-zinc-950 text-rose-400">Disqualified</option>
                </select>
              )}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 transition-all duration-300"
            >
              <Edit className="h-4 w-4 text-zinc-400" />
              <span>Edit Criteria</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPLIT PANE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CRITERIA & FINANCIALS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Investment Parameters */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2.5">
              <DollarSign className="h-4.5 w-4.5 text-amber-500" />
              <span>Acquisition Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5 p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Target Budget (CAD)
                </span>
                <p className="text-lg font-bold text-white">
                  {formatCAD(buyer.budgetMin)} – {formatCAD(buyer.budgetMax)}
                </p>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full w-full rounded-full" />
                </div>
              </div>

              <div className="space-y-1.5 p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {COPY.buyers.fields.financing}
                </span>
                <p className="text-sm font-bold text-zinc-200">
                  {financingLabel}
                </p>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed mt-1">
                  Required capital verification checklists should map to financing terms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{COPY.buyers.fields.timeline}</span>
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {timelineLabel}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{COPY.buyers.fields.experience}</span>
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {experienceLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Sector & Geographic Tags */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Building className="h-4 w-4 text-zinc-500" />
                <span>{COPY.buyers.fields.sectors}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {sectorsLabels.map((sector, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl transition-all duration-300 shadow-sm"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-900/60">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-500" />
                <span>{COPY.buyers.fields.geographies}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {geographiesLabels.map((geo, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl"
                  >
                    {geo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Verification Verification */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
              <span>Advisor Verification Checklist</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Proof of Funds */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-28 ${
                buyer.proofOfFundsReviewed 
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                  : "bg-zinc-900/20 border-zinc-900 text-zinc-500"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Proof of Funds</span>
                  {buyer.proofOfFundsReviewed ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                </div>
                <p className="text-xs font-bold text-zinc-300 mt-2">
                  {buyer.proofOfFundsReviewed ? "Capital Verified" : "Pending Document"}
                </p>
              </div>

              {/* NDA Status */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-28 ${
                buyer.ndaSigned 
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                  : "bg-zinc-900/20 border-zinc-900 text-zinc-500"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Signed NDA</span>
                  {buyer.ndaSigned ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                </div>
                <p className="text-xs font-bold text-zinc-300 mt-2">
                  {buyer.ndaSigned ? "Corporate NDA Active" : "Unsigned NDA"}
                </p>
              </div>

              {/* Background check */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-28 ${
                buyer.backgroundCheckComplete 
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                  : "bg-zinc-900/20 border-zinc-900 text-zinc-500"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Advisor Check</span>
                  {buyer.backgroundCheckComplete ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                </div>
                <p className="text-xs font-bold text-zinc-300 mt-2">
                  {buyer.backgroundCheckComplete ? "Approved" : "In Progress"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIDENTIAL ADVISOR NOTES */}
        <div className="space-y-8">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 flex flex-col h-full justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Confidential Notes</span>
                </h3>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                  Advisor Only
                </span>
              </div>
              
              {buyer.notes ? (
                <p className="text-xs leading-relaxed text-zinc-400 whitespace-pre-line bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl">
                  {buyer.notes}
                </p>
              ) : (
                <div className="p-8 text-center bg-zinc-950/20 border border-zinc-900/50 border-dashed rounded-xl">
                  <p className="text-xs text-zinc-500">No advisor notes recorded for this buyer yet.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2 mt-auto">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  AI Matching Safeguard
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-zinc-400">
                These confidential advisor notes and the buyer&apos;s real name are strictly excluded from Claude Sonnet matching queries. AI indexing is built entirely off verified criteria structure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT SLIDE-OVER SHEET OVERLAY */}
      {isEditing && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsEditing(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          />
          {/* Sheet */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-zinc-950 border-l border-zinc-900 shadow-2xl p-8 overflow-y-auto z-50 transform transition-transform duration-300 animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-8">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit className="h-5 w-5 text-amber-500" />
                  <span>Edit Buyer Criteria</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Update active buy-side investment mandates and checklist status.
                </p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <BuyerForm 
              initialValues={{
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone,
                sectorInterest: buyer.sectorInterest,
                budgetMin: buyer.budgetMin,
                budgetMax: buyer.budgetMax,
                geography: buyer.geography,
                financingType: buyer.financingType,
                acquisitionExperience: buyer.acquisitionExperience,
                acquisitionTimeline: buyer.acquisitionTimeline,
                proofOfFundsReviewed: buyer.proofOfFundsReviewed,
                ndaSigned: buyer.ndaSigned,
                backgroundCheckComplete: buyer.backgroundCheckComplete,
                notes: buyer.notes,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
            />
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Confirm Disqualification"
        description={`Are you sure you want to disqualify the buyer mandate for ${buyer.name}? This will archive their matching readiness.`}
        confirmLabel="Disqualify Client"
        cancelLabel="Keep Active"
        onConfirm={() => pendingStatus && performStatusChange(pendingStatus)}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingStatus(null);
        }}
        variant="destructive"
      />
    </div>
  );
}
