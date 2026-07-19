"use client";

import { ReactNode, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, SignIn } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.current);
  const [isSyncDelay, setIsSyncDelay] = useState(true);

  useEffect(() => {
    if (currentUser === null) {
      // If user isn't found in Convex yet, wait up to 1200ms to allow the sync mutation to complete
      const timer = setTimeout(() => {
        setIsSyncDelay(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
        <div className="text-muted-foreground animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
        <SignIn routing="hash" />
      </div>
    );
  }

  // Wait for the Convex sync query to resolve or the sync delay to complete
  if (currentUser === undefined || (currentUser === null && isSyncDelay)) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
        <div className="text-muted-foreground animate-pulse">Authorizing credentials...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    const dashboardLink = currentUser?.role === "buyer" ? "/buyer/dashboard" : "/seller/dashboard";
    return (
      <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-500 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">
            This section is restricted to the WAMA Platform administrator. If you are a buyer or seller, please visit your portal dashboard.
          </p>
          <a
            href={dashboardLink}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md active:scale-98"
          >
            Go to Portal Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
}
