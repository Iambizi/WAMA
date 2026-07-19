import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdvisor } from "./authz";

function positiveEnvInt(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const reserveRequest = mutation({
  args: {
    requestId: v.string(),
    fingerprint: v.string(),
    sellerId: v.id("sellers"),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireAdvisor(ctx);
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1_000;
    const dayAgo = now - 24 * 60 * 60 * 1_000;
    const hourlyLimit = positiveEnvInt("AI_HOURLY_REQUEST_LIMIT", 5);
    const dailyLimit = positiveEnvInt("AI_DAILY_REQUEST_LIMIT", 20);
    const globalConcurrency = positiveEnvInt("AI_GLOBAL_CONCURRENCY_LIMIT", 2);

    const actorRequests = await ctx.db.query("aiRequests").withIndex("by_actor", (q) => q.eq("actorUserId", user._id)).collect();
    if (actorRequests.filter((request) => request.createdAt >= hourAgo).length >= hourlyLimit) {
      throw new Error("AI request rate limit exceeded");
    }
    if (actorRequests.filter((request) => request.createdAt >= dayAgo).length >= dailyLimit) {
      throw new Error("AI daily request budget exceeded");
    }
    const duplicate = await ctx.db.query("aiRequests").withIndex("by_fingerprint", (q) => q.eq("fingerprint", args.fingerprint)).collect();
    if (duplicate.some((request) => request.createdAt >= now - 10 * 60 * 1_000 && request.status !== "failed")) {
      throw new Error("An identical AI request was recently processed");
    }
    const sellerRequests = await ctx.db.query("aiRequests").withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId)).collect();
    if (sellerRequests.some((request) => request.status === "running" && request.expiresAt > now)) {
      throw new Error("Matching is already running for this seller");
    }
    const allRequests = await ctx.db.query("aiRequests").collect();
    if (allRequests.filter((request) => request.status === "running" && request.expiresAt > now).length >= globalConcurrency) {
      throw new Error("AI matching capacity is temporarily full");
    }

    const id = await ctx.db.insert("aiRequests", {
      ...args,
      actorUserId: user._id,
      status: "running",
      createdAt: now,
      updatedAt: now,
      expiresAt: now + 2 * 60 * 1_000,
    });
    await ctx.db.insert("activityLogs", {
      action: "ai_match_requested", entityType: "seller", entityId: args.sellerId,
      entityLabel: "Seller profile", details: "AI matching request reserved",
      actorClerkId: identity.subject, actorUserId: user._id, actorRole: "admin",
      outcome: "success", source: "api", correlationId: args.requestId, createdAt: now,
    });
    return id;
  },
});

export const finishRequest = mutation({
  args: {
    requestId: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    candidateCount: v.optional(v.number()),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdvisor(ctx);
    const request = await ctx.db.query("aiRequests").withIndex("by_request_id", (q) => q.eq("requestId", args.requestId)).unique();
    if (!request) throw new Error("AI request reservation not found");
    await ctx.db.patch(request._id, {
      status: args.status,
      candidateCount: args.candidateCount,
      provider: args.provider,
      model: args.model,
      updatedAt: Date.now(),
      expiresAt: Date.now(),
    });
  },
});
