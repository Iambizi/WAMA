"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { UserSyncProvider } from "./user-sync-provider";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder-build-url.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserSyncProvider>
          {children}
        </UserSyncProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
