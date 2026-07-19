import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdvisor, requireUser } from "./authz";
import { optionalText } from "./securityValidation";

export const submit = mutation({
  args: {
    requestType: v.union(v.literal("export"), v.literal("correction"), v.literal("deletion")),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await requireUser(ctx);
    const now = Date.now();
    const existing = await ctx.db.query("privacyRequests").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    if (existing.some((request) => request.requestType === args.requestType && (request.status === "submitted" || request.status === "in_review"))) {
      throw new Error("A request of this type is already pending");
    }
    if (args.requestType === "deletion") await ctx.db.patch(user._id, { deletionRequestedAt: now, updatedAt: now });
    const requestId = await ctx.db.insert("privacyRequests", {
      userId: user._id,
      requestType: args.requestType,
      details: optionalText(args.details, "Request details", 2_000),
      status: "submitted",
      externalDeletionStatus: args.requestType === "deletion" ? "pending" : "not_required",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      action: `privacy_${args.requestType}_requested`,
      entityType: "privacy",
      entityId: requestId,
      entityLabel: "Privacy request",
      details: "Privacy workflow request submitted",
      actorClerkId: identity.subject,
      actorUserId: user._id,
      actorRole: user.role,
      outcome: "success",
      source: "ui",
      createdAt: now,
    });
    return requestId;
  },
});

export const listForAdvisor = query({
  args: {},
  handler: async (ctx) => {
    await requireAdvisor(ctx);
    return (await ctx.db.query("privacyRequests").collect()).map((request) => ({
      requestId: request._id,
      userId: request.userId,
      requestType: request.requestType,
      status: request.status,
      externalDeletionStatus: request.externalDeletionStatus,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));
  },
});
