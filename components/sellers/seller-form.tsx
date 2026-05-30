"use client";

import { useState } from "react";
import { 
  SECTORS, 
  GEOGRAPHIES, 
  REVENUE_RANGES, 
  EBITDA_RANGES, 
  EMPLOYEE_COUNTS, 
  TRANSACTION_TYPES 
} from "@/lib/constants";
import { COPY } from "@/lib/copy";
import { Loader2 } from "lucide-react";

export interface SellerFormValues {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  sector: string;
  geography: string;
  revenueRange: "under_500k" | "500k_1m" | "1m_3m" | "3m_5m" | "5m_10m" | "over_10m";
  ebitdaRange: "under_100k" | "100k_250k" | "250k_500k" | "500k_1m" | "over_1m";
  employeeCount: "1_5" | "6_15" | "16_50" | "51_plus";
  yearsInOperation: number;
  transactionType: "full_sale" | "majority" | "minority" | "succession";
  reasonForSale: string;
  financialStatementsAvailable: boolean;
  taxReturnsAvailable: boolean;
  leaseDocumentsAvailable: boolean;
  corporateDocumentsAvailable: boolean;
  ndaSigned: boolean;
  notes?: string;
}

interface SellerFormProps {
  initialValues?: SellerFormValues;
  onSubmit: (values: SellerFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function SellerForm({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  submitLabel = COPY.common.save 
}: SellerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identity Form State
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");

  // Business Profile Form State
  const [businessName, setBusinessName] = useState(initialValues?.businessName || "");
  const [sector, setSector] = useState(initialValues?.sector || "services");
  const [geography, setGeography] = useState(initialValues?.geography || "montreal");
  const [revenueRange, setRevenueRange] = useState<SellerFormValues["revenueRange"]>(
    initialValues?.revenueRange || "1m_3m"
  );
  const [ebitdaRange, setEbitdaRange] = useState<SellerFormValues["ebitdaRange"]>(
    initialValues?.ebitdaRange || "250k_500k"
  );
  const [employeeCount, setEmployeeCount] = useState<SellerFormValues["employeeCount"]>(
    initialValues?.employeeCount || "6_15"
  );
  const [yearsInOperation, setYearsInOperation] = useState<number | "">(
    initialValues?.yearsInOperation !== undefined ? initialValues.yearsInOperation : 5
  );
  const [transactionType, setTransactionType] = useState<SellerFormValues["transactionType"]>(
    initialValues?.transactionType || "full_sale"
  );
  const [reasonForSale, setReasonForSale] = useState(initialValues?.reasonForSale || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");

  // Document Readiness Checklist State
  const [financialStatementsAvailable, setFinancialStatementsAvailable] = useState(
    initialValues?.financialStatementsAvailable || false
  );
  const [taxReturnsAvailable, setTaxReturnsAvailable] = useState(
    initialValues?.taxReturnsAvailable || false
  );
  const [leaseDocumentsAvailable, setLeaseDocumentsAvailable] = useState(
    initialValues?.leaseDocumentsAvailable || false
  );
  const [corporateDocumentsAvailable, setCorporateDocumentsAvailable] = useState(
    initialValues?.corporateDocumentsAvailable || false
  );
  const [ndaSigned, setNdaSigned] = useState(initialValues?.ndaSigned || false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Dynamic validations
    if (!name.trim()) return setError("Owner name is required.");
    if (!email.trim() || !email.includes("@")) return setError("A valid contact email is required.");
    if (!businessName.trim()) return setError("Internal business name is required.");
    if (yearsInOperation === "" || yearsInOperation < 0) {
      return setError("Years in operation must be a positive number.");
    }
    if (!reasonForSale.trim()) {
      return setError("Please provide an advisor-summarized reason for sale.");
    }

    setLoading(true);
    try {
      await onSubmit({
        name,
        email,
        phone: phone.trim() ? phone : undefined,
        businessName,
        sector,
        geography,
        revenueRange,
        ebitdaRange,
        employeeCount,
        yearsInOperation: Number(yearsInOperation),
        transactionType,
        reasonForSale,
        financialStatementsAvailable,
        taxReturnsAvailable,
        leaseDocumentsAvailable,
        corporateDocumentsAvailable,
        ndaSigned,
        notes: notes.trim() ? notes : undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during submission.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-10 max-w-4xl">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* Grid wrapper splits sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: CONTACT DETAILS & MANDATE METRICS */}
        <div className="space-y-8">
          
          {/* Section 1: Contact Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              1. Contact / Owner Identity
            </h3>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {COPY.sellers.fields.ownerName} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jean-François Tremblay"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.email} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@business.com"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="514-555-0188"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              2. Mandate Identity
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {COPY.sellers.fields.businessName} *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Projet Boulangerie Plateau"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                disabled={loading}
              />
              <span className="text-[10px] text-muted-foreground leading-normal block">
                Internal reference name. Hidden in AI matches to protect confidentiality.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.sector}
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.geography}
                </label>
                <select
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {GEOGRAPHIES.map((g) => (
                    <option key={g.value} value={g.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.yearsInOperation}
                </label>
                <input
                  type="number"
                  value={yearsInOperation}
                  onChange={(e) => setYearsInOperation(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.employeeCount}
                </label>
                <select
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value as SellerFormValues["employeeCount"])}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {EMPLOYEE_COUNTS.map((ec) => (
                    <option key={ec.value} value={ec.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {ec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIAL RANGES & DOCUMENT CHECKLIST */}
        <div className="space-y-8">
          
          {/* Section 3: Financial Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              3. Mandate Size & Deal Structure
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.revenueRange}
                </label>
                <select
                  value={revenueRange}
                  onChange={(e) => setRevenueRange(e.target.value as SellerFormValues["revenueRange"])}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {REVENUE_RANGES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.sellers.fields.ebitdaRange}
                </label>
                <select
                  value={ebitdaRange}
                  onChange={(e) => setEbitdaRange(e.target.value as SellerFormValues["ebitdaRange"])}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {EBITDA_RANGES.map((eb) => (
                    <option key={eb.value} value={eb.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {eb.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {COPY.sellers.fields.transactionType}
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as SellerFormValues["transactionType"])}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                disabled={loading}
              >
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Document Readiness Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              4. Document Readiness Checklist
            </h3>

            <div className="bg-muted/40 border border-border p-5 rounded-2xl space-y-4 dark:bg-zinc-900/40 dark:border-zinc-800/80">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={financialStatementsAvailable}
                  onChange={(e) => setFinancialStatementsAvailable(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {COPY.sellers.readinessChecklist.financialStatements}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={taxReturnsAvailable}
                  onChange={(e) => setTaxReturnsAvailable(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {COPY.sellers.readinessChecklist.taxReturns}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={leaseDocumentsAvailable}
                  onChange={(e) => setLeaseDocumentsAvailable(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {COPY.sellers.readinessChecklist.leaseDocuments}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={corporateDocumentsAvailable}
                  onChange={(e) => setCorporateDocumentsAvailable(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {COPY.sellers.readinessChecklist.corporateDocuments}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={ndaSigned}
                  onChange={(e) => setNdaSigned(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {COPY.sellers.readinessChecklist.ndaSigned}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: AI Match Ready Summaries & Notes */}
      <div className="grid grid-cols-1 gap-6 pt-6 border-t border-border">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {COPY.sellers.fields.reasonForSale} *
          </label>
          <textarea
            value={reasonForSale}
            onChange={(e) => setReasonForSale(e.target.value)}
            placeholder="e.g. Succession planning. Founder willing to stay for transition (6-12 months). High-value manufacturing equipment fully depreciated."
            className="w-full h-24 px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors resize-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
            disabled={loading}
          />
          <span className="text-[10px] text-muted-foreground leading-normal block">
            Provide a clean, de-identified transaction/reason overview. **Avoid PII (names, specific locations, target identifiers)** to ensure match recommendation safety.
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {COPY.sellers.fields.notes}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Advisor internal remarks, privately held financials, conversation summaries..."
            className="w-full h-28 px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors resize-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
            disabled={loading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-card border border-border hover:bg-muted rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all duration-300"
          disabled={loading}
        >
          {COPY.common.cancel}
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 rounded-xl text-xs font-bold text-zinc-950 transition-all duration-300 shadow-md shadow-amber-500/10"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
