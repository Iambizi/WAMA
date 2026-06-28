"use client";

import { ReactNode, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSyncProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.sync);

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses[0]?.emailAddress;
      const name = user.fullName || user.username || "";
      if (email) {
        syncUser({ email, name }).catch((err) => {
          console.error("Error syncing user to Convex database:", err);
        });
      }
    }
  }, [isLoaded, user, syncUser]);

  return <>{children}</>;
}
