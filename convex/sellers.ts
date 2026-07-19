import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { requireAdvisor } from "./activityLogs";
import { requireUser } from "./authz";
import { assertCanCreateSelfProfile, assertCanEditSelfProfile } from "./onboarding";
import {
  ALLOWED_GEOGRAPHIES,
  ALLOWED_SECTORS,
  finiteNumber,
  optionalText,
  requiredText,
  validEmail,
  validPhone,
} from "./securityValidation";

const sellerSelfArgs = {
  name: v.string(), email: v.string(), phone: v.optional(v.string()),
  businessName: v.string(), sector: v.string(), geography: v.string(),
  revenueRange: v.union(v.literal("under_500k"), v.literal("500k_1m"), v.literal("1m_3m"), v.literal("3m_5m"), v.literal("5m_10m"), v.literal("over_10m")),
  ebitdaRange: v.union(v.literal("under_100k"), v.literal("100k_250k"), v.literal("250k_500k"), v.literal("500k_1m"), v.literal("over_1m")),
  employeeCount: v.union(v.literal("1_5"), v.literal("6_15"), v.literal("16_50"), v.literal("51_plus")),
  yearsInOperation: v.number(),
  transactionType: v.union(v.literal("full_sale"), v.literal("majority"), v.literal("minority"), v.literal("succession")),
  reasonForSale: v.string(),
};

type SellerSelfInput = {
  name: string; email: string; phone?: string; businessName: string; sector: string;
  geography: string; revenueRange: "under_500k" | "500k_1m" | "1m_3m" | "3m_5m" | "5m_10m" | "over_10m";
  ebitdaRange: "under_100k" | "100k_250k" | "250k_500k" | "500k_1m" | "over_1m";
  employeeCount: "1_5" | "6_15" | "16_50" | "51_plus"; yearsInOperation: number;
  transactionType: "full_sale" | "majority" | "minority" | "succession"; reasonForSale: string;
};

function validateSellerInput(args: SellerSelfInput): SellerSelfInput {
  if (!ALLOWED_SECTORS.includes(args.sector as typeof ALLOWED_SECTORS[number])) throw new Error("Sector is invalid");
  if (!ALLOWED_GEOGRAPHIES.includes(args.geography as typeof ALLOWED_GEOGRAPHIES[number])) throw new Error("Geography is invalid");
  return {
    ...args,
    name: requiredText(args.name, "Owner name", 120),
    email: validEmail(args.email),
    phone: validPhone(args.phone),
    businessName: requiredText(args.businessName, "Business name", 160),
    reasonForSale: requiredText(args.reasonForSale, "Reason for sale", 1_000),
    yearsInOperation: finiteNumber(args.yearsInOperation, "Years in operation", 0, 500),
  };
}

// Compute Document Readiness Score from the 5 boolean checklist flags
function computeReadinessScore(args: {
  docFinancialsCpa: boolean;
  docFinancialsInterim: boolean;
  docAccountsReceivable: boolean;
  docAccountsPayable: boolean;
  docEmployeeOrgChart: boolean;
  docExecutiveSalaries: boolean;
}): number {
  const flags = [
    args.docFinancialsCpa,
    args.docFinancialsInterim,
    args.docAccountsReceivable,
    args.docAccountsPayable,
    args.docEmployeeOrgChart,
    args.docExecutiveSalaries,
  ];
  const trueCount = flags.filter(Boolean).length;
  return Math.round((trueCount / 6) * 100);
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
    await requireAdvisor(ctx);
    return await ctx.db.get(args.id);
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

    const seller = await ctx.db
      .query("sellers")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
    if (!seller || user.role !== "seller") return null;
    return {
      qualificationStatus: seller.qualificationStatus,
      businessName: seller.businessName,
      sector: seller.sector,
      geography: seller.geography,
      revenueRange: seller.revenueRange,
      ebitdaRange: seller.ebitdaRange,
      employeeCount: seller.employeeCount,
      yearsInOperation: seller.yearsInOperation,
      transactionType: seller.transactionType,
      reasonForSale: seller.reasonForSale,
      docFinancialsCpa: seller.docFinancialsCpa,
      docFinancialsInterim: seller.docFinancialsInterim,
      docAccountsReceivable: seller.docAccountsReceivable,
      docAccountsPayable: seller.docAccountsPayable,
      docEmployeeOrgChart: seller.docEmployeeOrgChart,
      docExecutiveSalaries: seller.docExecutiveSalaries,
    };
  },
});

export const createSelf = mutation({
  args: sellerSelfArgs,
  handler: async (ctx: MutationCtx, args: SellerSelfInput) => {
    const { identity, user } = await requireUser(ctx);
    assertCanCreateSelfProfile(user, "seller");
    const existing = await ctx.db.query("sellers").withIndex("by_user_id", (q) => q.eq("userId", user._id)).collect();
    if (existing.length > 0) throw new Error("Seller profile already exists");
    const fields = validateSellerInput(args);
    const now = Date.now();
    const id = await ctx.db.insert("sellers", {
      ...fields,
      userId: user._id,
      dealDiscoveryMeeting: false,
      dealNdaSigned: false,
      dealDocumentsReceived: false,
      dealPreliminaryAnalysisDone: false,
      dealMandateProposal: false,
      dealProposalSigned: false,
      dealDocumentationReady: false,
      docFinancialsCpa: false,
      docFinancialsInterim: false,
      docAccountsReceivable: false,
      docAccountsPayable: false,
      docEmployeeOrgChart: false,
      docExecutiveSalaries: false,
      qualificationStatus: "pending",
      readinessScore: 0,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(user._id, { role: "seller", onboardingStatus: "submitted", updatedAt: now });
    await ctx.db.insert("activityLogs", {
      action: "seller_submitted", entityType: "seller", entityId: id,
      entityLabel: "Seller profile", details: "Self-service onboarding submitted",
      actorClerkId: identity.subject, actorUserId: user._id, actorRole: "seller",
      outcome: "success", source: "ui", createdAt: now,
    });
    return id;
  },
});

export const updateSelf = mutation({
  args: { id: v.id("sellers"), ...sellerSelfArgs },
  handler: async (ctx: MutationCtx, args: SellerSelfInput & { id: string & { __tableName: "sellers" } }) => {
    const { user } = await requireUser(ctx);
    assertCanEditSelfProfile(user, "seller");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) throw new Error("Forbidden");
    const { id, ...input } = args;
    await ctx.db.patch(id, { ...validateSellerInput(input), updatedAt: Date.now() });
    return id;
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
    dealDiscoveryMeeting: v.boolean(),
    dealNdaSigned: v.boolean(),
    dealDocumentsReceived: v.boolean(),
    dealPreliminaryAnalysisDone: v.boolean(),
    dealMandateProposal: v.boolean(),
    dealProposalSigned: v.boolean(),
    dealDocumentationReady: v.boolean(),
    docFinancialsCpa: v.boolean(),
    docFinancialsInterim: v.boolean(),
    docAccountsReceivable: v.boolean(),
    docAccountsPayable: v.boolean(),
    docEmployeeOrgChart: v.boolean(),
    docExecutiveSalaries: v.boolean(),
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
      dealDiscoveryMeeting: boolean;
      dealNdaSigned: boolean;
      dealDocumentsReceived: boolean;
      dealPreliminaryAnalysisDone: boolean;
      dealMandateProposal: boolean;
      dealProposalSigned: boolean;
      dealDocumentationReady: boolean;
      docFinancialsCpa: boolean;
      docFinancialsInterim: boolean;
      docAccountsReceivable: boolean;
      docAccountsPayable: boolean;
      docEmployeeOrgChart: boolean;
      docExecutiveSalaries: boolean;
      notes?: string;
    }
  ) => {
    const { identity, user } = await requireAdvisor(ctx);

    const now = Date.now();
    const readinessScore = computeReadinessScore(args);

    const id = await ctx.db.insert("sellers", {
      ...validateSellerInput(args),
      dealDiscoveryMeeting: args.dealDiscoveryMeeting,
      dealNdaSigned: args.dealNdaSigned,
      dealDocumentsReceived: args.dealDocumentsReceived,
      dealPreliminaryAnalysisDone: args.dealPreliminaryAnalysisDone,
      dealMandateProposal: args.dealMandateProposal,
      dealProposalSigned: args.dealProposalSigned,
      dealDocumentationReady: args.dealDocumentationReady,
      docFinancialsCpa: args.docFinancialsCpa,
      docFinancialsInterim: args.docFinancialsInterim,
      docAccountsReceivable: args.docAccountsReceivable,
      docAccountsPayable: args.docAccountsPayable,
      docEmployeeOrgChart: args.docEmployeeOrgChart,
      docExecutiveSalaries: args.docExecutiveSalaries,
      notes: optionalText(args.notes, "Internal notes", 4_000),
      qualificationStatus: "pending",
      readinessScore,
      createdAt: now,
      updatedAt: now,
    });

    // Log the creation activity
    await ctx.db.insert("activityLogs", {
      action: "seller_created",
      entityType: "seller",
      entityId: id,
      entityLabel: "Seller profile",
      details: `Manually entered by advisor (Readiness: ${readinessScore}%)`,
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
    dealDiscoveryMeeting: v.boolean(),
    dealNdaSigned: v.boolean(),
    dealDocumentsReceived: v.boolean(),
    dealPreliminaryAnalysisDone: v.boolean(),
    dealMandateProposal: v.boolean(),
    dealProposalSigned: v.boolean(),
    dealDocumentationReady: v.boolean(),
    docFinancialsCpa: v.boolean(),
    docFinancialsInterim: v.boolean(),
    docAccountsReceivable: v.boolean(),
    docAccountsPayable: v.boolean(),
    docEmployeeOrgChart: v.boolean(),
    docExecutiveSalaries: v.boolean(),
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
      dealDiscoveryMeeting: boolean;
      dealNdaSigned: boolean;
      dealDocumentsReceived: boolean;
      dealPreliminaryAnalysisDone: boolean;
      dealMandateProposal: boolean;
      dealProposalSigned: boolean;
      dealDocumentationReady: boolean;
      docFinancialsCpa: boolean;
      docFinancialsInterim: boolean;
      docAccountsReceivable: boolean;
      docAccountsPayable: boolean;
      docEmployeeOrgChart: boolean;
      docExecutiveSalaries: boolean;
      notes?: string;
    }
  ) => {
    const { identity, user } = await requireAdvisor(ctx);

    const { id, ...fields } = args;
    const now = Date.now();

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Seller mandate not found");
    }

    const readinessScore = computeReadinessScore(fields);

    await ctx.db.patch(id, {
      ...validateSellerInput(fields),
      dealDiscoveryMeeting: fields.dealDiscoveryMeeting,
      dealNdaSigned: fields.dealNdaSigned,
      dealDocumentsReceived: fields.dealDocumentsReceived,
      dealPreliminaryAnalysisDone: fields.dealPreliminaryAnalysisDone,
      dealMandateProposal: fields.dealMandateProposal,
      dealProposalSigned: fields.dealProposalSigned,
      dealDocumentationReady: fields.dealDocumentationReady,
      docFinancialsCpa: fields.docFinancialsCpa,
      docFinancialsInterim: fields.docFinancialsInterim,
      docAccountsReceivable: fields.docAccountsReceivable,
      docAccountsPayable: fields.docAccountsPayable,
      docEmployeeOrgChart: fields.docEmployeeOrgChart,
      docExecutiveSalaries: fields.docExecutiveSalaries,
      notes: optionalText(fields.notes, "Internal notes", 4_000),
      readinessScore,
      updatedAt: now,
    });

    // Log the update activity
    await ctx.db.insert("activityLogs", {
      action: "seller_updated",
      entityType: "seller",
      entityId: id,
      entityLabel: "Seller profile",
      details: `Updated profile by advisor (Readiness: ${readinessScore}%)`,
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
    const { identity, user } = await requireAdvisor(ctx);
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
      entityLabel: "Seller profile",
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
