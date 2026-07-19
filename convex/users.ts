import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getUserForIdentity,
  isTrustedAdminIdentity,
  requireAdvisor,
  requireIdentity,
  trustedAdminClerkIds,
} from "./authz";
import { assertCanSelectIntent } from "./onboarding";

// Get the active logged-in user matching Clerk identity
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getUserForIdentity(ctx, identity);
    if (!user) return null;
    return {
      role: user.role,
      onboardingIntent: user.onboardingIntent,
      onboardingStatus: user.onboardingStatus,
      name: user.name,
    };
  },
});

// Sync Clerk session user with Convex database and assign initial roles
export const sync = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const trustedEmail = identity.email?.trim().toLowerCase();
    if (!trustedEmail) throw new Error("Authenticated email claim is required");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();

    const isAdmin = isTrustedAdminIdentity(identity);
    const trustedName = identity.name?.trim() || undefined;

    if (existing) {
      // A stale database admin role is removed unless the current signed identity
      // is still trusted by the configured authority.
      const targetRole = isAdmin
        ? "admin"
        : existing.role === "admin"
          ? "unassigned"
          : existing.role;
      
      await ctx.db.patch(existing._id, {
        email: trustedEmail,
        name: trustedName,
        role: targetRole,
        updatedAt: now,
      });
      return existing._id;
    }

    // New user signup
    const initialRole = isAdmin ? "admin" : "unassigned";

    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: trustedEmail,
      name: trustedName,
      role: initialRole,
      onboardingIntent: null,
      onboardingStatus: "not_started",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Read-only security inventory. Profiles without owners may be legitimate
// advisor-created records, so they are reported but never changed automatically.
export const auditSecurityState = query({
  args: {},
  handler: async (ctx) => {
    await requireAdvisor(ctx);
    const [users, buyers, sellers] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("buyers").collect(),
      ctx.db.query("sellers").collect(),
    ]);
    const trustedSubjects = new Set(trustedAdminClerkIds());
    const buyerCounts = new Map<string, number>();
    const sellerCounts = new Map<string, number>();
    for (const buyer of buyers) {
      if (buyer.userId) buyerCounts.set(buyer.userId, (buyerCounts.get(buyer.userId) ?? 0) + 1);
    }
    for (const seller of sellers) {
      if (seller.userId) sellerCounts.set(seller.userId, (sellerCounts.get(seller.userId) ?? 0) + 1);
    }

    return {
      generatedAt: Date.now(),
      adminAuthorityConfigured: trustedSubjects.size > 0,
      adminUsers: users
        .filter((user) => user.role === "admin")
        .map((user) => ({
          userId: user._id,
          clerkId: user.clerkId,
          trustedBySubject: trustedSubjects.has(user.clerkId),
        })),
      conflictingProfiles: users
        .filter((user) => buyerCounts.has(user._id) && sellerCounts.has(user._id))
        .map((user) => ({ userId: user._id, clerkId: user.clerkId })),
      duplicateBuyerProfiles: [...buyerCounts.entries()]
        .filter(([, count]) => count > 1)
        .map(([userId, count]) => ({ userId, count })),
      duplicateSellerProfiles: [...sellerCounts.entries()]
        .filter(([, count]) => count > 1)
        .map(([userId, count]) => ({ userId, count })),
      buyersWithoutOwners: buyers.filter((buyer) => !buyer.userId).map((buyer) => buyer._id),
      sellersWithoutOwners: sellers.filter((seller) => !seller.userId).map((seller) => seller._id),
    };
  },
});

export const remediateInvalidAdminRoles = mutation({
  args: { confirmation: v.literal("DOWNGRADE_UNTRUSTED_ADMINS") },
  handler: async (ctx) => {
    const { identity, user: actor } = await requireAdvisor(ctx);
    const trustedSubjects = new Set(trustedAdminClerkIds());
    if (trustedSubjects.size === 0) {
      throw new Error("ADMIN_CLERK_IDS must be configured before remediation");
    }
    const admins = (await ctx.db.query("users").collect()).filter((user) => user.role === "admin");
    const downgraded: string[] = [];
    for (const user of admins) {
      if (!trustedSubjects.has(user.clerkId)) {
        await ctx.db.patch(user._id, { role: "unassigned", updatedAt: Date.now() });
        await ctx.db.insert("activityLogs", {
          action: "untrusted_admin_downgraded",
          entityType: "user",
          entityId: user._id,
          entityLabel: "User account",
          details: "Stored administrator role removed by explicit remediation",
          actorClerkId: identity.subject,
          actorUserId: actor._id,
          actorRole: "admin",
          outcome: "success",
          source: "migration",
          createdAt: Date.now(),
        });
        downgraded.push(user._id);
      }
    }
    return { downgraded };
  },
});

// Update the user onboarding intent and status
export const updateIntent = mutation({
  args: {
    intent: v.union(v.literal("buyer"), v.literal("seller")),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("submitted")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserForIdentity(ctx, identity);
    if (!user) throw new Error("User record not found");
    assertCanSelectIntent(user, args.intent);
    if (args.status === "submitted") {
      throw new Error("Only profile creation can submit onboarding");
    }
    if (args.status === "not_started" && user.onboardingStatus === "in_progress") {
      throw new Error("Onboarding cannot move backwards");
    }

    await ctx.db.patch(user._id, {
      onboardingIntent: args.intent,
      onboardingStatus: args.status,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
