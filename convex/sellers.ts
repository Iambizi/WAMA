import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { requireAdvisor } from "./activityLogs";

// Compute Document Readiness Score from the 5 boolean checklist flags
function computeReadinessScore(args: {
  financialStatementsAvailable: boolean;
  taxReturnsAvailable: boolean;
  leaseDocumentsAvailable: boolean;
  corporateDocumentsAvailable: boolean;
  ndaSigned: boolean;
}): number {
  const flags = [
    args.financialStatementsAvailable,
    args.taxReturnsAvailable,
    args.leaseDocumentsAvailable,
    args.corporateDocumentsAvailable,
    args.ndaSigned,
  ];
  const trueCount = flags.filter(Boolean).length;
  return trueCount * 20; // 5 fields * 20% = 100%
}

// List all sellers
export const list = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    await requireAdvisor(ctx);
    return await ctx.db.query("sellers").order("desc").collect();
  },
});

// Get a single seller by ID (Enforces role-based permissions)
export const get = query({
  args: { id: v.id("sellers") },
  handler: async (ctx: QueryCtx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Unauthorized");

    const seller = await ctx.db.get(args.id);
    if (!seller) return null;

    // Admin can access all profiles; Sellers can only access their own linked profile
    if (user.role !== "admin" && seller.userId !== user._id) {
      throw new Error("Forbidden: Access denied");
    }

    return seller;
  },
});

// Get the active seller profile linked to the logged-in user session
export const currentSeller = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("sellers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Create a new seller mandate (Linked to active user if self-onboarding)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    businessName: v.string(),
    sector: v.string(),
    geography: v.string(),
    revenueRange: v.union(
      v.literal("under_500k"),
      v.literal("500k_1m"),
      v.literal("1m_3m"),
      v.literal("3m_5m"),
      v.literal("5m_10m"),
      v.literal("over_10m")
    ),
    ebitdaRange: v.union(
      v.literal("under_100k"),
      v.literal("100k_250k"),
      v.literal("250k_500k"),
      v.literal("500k_1m"),
      v.literal("over_1m")
    ),
    employeeCount: v.union(
      v.literal("1_5"),
      v.literal("6_15"),
      v.literal("16_50"),
      v.literal("51_plus")
    ),
    yearsInOperation: v.number(),
    transactionType: v.union(
      v.literal("full_sale"),
      v.literal("majority"),
      v.literal("minority"),
      v.literal("succession")
    ),
    reasonForSale: v.string(),
    financialStatementsAvailable: v.boolean(),
    taxReturnsAvailable: v.boolean(),
    leaseDocumentsAvailable: v.boolean(),
    corporateDocumentsAvailable: v.boolean(),
    ndaSigned: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      name: string;
      email: string;
      phone?: string;
      businessName: string;
      sector: string;
      geography: string;
      revenueRange: "under_500k" | "500k_1m" | "1m_3m" | "3m_5m" | "5m_10m" | "over_10m";
      ebitdaRange: "under_100k" | "100k_250k" | "250k_500k" | "500k_1m" | "over_1m";
      employeeCount: "1_5" | "6_15" | "16_50" | "51_plus";
      yearsInOperation: number;
      transactionType: "full_sale" | "majority" | "minority" | "succession";
      reasonForSale: string;
      financialStatementsAvailable: boolean;
      taxReturnsAvailable: boolean;
      leaseDocumentsAvailable: boolean;
      corporateDocumentsAvailable: boolean;
      ndaSigned: boolean;
      notes?: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Unauthorized");

    const isAdmin = user.role === "admin";
    const userIdToLink = isAdmin ? undefined : user._id;

    const now = Date.now();
    const readinessScore = computeReadinessScore(args);

    const id = await ctx.db.insert("sellers", {
      ...args,
      userId: userIdToLink,
      qualificationStatus: "pending",
      readinessScore,
      createdAt: now,
      updatedAt: now,
    });

    // If a self-onboarding seller, update their registration role and status in users collection
    if (!isAdmin) {
      await ctx.db.patch(user._id, {
        role: "seller",
        onboardingIntent: "seller",
        onboardingStatus: "submitted",
        updatedAt: now,
      });
    }

    // Log the creation activity
    await ctx.db.insert("activityLogs", {
      action: "seller_created",
      entityType: "seller",
      entityId: id,
      entityLabel: args.businessName,
      details: isAdmin ? `Manually entered by Advisor (Readiness: ${readinessScore}%)` : `Submitted via self-onboarding portal (Readiness: ${readinessScore}%)`,
      createdAt: now,
    });

    return id;
  },
});

// Update a seller mandate
export const update = mutation({
  args: {
    id: v.id("sellers"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    businessName: v.string(),
    sector: v.string(),
    geography: v.string(),
    revenueRange: v.union(
      v.literal("under_500k"),
      v.literal("500k_1m"),
      v.literal("1m_3m"),
      v.literal("3m_5m"),
      v.literal("5m_10m"),
      v.literal("over_10m")
    ),
    ebitdaRange: v.union(
      v.literal("under_100k"),
      v.literal("100k_250k"),
      v.literal("250k_500k"),
      v.literal("500k_1m"),
      v.literal("over_1m")
    ),
    employeeCount: v.union(
      v.literal("1_5"),
      v.literal("6_15"),
      v.literal("16_50"),
      v.literal("51_plus")
    ),
    yearsInOperation: v.number(),
    transactionType: v.union(
      v.literal("full_sale"),
      v.literal("majority"),
      v.literal("minority"),
      v.literal("succession")
    ),
    reasonForSale: v.string(),
    financialStatementsAvailable: v.boolean(),
    taxReturnsAvailable: v.boolean(),
    leaseDocumentsAvailable: v.boolean(),
    corporateDocumentsAvailable: v.boolean(),
    ndaSigned: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      id: string & { __tableName: "sellers" };
      name: string;
      email: string;
      phone?: string;
      businessName: string;
      sector: string;
      geography: string;
      revenueRange: "under_500k" | "500k_1m" | "1m_3m" | "3m_5m" | "5m_10m" | "over_10m";
      ebitdaRange: "under_100k" | "100k_250k" | "250k_500k" | "500k_1m" | "over_1m";
      employeeCount: "1_5" | "6_15" | "16_50" | "51_plus";
      yearsInOperation: number;
      transactionType: "full_sale" | "majority" | "minority" | "succession";
      reasonForSale: string;
      financialStatementsAvailable: boolean;
      taxReturnsAvailable: boolean;
      leaseDocumentsAvailable: boolean;
      corporateDocumentsAvailable: boolean;
      ndaSigned: boolean;
      notes?: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Unauthorized");

    const { id, ...fields } = args;
    const now = Date.now();

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Seller mandate not found");
    }

    const isAdmin = user.role === "admin";
    if (!isAdmin && existing.userId !== user._id) {
      throw new Error("Forbidden: Access denied");
    }

    const readinessScore = computeReadinessScore(fields);

    await ctx.db.patch(id, {
      ...fields,
      readinessScore,
      updatedAt: now,
    });

    // Log the update activity
    await ctx.db.insert("activityLogs", {
      action: "seller_updated",
      entityType: "seller",
      entityId: id,
      entityLabel: fields.businessName,
      details: isAdmin ? `Updated profile by advisor (Readiness: ${readinessScore}%)` : `Updated profile by seller (Readiness: ${readinessScore}%)`,
      createdAt: now,
    });

    return id;
  },
});

// Update qualification status of a seller mandate
export const updateStatus = mutation({
  args: {
    id: v.id("sellers"),
    status: v.union(
      v.literal("pending"),
      v.literal("qualified"),
      v.literal("disqualified")
    ),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      id: string & { __tableName: "sellers" };
      status: "pending" | "qualified" | "disqualified";
    }
  ) => {
    await requireAdvisor(ctx);
    const now = Date.now();

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Seller mandate not found");
    }

    if (existing.qualificationStatus === args.status) {
      return args.id;
    }

    await ctx.db.patch(args.id, {
      qualificationStatus: args.status,
      updatedAt: now,
    });

    // Log status change activity
    await ctx.db.insert("activityLogs", {
      action: "seller_status_changed",
      entityType: "seller",
      entityId: args.id,
      entityLabel: existing.businessName,
      details: `Status: ${existing.qualificationStatus} → ${args.status}`,
      createdAt: now,
    });

    return args.id;
  },
});
