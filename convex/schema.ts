import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  buyers: defineTable({
    // Identity (advisor-entered, not exposed to AI)
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),

    // Acquisition criteria (used in AI matching)
    sectorInterest: v.array(v.string()),
    budgetMin: v.number(),           // in CAD
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

    // Readiness checklist
    proofOfFundsReviewed: v.boolean(),
    ndaSigned: v.boolean(),
    backgroundCheckComplete: v.boolean(),

    // Qualification
    qualificationStatus: v.union(
      v.literal("pending"),
      v.literal("qualified"),
      v.literal("disqualified")
    ),

    // Internal
    userId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  sellers: defineTable({
    // Identity (advisor-entered, not exposed to AI)
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),

    // Business profile (used in AI matching — no PII)
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
    reasonForSale: v.string(),       // Free text — advisor-summarized, not raw seller input

    // Document readiness checklist (no file storage)
    financialStatementsAvailable: v.boolean(),
    taxReturnsAvailable: v.boolean(),
    leaseDocumentsAvailable: v.boolean(),
    corporateDocumentsAvailable: v.boolean(),
    ndaSigned: v.boolean(),

    // Qualification
    qualificationStatus: v.union(
      v.literal("pending"),
      v.literal("qualified"),
      v.literal("disqualified")
    ),
    readinessScore: v.optional(v.number()),  // 0–100, computed from checklist

    // Internal
    userId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  matches: defineTable({
    sellerId: v.id("sellers"),
    buyerId: v.id("buyers"),

    // AI output
    aiScore: v.number(),             // 0–100
    aiReasoning: v.string(),         // Plain-language explanation
    aiMatchedCriteria: v.array(v.string()),  // ["sector", "budget", "geography"]

    // Pipeline
    status: v.union(
      v.literal("suggested"),        // AI generated, not yet reviewed
      v.literal("reviewed"),         // Advisor looked at it
      v.literal("approved"),         // Advisor approved introduction
      v.literal("introduced"),       // Parties have been introduced
      v.literal("nda_signed"),
      v.literal("in_discussions"),
      v.literal("closed_won"),
      v.literal("closed_lost"),
      v.literal("rejected")          // Advisor rejected the match
    ),

    buyerAccessStatus: v.optional(
      v.union(
        v.literal("hidden"),
        v.literal("teaser_shared"),
        v.literal("nda_required"),
        v.literal("intro_approved"),
        v.literal("introduced")
      )
    ),
    advisorNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_seller", ["sellerId"])
    .index("by_buyer", ["buyerId"]),

  activityLogs: defineTable({
    action: v.string(),              // "buyer_created", "status_changed", "match_generated", etc.
    entityType: v.union(
      v.literal("buyer"),
      v.literal("seller"),
      v.literal("match")
    ),
    entityId: v.string(),
    entityLabel: v.string(),         // Human-readable: "Buyer #14" or buyer name
    details: v.optional(v.string()), // e.g. "status: pending → qualified"
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("buyer"), v.literal("seller"), v.literal("unassigned")),
    onboardingIntent: v.union(v.literal("buyer"), v.literal("seller"), v.null()),
    onboardingStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
});
