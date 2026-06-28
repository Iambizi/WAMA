import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";

// Helper to enforce auth
export async function requireAdvisor(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: Identity context missing");
  }

  // Check if user is registered in the database and has the "admin" role
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (user && user.role === "admin") {
    return identity;
  }

  // Direct environment allowlist check as a fallback (helpful for first login before syncing)
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = identity.email?.toLowerCase() || "";
  if (adminEmails.includes(userEmail)) {
    return identity;
  }

  throw new Error("Forbidden: Admin privileges required");
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
