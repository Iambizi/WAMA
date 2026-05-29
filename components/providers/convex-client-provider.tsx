"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth, Show, SignIn } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/sidebar";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder-build-url.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Show
          when="signed-in"
          fallback={
            <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
              <SignIn routing="hash" />
            </div>
          }
        >
          <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background p-8 lg:p-12">
              {children}
            </main>
          </div>
        </Show>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
