import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

interface BuyerStatusBadgeProps {
  status: "pending" | "qualified" | "disqualified";
  className?: string;
}

export function BuyerStatusBadge({ status, className }: BuyerStatusBadgeProps) {
  const styles = {
    pending: "bg-zinc-900 text-zinc-400 border-zinc-800 shadow-zinc-950/20",
    qualified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
    disqualified: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5",
  };

  const dots = {
    pending: "bg-zinc-500 shadow-zinc-500/50",
    qualified: "bg-emerald-400 shadow-emerald-400/50 animate-pulse",
    disqualified: "bg-rose-500 shadow-rose-500/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm select-none",
        styles[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shadow", dots[status])} />
      <span>{COPY.buyers.statusLabels[status]}</span>
    </span>
  );
}
