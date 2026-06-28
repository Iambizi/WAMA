"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, SignIn, UserButton } from "@clerk/nextjs";
import { useTheme } from "@/components/providers/theme-provider";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.current);
  const { theme, toggleTheme } = useTheme();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
        <div className="text-muted-foreground animate-pulse text-sm">Loading portal...</div>
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

  // Wait for the Convex sync query to resolve
  if (currentUser === undefined) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
        <div className="text-muted-foreground animate-pulse text-sm">Authorizing credentials...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen flex-col bg-background text-foreground font-sans">
      {/* Portal Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold text-lg shadow-md">
              W
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">WAMA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-2 px-2 py-0.5 rounded-full border border-border bg-muted/40">Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted/50 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
