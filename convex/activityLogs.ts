import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";

// Helper to enforce auth
export async function requireAdvisor(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

// Query to list the latest 20 activity logs for the dashboard
export const list = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    await requireAdvisor(ctx);
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_created_at")
      .order("desc")
      .take(20);
  },
});

// Mutation to create an activity log
export const create = mutation({
  args: {
    action: v.string(),
    entityType: v.union(
      v.literal("buyer"),
      v.literal("seller"),
      v.literal("match")
    ),
    entityId: v.string(),
    entityLabel: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      action: string;
      entityType: "buyer" | "seller" | "match";
      entityId: string;
      entityLabel: string;
      details?: string;
    }
  ) => {
    await requireAdvisor(ctx);
    const now = Date.now();
    return await ctx.db.insert("activityLogs", {
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      entityLabel: args.entityLabel,
      details: args.details,
      createdAt: now,
    });
  },
});
