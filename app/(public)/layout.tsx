import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground font-sans">{children}</div>;
}
