"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BuyerForm, BuyerFormValues } from "@/components/buyers/buyer-form";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { COPY } from "@/lib/copy";

export default function NewBuyer() {
  const router = useRouter();
  const createBuyer = useMutation(api.buyers.create);

  const handleSubmit = async (values: BuyerFormValues) => {
    // values will have the complete fields expected by convex/buyers.ts create mutation
    await createBuyer(values);
    router.push("/buyers");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          href="/buyers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to buyers list</span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-muted-foreground" />
            <span>{COPY.buyers.newButton}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Define contact details, CAD budget thresholds, sector tags, and advisor checklist states.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm dark:bg-zinc-900/30 dark:border-zinc-900">
        <BuyerForm 
          onSubmit={handleSubmit}
          onCancel={() => router.push("/buyers")}
          submitLabel="Create Profile"
        />
      </div>
    </div>
  );
}
