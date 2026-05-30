"use client";

import { useState } from "react";
import { 
  SECTORS, 
  GEOGRAPHIES, 
  FINANCING_TYPES, 
  ACQUISITION_EXPERIENCE, 
  ACQUISITION_TIMELINE 
} from "@/lib/constants";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface BuyerFormValues {
  name: string;
  email: string;
  phone?: string;
  sectorInterest: string[];
  budgetMin: number;
  budgetMax: number;
  geography: string[];
  financingType: "cash" | "financed" | "mixed" | "unknown";
  acquisitionExperience: "first_time" | "experienced" | "serial";
  acquisitionTimeline: "0_6mo" | "6_12mo" | "12_24mo" | "24mo_plus";
  proofOfFundsReviewed: boolean;
  ndaSigned: boolean;
  backgroundCheckComplete: boolean;
  notes?: string;
}

interface BuyerFormProps {
  initialValues?: BuyerFormValues;
  onSubmit: (values: BuyerFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function BuyerForm({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  submitLabel = COPY.common.save 
}: BuyerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [budgetMin, setBudgetMin] = useState(initialValues?.budgetMin || 0);
  const [budgetMax, setBudgetMax] = useState(initialValues?.budgetMax || 1000000);
  const [financingType, setFinancingType] = useState(initialValues?.financingType || "unknown");
  const [acquisitionExperience, setAcquisitionExperience] = useState(initialValues?.acquisitionExperience || "first_time");
  const [acquisitionTimeline, setAcquisitionTimeline] = useState(initialValues?.acquisitionTimeline || "6_12mo");
  const [notes, setNotes] = useState(initialValues?.notes || "");

  // Checklist states
  const [proofOfFundsReviewed, setProofOfFundsReviewed] = useState(initialValues?.proofOfFundsReviewed || false);
  const [ndaSigned, setNdaSigned] = useState(initialValues?.ndaSigned || false);
  const [backgroundCheckComplete, setBackgroundCheckComplete] = useState(initialValues?.backgroundCheckComplete || false);

  // Array states (Sectors & Geographies)
  const [sectorInterest, setSectorInterest] = useState<string[]>(initialValues?.sectorInterest || []);
  const [geography, setGeography] = useState<string[]>(initialValues?.geography || []);

  const handleToggleSector = (val: string) => {
    setSectorInterest(prev => 
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const handleToggleGeography = (val: string) => {
    setGeography(prev => 
      prev.includes(val) ? prev.filter(g => g !== val) : [...prev, val]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) return setError("Buyer name is required.");
    if (!email.trim() || !email.includes("@")) return setError("A valid email address is required.");
    if (budgetMin < 0) return setError("Minimum budget must be a positive value.");
    if (budgetMax <= budgetMin) return setError("Maximum budget must be greater than minimum budget.");
    if (sectorInterest.length === 0) return setError("Please select at least one sector of interest.");
    if (geography.length === 0) return setError("Please select at least one preferred geography.");

    setLoading(true);
    try {
      await onSubmit({
        name,
        email,
        phone: phone.trim() ? phone : undefined,
        sectorInterest,
        budgetMin,
        budgetMax,
        geography,
        financingType,
        acquisitionExperience,
        acquisitionTimeline,
        proofOfFundsReviewed,
        ndaSigned,
        backgroundCheckComplete,
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
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center">
          {error}
        </div>
      )}

      {/* Grid wrapper splits sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* Section 1: Contact Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              1. Contact Profile
            </h3>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {COPY.buyers.fields.name} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Dubé"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.buyers.fields.email} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {COPY.buyers.fields.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="514-555-0199"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Investment Financials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              2. Budget & Capital
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Min Budget (CAD) *
                </label>
                <input
                  type="number"
                  value={budgetMin === 0 ? "" : budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  placeholder="e.g. 1000000"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {budgetMin > 0 ? `$${(budgetMin / 1000).toLocaleString()}k CAD` : "No minimum limit"}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Max Budget (CAD) *
                </label>
                <input
                  type="number"
                  value={budgetMax === 0 ? "" : budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  placeholder="e.g. 5000000"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
                  disabled={loading}
                />
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {budgetMax > 0 ? `$${(budgetMax / 1_000_000).toFixed(1)}M CAD` : "$0.0M"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {COPY.buyers.fields.financing}
              </label>
              <select
                value={financingType}
                onChange={(e) => setFinancingType(e.target.value as "cash" | "financed" | "mixed" | "unknown")}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                disabled={loading}
              >
                {FINANCING_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Readiness Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              3. Verification Checklist
            </h3>

            <div className="bg-muted/40 border border-border p-5 rounded-2xl space-y-4 dark:bg-zinc-900/40 dark:border-zinc-900">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={proofOfFundsReviewed}
                  onChange={(e) => setProofOfFundsReviewed(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  Proof of funds verified (Capital readiness)
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
                  NDA signed (Active corporate non-disclosure)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={backgroundCheckComplete}
                  onChange={(e) => setBackgroundCheckComplete(e.target.checked)}
                  className="h-4.5 w-4.5 bg-card border-border rounded focus:ring-0 text-amber-500 dark:bg-zinc-950 dark:border-zinc-800"
                  disabled={loading}
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  Advisor background check completed
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* Section 4: Sector Focus */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              4. Sectors of Interest *
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-2">
              {SECTORS.map((s) => {
                const checked = sectorInterest.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleToggleSector(s.value)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 select-none text-left",
                      checked 
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm dark:text-amber-400 dark:shadow-md dark:shadow-amber-500/5"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                    disabled={loading}
                  >
                    <span>{s.label}</span>
                    {checked && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Geographic Focus */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              5. Preferred Geographies *
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-2">
              {GEOGRAPHIES.map((g) => {
                const checked = geography.includes(g.value);
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleToggleGeography(g.value)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 select-none text-left",
                      checked 
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm dark:text-amber-400 dark:shadow-md dark:shadow-amber-500/5"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                    disabled={loading}
                  >
                    <span>{g.label}</span>
                    {checked && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Criteria Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              6. Timeline & Experience
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Timeline
                </label>
                <select
                  value={acquisitionTimeline}
                  onChange={(e) => setAcquisitionTimeline(e.target.value as "0_6mo" | "6_12mo" | "12_24mo" | "24mo_plus")}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {ACQUISITION_TIMELINE.map((t) => (
                    <option key={t.value} value={t.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Experience
                </label>
                <select
                  value={acquisitionExperience}
                  onChange={(e) => setAcquisitionExperience(e.target.value as "first_time" | "experienced" | "serial")}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-muted-foreground/50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-zinc-700"
                  disabled={loading}
                >
                  {ACQUISITION_EXPERIENCE.map((exp) => (
                    <option key={exp.value} value={exp.value} className="bg-card text-foreground dark:bg-zinc-950 dark:text-white">
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Notes */}
      <div className="space-y-2 max-w-4xl">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {COPY.buyers.fields.notes}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter confidential background details, notes about conversation with the buyer..."
          className="w-full h-32 px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-muted-foreground/50 transition-colors resize-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-700"
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border max-w-4xl">
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
