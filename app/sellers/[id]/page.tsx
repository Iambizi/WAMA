"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  REVENUE_RANGES, 
  EBITDA_RANGES, 
  EMPLOYEE_COUNTS, 
  TRANSACTION_TYPES 
} from "@/lib/constants";
import { SellerForm, SellerFormValues } from "@/components/sellers/seller-form";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function SellerProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"pending" | "qualified" | "disqualified" | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch seller by id from Convex
  const seller = useQuery(api.sellers.get, { id: id as Id<"sellers"> });
  const updateStatus = useMutation(api.sellers.updateStatus);
  const updateSeller = useMutation(api.sellers.update);

  if (seller === undefined) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-xs text-zinc-500">{COPY.common.loading}</p>
      </div>
    );
  }

  if (seller === null) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Mandate Not Found</h2>
        <p className="text-xs text-zinc-500">The seller profile you are looking for does not exist or you do not have permission to view it.</p>
        <Link
          href="/sellers"
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
        >
          Return to Sellers
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
      await updateStatus({ id: seller._id, status });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
      setIsConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  const handleEditSubmit = async (values: SellerFormValues) => {
    await updateSeller({ id: seller._id, ...values });
    setIsEditing(false);
  };

  const handleGenerateMatches = async () => {
    setGeneratingMatches(true);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sellerId: seller._id }),
      });
      if (response.ok) {
        router.push("/matches");
      } else {
        const errorData = await response.json();
        alert(errorData.details || "Failed to generate matches.");
      }
    } catch (err) {
      console.error("Match generation triggered error:", err);
      alert("An unexpected error occurred during match generation.");
    } finally {
      setGeneratingMatches(false);
    }
  };

  // Maps values to human-readable labels
  const sectorLabel = SECTORS.find((s) => s.value === seller.sector)?.label || seller.sector;
  const geographyLabel = GEOGRAPHIES.find((g) => g.value === seller.geography)?.label || seller.geography;
  const revenueLabel = REVENUE_RANGES.find((r) => r.value === seller.revenueRange)?.label || seller.revenueRange;
  const ebitdaLabel = EBITDA_RANGES.find((eb) => eb.value === seller.ebitdaRange)?.label || seller.ebitdaRange;
  const employeeLabel = EMPLOYEE_COUNTS.find((ec) => ec.value === seller.employeeCount)?.label || seller.employeeCount;
  const transactionLabel = TRANSACTION_TYPES.find((t) => t.value === seller.transactionType)?.label || seller.transactionType;

  const readinessScore = seller.readinessScore ?? 0;

  return (
    <div className="space-y-8 max-w-7xl relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col space-y-4">
        <Link
          href="/sellers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sellers list</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hidden sm:block shrink-0">
              <Building className="h-6 w-6 text-zinc-400" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {seller.businessName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                    seller.qualificationStatus === "qualified"
                      ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                      : seller.qualificationStatus === "disqualified"
                        ? "bg-rose-500/5 text-rose-400 border-rose-500/10"
                        : "bg-zinc-800 text-zinc-400 border-zinc-800"
                  }`}
                >
                  {seller.qualificationStatus === "qualified" 
                    ? "Qualified" 
                    : seller.qualificationStatus === "disqualified" 
                      ? "Disqualified" 
                      : "Pending Review"}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Owner: {seller.name}</span>
                <span className="text-zinc-600">|</span>
                <a href={`mailto:${seller.email}`} className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{seller.email}</span>
                </a>
                {seller.phone && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{seller.phone}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* AI Matches Generator Button */}
            {seller.qualificationStatus === "qualified" && (
              <button
                onClick={handleGenerateMatches}
                disabled={generatingMatches}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-amber-500/10 cursor-pointer disabled:cursor-not-allowed"
              >
                {generatingMatches ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                    <span>{COPY.matches.generating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
                    <span>{COPY.matches.generateButton}</span>
                  </>
                )}
              </button>
            )}

            {/* Status Mutation Select */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Status
              </label>
              {updatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              ) : (
                <select
                  value={seller.qualificationStatus}
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
              <span>Edit Mandate</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPLIT PANE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CRITERIA & METRICS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Mandate Financial Parameters */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2.5">
              <DollarSign className="h-4.5 w-4.5 text-amber-500" />
              <span>Mandate Metrics</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5 p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {COPY.sellers.fields.revenueRange}
                </span>
                <p className="text-lg font-bold text-white">
                  {revenueLabel}
                </p>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full w-2/3 rounded-full" />
                </div>
              </div>

              <div className="space-y-1.5 p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {COPY.sellers.fields.ebitdaRange}
                </span>
                <p className="text-lg font-bold text-zinc-200">
                  {ebitdaLabel}
                </p>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-1/2 rounded-full" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{COPY.sellers.fields.sector}</span>
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {sectorLabel}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{COPY.sellers.fields.geography}</span>
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {geographyLabel}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{COPY.sellers.fields.transactionType}</span>
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {transactionLabel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-900/60">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {COPY.sellers.fields.employeeCount}
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {employeeLabel}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {COPY.sellers.fields.yearsInOperation}
                </span>
                <p className="text-xs font-semibold text-zinc-300 bg-zinc-900/40 border border-zinc-900 px-3.5 py-2.5 rounded-xl">
                  {seller.yearsInOperation} years
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: AI Match-Ready Summaries */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
              <span>AI Match-Ready Mandate Summary</span>
            </h2>
            <p className="text-xs leading-relaxed text-zinc-400 whitespace-pre-line bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl">
              {seller.reasonForSale}
            </p>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                AI Matching Guardrail
              </span>
              <p className="text-[10px] leading-relaxed text-zinc-400">
                This summary represents the only free text that will be exposed during AI matching calculations. Ensure it is entirely de-identified. Individual identities (owner name, actual location, specific notes) are locked inside the portal database and omitted from prompts.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DOCUMENT READINESS & NOTES */}
        <div className="space-y-8">
          
          {/* Card 3: Document Readiness Gauge */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Readiness Tracker</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                readinessScore >= 80 
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" 
                  : readinessScore >= 50 
                    ? "bg-amber-500/5 text-amber-400 border-amber-500/10" 
                    : "bg-rose-500/5 text-rose-400 border-rose-500/10"
              }`}>
                {readinessScore >= 80 ? "Live Ready" : readinessScore >= 50 ? "Progressing" : "Unprepared"}
              </span>
            </div>

            {/* Circular Gauge / Linear progress representation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">
                  {COPY.sellers.readinessChecklist.scoreLabel}
                </span>
                <span className="text-sm font-extrabold text-white">
                  {readinessScore}%
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-900 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    readinessScore >= 80 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                      : readinessScore >= 50 
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400" 
                        : "bg-gradient-to-r from-rose-500 to-orange-400"
                  }`} 
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>

            {/* Itemized List Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Mandate Document List</span>
                <span>{readinessScore / 20}/5 Checked</span>
              </div>
              
              <div className="space-y-2.5">
                {[
                  { label: COPY.sellers.readinessChecklist.financialStatements, checked: seller.financialStatementsAvailable },
                  { label: COPY.sellers.readinessChecklist.taxReturns, checked: seller.taxReturnsAvailable },
                  { label: COPY.sellers.readinessChecklist.leaseDocuments, checked: seller.leaseDocumentsAvailable },
                  { label: COPY.sellers.readinessChecklist.corporateDocuments, checked: seller.corporateDocumentsAvailable },
                  { label: COPY.sellers.readinessChecklist.ndaSigned, checked: seller.ndaSigned },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all duration-300 ${
                      item.checked 
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                        : "bg-zinc-900/30 border-zinc-900 text-zinc-500"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.checked ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Confidential Internal Advisor Notes */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Confidential Remarks</span>
                </h3>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                  Advisor Only
                </span>
              </div>
              
              {seller.notes ? (
                <p className="text-xs leading-relaxed text-zinc-400 whitespace-pre-line bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl">
                  {seller.notes}
                </p>
              ) : (
                <div className="p-8 text-center bg-zinc-950/20 border border-zinc-900/50 border-dashed rounded-xl">
                  <p className="text-xs text-zinc-500">No advisor notes recorded for this seller mandate yet.</p>
                </div>
              )}
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
                  <span>Edit Seller Criteria</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Update active sell-side mandate details and document checklist readiness.
                </p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <SellerForm 
              initialValues={{
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                businessName: seller.businessName,
                sector: seller.sector,
                geography: seller.geography,
                revenueRange: seller.revenueRange,
                ebitdaRange: seller.ebitdaRange,
                employeeCount: seller.employeeCount,
                yearsInOperation: seller.yearsInOperation,
                transactionType: seller.transactionType,
                reasonForSale: seller.reasonForSale,
                financialStatementsAvailable: seller.financialStatementsAvailable,
                taxReturnsAvailable: seller.taxReturnsAvailable,
                leaseDocumentsAvailable: seller.leaseDocumentsAvailable,
                corporateDocumentsAvailable: seller.corporateDocumentsAvailable,
                ndaSigned: seller.ndaSigned,
                notes: seller.notes,
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
        description={`Are you sure you want to disqualify the seller mandate for ${seller.businessName}? This will archive their matching readiness.`}
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
