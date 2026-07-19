import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { requireAdvisor } from "./authz";
import { optionalText, requiredText } from "./securityValidation";

export { requireAdvisor } from "./authz";

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
      v.literal("match"),
      v.literal("user"),
      v.literal("ai"),
      v.literal("privacy")
    ),
    entityId: v.string(),
    entityLabel: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      action: string;
      entityType: "buyer" | "seller" | "match" | "user" | "ai" | "privacy";
      entityId: string;
      entityLabel: string;
      details?: string;
    }
  ) => {
    const { identity, user } = await requireAdvisor(ctx);
    const now = Date.now();
    return await ctx.db.insert("activityLogs", {
      action: requiredText(args.action, "Action", 80),
      entityType: args.entityType,
      entityId: args.entityId,
      entityLabel: `${args.entityType} record`,
      details: optionalText(args.details, "Log details", 500),
      actorClerkId: identity.subject,
      actorUserId: user._id,
      actorRole: "admin",
      outcome: "success",
      source: "ui",
      createdAt: now,
    });
  },
});
