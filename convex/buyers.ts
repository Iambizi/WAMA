import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdvisor } from "./activityLogs";
import { requireUser } from "./authz";
import { assertCanCreateSelfProfile, assertCanEditSelfProfile } from "./onboarding";
import {
  ALLOWED_GEOGRAPHIES,
  ALLOWED_SECTORS,
  finiteNumber,
  optionalFiniteNumber,
  optionalText,
  requiredText,
  uniqueTextArray,
  validEmail,
  validPhone,
} from "./securityValidation";

const buyerSelfArgs = {
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  sectorInterest: v.array(v.string()),
  budgetMin: v.number(),
  budgetMax: v.number(),
  geography: v.array(v.string()),
  financingType: v.union(v.literal("cash"), v.literal("financed"), v.literal("mixed"), v.literal("vtb"), v.literal("mezzanine"), v.literal("equity_partner"), v.literal("unknown")),
  acquisitionExperience: v.union(v.literal("first_time"), v.literal("experienced"), v.literal("serial")),
  acquisitionTimeline: v.union(v.literal("0_6mo"), v.literal("6_12mo"), v.literal("12_24mo"), v.literal("24mo_plus")),
  experienceDetail: v.optional(v.string()),
  downPaymentAmount: v.optional(v.number()),
  sourceOfFunds: v.optional(v.string()),
  targetBusinessValue: v.optional(v.number()),
  minEbitda: v.optional(v.number()),
  minEmployees: v.optional(v.number()),
  minTimeInBusiness: v.optional(v.number()),
  clientConcentration: v.optional(v.string()),
};

type BuyerSelfInput = {
  name: string; email: string; phone?: string; sectorInterest: string[];
  budgetMin: number; budgetMax: number; geography: string[];
  financingType: "cash" | "financed" | "mixed" | "vtb" | "mezzanine" | "equity_partner" | "unknown";
  acquisitionExperience: "first_time" | "experienced" | "serial";
  acquisitionTimeline: "0_6mo" | "6_12mo" | "12_24mo" | "24mo_plus";
  experienceDetail?: string; downPaymentAmount?: number; sourceOfFunds?: string;
  targetBusinessValue?: number; minEbitda?: number; minEmployees?: number;
  minTimeInBusiness?: number; clientConcentration?: string;
};

function validateBuyerInput(args: BuyerSelfInput): BuyerSelfInput {
  const budgetMin = finiteNumber(args.budgetMin, "Minimum budget", 0, 1_000_000_000);
  const budgetMax = finiteNumber(args.budgetMax, "Maximum budget", 1, 1_000_000_000);
  if (budgetMax <= budgetMin) throw new Error("Maximum budget must exceed minimum budget");
  return {
    ...args,
    name: requiredText(args.name, "Name", 120),
    email: validEmail(args.email),
    phone: validPhone(args.phone),
    sectorInterest: uniqueTextArray(args.sectorInterest, "Sector interests", ALLOWED_SECTORS),
    geography: uniqueTextArray(args.geography, "Geographies", ALLOWED_GEOGRAPHIES),
    budgetMin,
    budgetMax,
    experienceDetail: optionalText(args.experienceDetail, "Experience detail", 1_000),
    sourceOfFunds: optionalText(args.sourceOfFunds, "Source of funds", 300),
    clientConcentration: optionalText(args.clientConcentration, "Client concentration", 300),
    downPaymentAmount: optionalFiniteNumber(args.downPaymentAmount, "Down payment", 0, 1_000_000_000),
    targetBusinessValue: optionalFiniteNumber(args.targetBusinessValue, "Target value", 0, 1_000_000_000),
    minEbitda: optionalFiniteNumber(args.minEbitda, "Minimum EBITDA", 0, 1_000_000_000),
    minEmployees: optionalFiniteNumber(args.minEmployees, "Minimum employees", 0, 1_000_000),
    minTimeInBusiness: optionalFiniteNumber(args.minTimeInBusiness, "Minimum time in business", 0, 500),
  };
}

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
    await requireAdvisor(ctx);
    return await ctx.db.get(args.id);
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

    const buyer = await ctx.db
      .query("buyers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
    if (!buyer || user.role !== "buyer") return null;
    return {
      qualificationStatus: buyer.qualificationStatus,
      sectorInterest: buyer.sectorInterest,
      budgetMin: buyer.budgetMin,
      budgetMax: buyer.budgetMax,
      geography: buyer.geography,
      financingType: buyer.financingType,
      acquisitionTimeline: buyer.acquisitionTimeline,
    };
  },
});

export const createSelf = mutation({
  args: buyerSelfArgs,
  handler: async (ctx, args: BuyerSelfInput) => {
    const { identity, user } = await requireUser(ctx);
    assertCanCreateSelfProfile(user, "buyer");
    const existing = await ctx.db
      .query("buyers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    if (existing.length > 0) throw new Error("Buyer profile already exists");
    const fields = validateBuyerInput(args);
    const now = Date.now();
    const id = await ctx.db.insert("buyers", {
      ...fields,
      userId: user._id,
      proofOfFundsReviewed: false,
      ndaSigned: false,
      backgroundCheckComplete: false,
      qualificationStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(user._id, {
      role: "buyer",
      onboardingStatus: "submitted",
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      action: "buyer_submitted",
      entityType: "buyer",
      entityId: id,
      entityLabel: "Buyer profile",
      details: "Self-service onboarding submitted",
      actorClerkId: identity.subject,
      actorUserId: user._id,
      actorRole: "buyer",
      outcome: "success",
      source: "ui",
      createdAt: now,
    });
    return id;
  },
});

export const updateSelf = mutation({
  args: { id: v.id("buyers"), ...buyerSelfArgs },
  handler: async (ctx, args: BuyerSelfInput & { id: string & { __tableName: "buyers" } }) => {
    const { user } = await requireUser(ctx);
    assertCanEditSelfProfile(user, "buyer");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) throw new Error("Forbidden");
    const { id, ...input } = args;
    await ctx.db.patch(id, { ...validateBuyerInput(input), updatedAt: Date.now() });
    return id;
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
    const { identity, user } = await requireAdvisor(ctx);

    const now = Date.now();
    
    const id = await ctx.db.insert("buyers", {
      ...validateBuyerInput(args),
      proofOfFundsReviewed: args.proofOfFundsReviewed,
      ndaSigned: args.ndaSigned,
      backgroundCheckComplete: args.backgroundCheckComplete,
      notes: optionalText(args.notes, "Internal notes", 4_000),
      qualificationStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Log the creation
    await ctx.db.insert("activityLogs", {
      action: "buyer_created",
      entityType: "buyer",
      entityId: id,
      entityLabel: "Buyer profile",
      details: "Manually entered by advisor",
      actorClerkId: identity.subject,
      actorUserId: user._id,
      actorRole: "admin",
      outcome: "success",
      source: "ui",
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
    const { identity, user } = await requireAdvisor(ctx);

    const { id, ...fields } = args;
    const now = Date.now();

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Buyer not found");
    }

    await ctx.db.patch(id, {
      ...validateBuyerInput(fields),
      proofOfFundsReviewed: fields.proofOfFundsReviewed,
      ndaSigned: fields.ndaSigned,
      backgroundCheckComplete: fields.backgroundCheckComplete,
      notes: optionalText(fields.notes, "Internal notes", 4_000),
      updatedAt: now,
    });

    // Log the update
    await ctx.db.insert("activityLogs", {
      action: "buyer_updated",
      entityType: "buyer",
      entityId: id,
      entityLabel: "Buyer profile",
      details: "Profile fields updated by advisor",
      actorClerkId: identity.subject,
      actorUserId: user._id,
      actorRole: "admin",
      outcome: "success",
      source: "ui",
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
    const { identity, user } = await requireAdvisor(ctx);
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
      entityLabel: "Buyer profile",
      details: `Status: ${existing.qualificationStatus} → ${args.status}`,
      actorClerkId: identity.subject,
      actorUserId: user._id,
      actorRole: "admin",
      outcome: "success",
      source: "ui",
      createdAt: now,
    });

    return args.id;
  },
});
