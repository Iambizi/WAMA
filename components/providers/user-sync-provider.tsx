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
      syncUser({}).catch(() => {
        console.error("Unable to synchronize the authenticated account.");
      });
    }
  }, [isLoaded, user, syncUser]);

  return <>{children}</>;
}
