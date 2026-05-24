import { query, QueryCtx } from "./_generated/server";
import { requireAdvisor } from "./activityLogs";

// Query to calculate unified statistics for the advisor dashboard
export const getStats = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    await requireAdvisor(ctx);

    const buyers = await ctx.db.query("buyers").collect();
    const sellers = await ctx.db.query("sellers").collect();
    const matches = await ctx.db.query("matches").collect();

    const pendingBuyers = buyers.filter(b => b.qualificationStatus === "pending").length;
    const pendingSellers = sellers.filter(s => s.qualificationStatus === "pending").length;

    // Filter active matches (excluding rejected and closed_lost)
    const activeMatchesCount = matches.filter(
      (m) => m.status !== "rejected" && m.status !== "closed_lost"
    ).length;

    return {
      totalBuyersCount: buyers.length,
      totalSellersCount: sellers.length,
      pendingReviewsCount: pendingBuyers + pendingSellers,
      activeMatchesCount: activeMatchesCount,
    };
  },
});
