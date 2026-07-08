import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdvisor } from "./activityLogs";

// List all buyers
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdvisor(ctx);
    return await ctx.db.query("buyers").order("desc").collect();
  },
});

// Get a single buyer by ID (Enforces role-based permissions)
export const get = query({
  args: { id: v.id("buyers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Unauthorized");

    const buyer = await ctx.db.get(args.id);
    if (!buyer) return null;

    // Admin can access all profiles; Buyers can only access their own linked profile
    if (user.role !== "admin" && buyer.userId !== user._id) {
      throw new Error("Forbidden: Access denied");
    }

    return buyer;
  },
});

// Get the active buyer profile linked to the logged-in user session
export const currentBuyer = query({
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
      .query("buyers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Create a new buyer (Linked to active user if self-onboarding)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    sectorInterest: v.array(v.string()),
    budgetMin: v.number(),
    budgetMax: v.number(),
    geography: v.array(v.string()),
    financingType: v.union(
      v.literal("cash"),
      v.literal("financed"),
      v.literal("mixed"),
      v.literal("vtb"),
      v.literal("mezzanine"),
      v.literal("equity_partner"),
      v.literal("unknown")
    ),
    acquisitionExperience: v.union(
      v.literal("first_time"),
      v.literal("experienced"),
      v.literal("serial")
    ),
    acquisitionTimeline: v.union(
      v.literal("0_6mo"),
      v.literal("6_12mo"),
      v.literal("12_24mo"),
      v.literal("24mo_plus")
    ),
    experienceDetail: v.optional(v.string()),
    downPaymentAmount: v.optional(v.number()),
    sourceOfFunds: v.optional(v.string()),
    targetBusinessValue: v.optional(v.number()),
    minEbitda: v.optional(v.number()),
    minEmployees: v.optional(v.number()),
    minTimeInBusiness: v.optional(v.number()),
    clientConcentration: v.optional(v.string()),
    proofOfFundsReviewed: v.boolean(),
    ndaSigned: v.boolean(),
    backgroundCheckComplete: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    
    const id = await ctx.db.insert("buyers", {
      ...args,
      userId: userIdToLink,
      qualificationStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // If a self-onboarding buyer, update their registration role and status in users collection
    if (!isAdmin) {
      await ctx.db.patch(user._id, {
        role: "buyer",
        onboardingIntent: "buyer",
        onboardingStatus: "submitted",
        updatedAt: now,
      });
    }

    // Log the creation
    await ctx.db.insert("activityLogs", {
      action: "buyer_created",
      entityType: "buyer",
      entityId: id,
      entityLabel: args.name,
      details: isAdmin ? `Manually entered by Advisor` : `Submitted via self-onboarding portal`,
      createdAt: now,
    });

    return id;
  },
});

// Update a buyer
export const update = mutation({
  args: {
    id: v.id("buyers"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    sectorInterest: v.array(v.string()),
    budgetMin: v.number(),
    budgetMax: v.number(),
    geography: v.array(v.string()),
    financingType: v.union(
      v.literal("cash"),
      v.literal("financed"),
      v.literal("mixed"),
      v.literal("vtb"),
      v.literal("mezzanine"),
      v.literal("equity_partner"),
      v.literal("unknown")
    ),
    acquisitionExperience: v.union(
      v.literal("first_time"),
      v.literal("experienced"),
      v.literal("serial")
    ),
    acquisitionTimeline: v.union(
      v.literal("0_6mo"),
      v.literal("6_12mo"),
      v.literal("12_24mo"),
      v.literal("24mo_plus")
    ),
    experienceDetail: v.optional(v.string()),
    downPaymentAmount: v.optional(v.number()),
    sourceOfFunds: v.optional(v.string()),
    targetBusinessValue: v.optional(v.number()),
    minEbitda: v.optional(v.number()),
    minEmployees: v.optional(v.number()),
    minTimeInBusiness: v.optional(v.number()),
    clientConcentration: v.optional(v.string()),
    proofOfFundsReviewed: v.boolean(),
    ndaSigned: v.boolean(),
    backgroundCheckComplete: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      throw new Error("Buyer not found");
    }

    const isAdmin = user.role === "admin";
    if (!isAdmin && existing.userId !== user._id) {
      throw new Error("Forbidden: Access denied");
    }

    await ctx.db.patch(id, {
      ...fields,
      updatedAt: now,
    });

    // Log the update
    await ctx.db.insert("activityLogs", {
      action: "buyer_updated",
      entityType: "buyer",
      entityId: id,
      entityLabel: args.name,
      details: isAdmin ? "Profile fields updated by advisor" : "Profile fields updated by buyer user",
      createdAt: now,
    });

    return id;
  },
});

// Update qualification status of a buyer
export const updateStatus = mutation({
  args: {
    id: v.id("buyers"),
    status: v.union(
      v.literal("pending"),
      v.literal("qualified"),
      v.literal("disqualified")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdvisor(ctx);
    const now = Date.now();

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Buyer not found");
    }

    if (existing.qualificationStatus === args.status) {
      return args.id;
    }

    await ctx.db.patch(args.id, {
      qualificationStatus: args.status,
      updatedAt: now,
    });

    // Log status change
    await ctx.db.insert("activityLogs", {
      action: "buyer_status_changed",
      entityType: "buyer",
      entityId: args.id,
      entityLabel: existing.name,
      details: `Status: ${existing.qualificationStatus} → ${args.status}`,
      createdAt: now,
    });

    return args.id;
  },
});
