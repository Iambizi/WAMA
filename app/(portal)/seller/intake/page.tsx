"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SellerForm, SellerFormValues } from "@/components/sellers/seller-form";
import { Landmark } from "lucide-react";

export default function SellerIntake() {
  const router = useRouter();
  const createSeller = useMutation(api.sellers.createSelf);
  const updateIntent = useMutation(api.users.updateIntent);
  const currentSellerProfile = useQuery(api.sellers.currentSeller);

  // Set onboarding intent to "seller" and status to "in_progress" upon mounting
  useEffect(() => {
    updateIntent({ intent: "seller", status: "in_progress" }).catch(console.error);
  }, [updateIntent]);

  // If the user already has a seller profile, redirect them directly to the dashboard
  useEffect(() => {
    if (currentSellerProfile) {
      router.push("/seller/dashboard");
    }
  }, [currentSellerProfile, router]);

  const handleSubmit = async (values: SellerFormValues) => {
    try {
      const {
        dealDiscoveryMeeting: _dealDiscovery, dealNdaSigned: _dealNda,
        dealDocumentsReceived: _dealDocs, dealPreliminaryAnalysisDone: _analysis,
        dealMandateProposal: _proposal, dealProposalSigned: _signed,
        dealDocumentationReady: _ready, docFinancialsCpa: _cpa,
        docFinancialsInterim: _interim, docAccountsReceivable: _ar,
        docAccountsPayable: _ap, docEmployeeOrgChart: _org,
        docExecutiveSalaries: _salaries, notes: _notes, ...selfFields
      } = values;
      void _dealDiscovery; void _dealNda; void _dealDocs; void _analysis;
      void _proposal; void _signed; void _ready; void _cpa; void _interim;
      void _ar; void _ap; void _org; void _salaries; void _notes;
      await createSeller(selfFields);
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Failed to submit seller profile:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Business Exit Readiness Intake
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit your business profile details, financial snapshot, and motivation parameters to start review.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-md dark:bg-zinc-900/10 backdrop-blur-sm">
        <SellerForm 
          onSubmit={handleSubmit}
          onCancel={() => router.push("/")}
          submitLabel="Submit Intake"
          selfService
        />
      </div>
    </div>
  );
}
