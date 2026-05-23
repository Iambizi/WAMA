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

// Get a single buyer by ID
export const get = query({
  args: { id: v.id("buyers") },
  handler: async (ctx, args) => {
    await requireAdvisor(ctx);
    return await ctx.db.get(args.id);
  },
});

// Create a new buyer
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
    proofOfFundsReviewed: v.boolean(),
    ndaSigned: v.boolean(),
    backgroundCheckComplete: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdvisor(ctx);
    const now = Date.now();
    
    const id = await ctx.db.insert("buyers", {
      ...args,
      qualificationStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Log the creation
    await ctx.db.insert("activityLogs", {
      action: "buyer_created",
      entityType: "buyer",
      entityId: id,
      entityLabel: args.name,
      details: `Budget: $${(args.budgetMin / 1_000_000).toFixed(1)}M - $${(args.budgetMax / 1_000_000).toFixed(1)}M CAD`,
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
    proofOfFundsReviewed: v.boolean(),
    ndaSigned: v.boolean(),
    backgroundCheckComplete: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdvisor(ctx);
    const { id, ...fields } = args;
    const now = Date.now();

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Buyer not found");
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
      details: "Profile fields updated by advisor",
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
