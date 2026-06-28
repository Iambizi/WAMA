"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SellerForm, SellerFormValues } from "@/components/sellers/seller-form";
import { ArrowLeft, Landmark } from "lucide-react";
import Link from "next/link";
import { COPY } from "@/lib/copy";

export default function NewSeller() {
  const router = useRouter();
  const createSeller = useMutation(api.sellers.create);

  const handleSubmit = async (values: SellerFormValues) => {
    await createSeller(values);
    router.push("/sellers");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          href="/sellers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sellers list</span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Landmark className="h-6 w-6 text-muted-foreground" />
            <span>{COPY.sellers.newButton}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Define owner details, transaction ranges, operational size, document checklist items, and sale reasons.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm dark:bg-zinc-900/30 dark:border-zinc-900">
        <SellerForm 
          onSubmit={handleSubmit}
          onCancel={() => router.push("/sellers")}
          submitLabel="Create Mandate"
        />
      </div>
    </div>
  );
}
