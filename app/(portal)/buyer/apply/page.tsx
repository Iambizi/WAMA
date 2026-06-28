"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BuyerForm, BuyerFormValues } from "@/components/buyers/buyer-form";
import { Users } from "lucide-react";

export default function BuyerApply() {
  const router = useRouter();
  const createBuyer = useMutation(api.buyers.create);
  const updateIntent = useMutation(api.users.updateIntent);
  const currentBuyerProfile = useQuery(api.buyers.currentBuyer);

  // Set onboarding intent to "buyer" and status to "in_progress" upon mounting
  useEffect(() => {
    updateIntent({ intent: "buyer", status: "in_progress" }).catch(console.error);
  }, [updateIntent]);

  // If the user already has a buyer profile, redirect them directly to the dashboard
  useEffect(() => {
    if (currentBuyerProfile) {
      router.push("/buyer/dashboard");
    }
  }, [currentBuyerProfile, router]);

  const handleSubmit = async (values: BuyerFormValues) => {
    try {
      await createBuyer(values);
      router.push("/buyer/dashboard");
    } catch (error) {
      console.error("Failed to submit buyer application:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Buyer Onboarding Application
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit your acquisition criteria, target sector flags, and financing details to apply for verified status.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-md dark:bg-zinc-900/10 backdrop-blur-sm">
        <BuyerForm 
          onSubmit={handleSubmit}
          onCancel={() => router.push("/")}
          submitLabel="Submit Application"
        />
      </div>
    </div>
  );
}
