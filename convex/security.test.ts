/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);
const originalAdminIds = process.env.ADMIN_CLERK_IDS;
const originalAdminEmails = process.env.ADMIN_EMAILS;

const sellerSelfInput = {
  name: "Synthetic Seller",
  email: "seller@example.test",
  businessName: "Synthetic Business",
  sector: "services",
  geography: "montreal",
  revenueRange: "1m_3m" as const,
  ebitdaRange: "250k_500k" as const,
  employeeCount: "6_15" as const,
  yearsInOperation: 10,
  transactionType: "full_sale" as const,
  reasonForSale: "Planned succession.",
};

const buyerSelfInput = {
  name: "Synthetic Buyer", email: "buyer@example.test", sectorInterest: ["services"],
  budgetMin: 500_000, budgetMax: 3_000_000, geography: ["montreal"],
  financingType: "cash" as const, acquisitionExperience: "first_time" as const,
  acquisitionTimeline: "6_12mo" as const,
};

beforeEach(() => {
  process.env.ADMIN_CLERK_IDS = "trusted-admin";
  process.env.ADMIN_EMAILS = "william@example.test";
});

afterEach(() => {
  process.env.ADMIN_CLERK_IDS = originalAdminIds;
  process.env.ADMIN_EMAILS = originalAdminEmails;
});

async function insertUser(t: ReturnType<typeof convexTest>, clerkId: string, role: "admin" | "buyer" | "seller" | "unassigned", intent: "buyer" | "seller" | null = null, status: "not_started" | "in_progress" | "submitted" | "approved" | "rejected" = "not_started") {
  return await t.run((ctx) => ctx.db.insert("users", {
    clerkId, email: `${clerkId}@example.test`, role, onboardingIntent: intent,
    onboardingStatus: status, createdAt: Date.now(), updatedAt: Date.now(),
  }));
}

describe("trusted administrator authorization", () => {
  test("unauthenticated privileged access is rejected", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.buyers.list, {})).rejects.toThrow(/Unauthorized/);
  });

  test("browser-supplied email cannot grant administrator access", async () => {
    const t = convexTest(schema, modules);
    const normal = t.withIdentity({ subject: "normal-user", email: "normal@example.test", emailVerified: true });
    await expect(normal.mutation(api.users.sync, { email: "william@example.test" } as unknown as Record<string, never>)).rejects.toThrow();
    await normal.mutation(api.users.sync, {});
    const stored = await t.run((ctx) => ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", "normal-user")).unique());
    expect(stored?.role).toBe("unassigned");
  });

  test("stale database admin role does not create trusted access", async () => {
    const t = convexTest(schema, modules);
    await insertUser(t, "tampered-user", "admin");
    const tampered = t.withIdentity({ subject: "tampered-user", email: "tampered@example.test", emailVerified: true });
    await expect(tampered.query(api.buyers.list, {})).rejects.toThrow(/Administrator privileges required/);
  });

  test("configured administrator retains privileged access", async () => {
    const t = convexTest(schema, modules);
    await insertUser(t, "trusted-admin", "admin");
    const admin = t.withIdentity({ subject: "trusted-admin", email: "william@example.test", emailVerified: true });
    await expect(admin.query(api.buyers.list, {})).resolves.toEqual([]);
  });
});

describe("onboarding and self-service boundaries", () => {
  test("intent selection cannot directly mark onboarding submitted", async () => {
    const t = convexTest(schema, modules);
    await insertUser(t, "new-user", "unassigned");
    const user = t.withIdentity({ subject: "new-user" });
    await expect(user.mutation(api.users.updateIntent, { intent: "buyer", status: "submitted" })).rejects.toThrow(/profile creation/);
  });

  test("buyer cannot create a seller profile", async () => {
    const t = convexTest(schema, modules);
    await insertUser(t, "buyer-user", "buyer", "buyer", "submitted");
    const buyer = t.withIdentity({ subject: "buyer-user" });
    await expect(buyer.mutation(api.sellers.createSelf, sellerSelfInput)).rejects.toThrow(/already assigned|Administrators|Forbidden/);
  });

  test("seller cannot create a buyer profile", async () => {
    const t = convexTest(schema, modules);
    await insertUser(t, "seller-user", "seller", "seller", "submitted");
    const seller = t.withIdentity({ subject: "seller-user" });
    await expect(seller.mutation(api.buyers.createSelf, buyerSelfInput)).rejects.toThrow(/already assigned|Forbidden/);
  });

  test("protected advisor fields are rejected and duplicate profiles are blocked", async () => {
    const t = convexTest(schema, modules);
    await insertUser(t, "seller-user", "unassigned", "seller", "in_progress");
    const seller = t.withIdentity({ subject: "seller-user" });
    await expect(seller.mutation(api.sellers.createSelf, {
      ...sellerSelfInput,
      notes: "must not be accepted",
      docFinancialsCpa: true,
    } as unknown as typeof sellerSelfInput)).rejects.toThrow();
    await seller.mutation(api.sellers.createSelf, sellerSelfInput);
    await expect(seller.mutation(api.sellers.createSelf, sellerSelfInput)).rejects.toThrow();
  });
});

describe("least privilege buyer responses", () => {
  test("buyer profile and teaser omit internal fields and identifiers", async () => {
    const t = convexTest(schema, modules);
    const userId = await insertUser(t, "buyer-user", "buyer", "buyer", "approved");
    const buyerId = await t.run((ctx) => ctx.db.insert("buyers", {
      name: "Synthetic Buyer", email: "buyer@example.test", sectorInterest: ["services"],
      budgetMin: 500_000, budgetMax: 3_000_000, geography: ["montreal"], financingType: "cash",
      acquisitionExperience: "first_time", acquisitionTimeline: "6_12mo",
      proofOfFundsReviewed: true, ndaSigned: false, backgroundCheckComplete: true,
      qualificationStatus: "qualified", notes: "internal-only", userId,
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    const sellerId = await t.run((ctx) => ctx.db.insert("sellers", {
      ...sellerSelfInput,
      phone: "555-555-5555",
      dealDiscoveryMeeting: true, dealNdaSigned: true, dealDocumentsReceived: true,
      dealPreliminaryAnalysisDone: true, dealMandateProposal: true, dealProposalSigned: true,
      dealDocumentationReady: true, docFinancialsCpa: true, docFinancialsInterim: true,
      docAccountsReceivable: true, docAccountsPayable: true, docEmployeeOrgChart: true,
      docExecutiveSalaries: true, qualificationStatus: "qualified", readinessScore: 100,
      notes: "seller internal-only", createdAt: Date.now(), updatedAt: Date.now(),
    }));
    await t.run((ctx) => ctx.db.insert("matches", {
      sellerId, buyerId, aiScore: 80, aiReasoning: "internal reasoning", aiMatchedCriteria: ["sector"],
      status: "approved", buyerAccessStatus: "teaser_shared", advisorNotes: "never expose",
      dealValue: 2_000_000, targetCloseDate: Date.now() + 100_000,
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    const buyer = t.withIdentity({ subject: "buyer-user" });
    const profile = await buyer.query(api.buyers.currentBuyer, {});
    const opportunities = await buyer.query(api.matches.listPopulatedForBuyer, {});
    expect(profile).not.toHaveProperty("notes");
    expect(profile).not.toHaveProperty("_id");
    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]).not.toHaveProperty("advisorNotes");
    expect(opportunities[0]).not.toHaveProperty("sellerId");
    expect(opportunities[0]).not.toHaveProperty("dealValue");
    expect(opportunities[0]).not.toHaveProperty("sellerEbitdaRange");
    expect(opportunities[0]?.sellerBusinessName).toBe("Confidential Project");
  });

  test("post-NDA and introduced fields are disclosed progressively", async () => {
    const t = convexTest(schema, modules);
    const userId = await insertUser(t, "buyer-user", "buyer", "buyer", "approved");
    const buyerId = await t.run((ctx) => ctx.db.insert("buyers", {
      ...buyerSelfInput, proofOfFundsReviewed: true, ndaSigned: false,
      backgroundCheckComplete: true, qualificationStatus: "qualified", userId,
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    const sellerId = await t.run((ctx) => ctx.db.insert("sellers", {
      ...sellerSelfInput, dealDiscoveryMeeting: true, dealNdaSigned: true,
      dealDocumentsReceived: true, dealPreliminaryAnalysisDone: true,
      dealMandateProposal: true, dealProposalSigned: true, dealDocumentationReady: true,
      docFinancialsCpa: true, docFinancialsInterim: true, docAccountsReceivable: true,
      docAccountsPayable: true, docEmployeeOrgChart: true, docExecutiveSalaries: true,
      qualificationStatus: "qualified", readinessScore: 100,
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    const matchId = await t.run((ctx) => ctx.db.insert("matches", {
      sellerId, buyerId, aiScore: 90, aiReasoning: "internal", aiMatchedCriteria: ["sector"],
      status: "approved", buyerAccessStatus: "intro_approved",
      createdAt: Date.now(), updatedAt: Date.now(),
    }));
    const buyer = t.withIdentity({ subject: "buyer-user" });
    expect(await buyer.query(api.matches.listPopulatedForBuyer, {})).toEqual([]);
    await t.run(async (ctx) => {
      await ctx.db.patch(buyerId, { ndaSigned: true });
      await ctx.db.patch(matchId, { buyerAccessStatus: "introduced" });
    });
    const introduced = await buyer.query(api.matches.listPopulatedForBuyer, {});
    expect(introduced[0]?.sellerBusinessName).toBe("Synthetic Business");
    expect(introduced[0]).toHaveProperty("sellerReasonForSale");
    expect(introduced[0]).not.toHaveProperty("email");
    expect(introduced[0]).not.toHaveProperty("phone");
  });
});

describe("AI abuse controls", () => {
  test("non-admin cannot reserve AI work and duplicate requests are deduplicated", async () => {
    const t = convexTest(schema, modules);
    const adminId = await insertUser(t, "trusted-admin", "admin");
    await insertUser(t, "normal-user", "buyer", "buyer", "approved");
    const sellerId = await t.run((ctx) => ctx.db.insert("sellers", {
      ...sellerSelfInput, dealDiscoveryMeeting: true, dealNdaSigned: true,
      dealDocumentsReceived: true, dealPreliminaryAnalysisDone: true,
      dealMandateProposal: true, dealProposalSigned: true, dealDocumentationReady: true,
      docFinancialsCpa: true, docFinancialsInterim: true, docAccountsReceivable: true,
      docAccountsPayable: true, docEmployeeOrgChart: true, docExecutiveSalaries: true,
      qualificationStatus: "qualified", createdAt: Date.now(), updatedAt: Date.now(),
    }));
    const normal = t.withIdentity({ subject: "normal-user" });
    await expect(normal.mutation(api.aiSecurity.reserveRequest, { requestId: "normal-request", fingerprint: "normal-fingerprint", sellerId })).rejects.toThrow();
    const admin = t.withIdentity({ subject: "trusted-admin", emailVerified: true });
    await admin.mutation(api.aiSecurity.reserveRequest, { requestId: "request-1", fingerprint: "same-fingerprint", sellerId });
    await expect(admin.mutation(api.aiSecurity.reserveRequest, { requestId: "request-2", fingerprint: "same-fingerprint", sellerId })).rejects.toThrow();
    expect(adminId).toBeTruthy();
  });
});
