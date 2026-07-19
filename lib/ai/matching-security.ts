export const AI_CANDIDATE_LIMIT_DEFAULT = 12;
export const AI_CANDIDATE_LIMIT_MAX = 25;

type SellerForMatching = {
  sector: string;
  geography: string;
  revenueRange: string;
  ebitdaRange: string;
  employeeCount: string;
  yearsInOperation: number;
  transactionType: string;
};

type BuyerForMatching = {
  sectorInterest: string[];
  geography: string[];
  budgetMin: number;
  budgetMax: number;
  financingType: string;
  acquisitionExperience: string;
  acquisitionTimeline: string;
  targetBusinessValue?: number;
  minEbitda?: number;
  minEmployees?: number;
  minTimeInBusiness?: number;
};

const REVENUE_ESTIMATE: Record<string, number> = {
  under_500k: 250_000,
  "500k_1m": 750_000,
  "1m_3m": 2_000_000,
  "3m_5m": 4_000_000,
  "5m_10m": 7_500_000,
  over_10m: 12_000_000,
};

export function configuredCandidateLimit(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return AI_CANDIDATE_LIMIT_DEFAULT;
  return Math.min(parsed, AI_CANDIDATE_LIMIT_MAX);
}

export function shortlistBuyers<T extends BuyerForMatching>(
  seller: SellerForMatching,
  buyers: T[],
  limit: number,
): T[] {
  const revenueEstimate = REVENUE_ESTIMATE[seller.revenueRange] ?? 0;
  return buyers
    .map((buyer, index) => {
      let score = 0;
      if (buyer.sectorInterest.includes(seller.sector)) score += 5;
      if (buyer.geography.includes(seller.geography)) score += 4;
      if (revenueEstimate >= buyer.budgetMin && revenueEstimate <= buyer.budgetMax) score += 3;
      if (!buyer.minTimeInBusiness || seller.yearsInOperation >= buyer.minTimeInBusiness) score += 1;
      return { buyer, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ buyer }) => buyer);
}

export function moneyBand(value: number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value < 250_000) return "under_250k";
  if (value < 500_000) return "250k_500k";
  if (value < 1_000_000) return "500k_1m";
  if (value < 3_000_000) return "1m_3m";
  if (value < 5_000_000) return "3m_5m";
  if (value < 10_000_000) return "5m_10m";
  return "over_10m";
}

export function yearsBand(value: number): string {
  if (value < 3) return "under_3";
  if (value < 6) return "3_5";
  if (value < 11) return "6_10";
  if (value < 21) return "11_20";
  return "over_20";
}

export function minimizeSellerForAI(seller: SellerForMatching, sellerRef: string) {
  return {
    sellerRef,
    sector: seller.sector,
    geography: seller.geography,
    revenueRange: seller.revenueRange,
    ebitdaRange: seller.ebitdaRange,
    employeeCount: seller.employeeCount,
    yearsInOperationBand: yearsBand(seller.yearsInOperation),
    transactionType: seller.transactionType,
  };
}

export function minimizeBuyerForAI(buyer: BuyerForMatching, buyerRef: string) {
  return {
    buyerRef,
    sectorInterest: buyer.sectorInterest,
    budgetMinBand: moneyBand(buyer.budgetMin),
    budgetMaxBand: moneyBand(buyer.budgetMax),
    geography: buyer.geography,
    financingType: buyer.financingType,
    acquisitionExperience: buyer.acquisitionExperience,
    acquisitionTimeline: buyer.acquisitionTimeline,
    targetBusinessValueBand: moneyBand(buyer.targetBusinessValue),
    minEbitdaBand: moneyBand(buyer.minEbitda),
    minEmployees: buyer.minEmployees,
    minTimeInBusiness: buyer.minTimeInBusiness,
  };
}

export function validateModelCandidateReferences(
  references: string[],
  allowedReferences: ReadonlySet<string>,
): void {
  const seen = new Set<string>();
  for (const reference of references) {
    if (!allowedReferences.has(reference) || seen.has(reference)) {
      throw new Error("AI provider returned an invalid candidate reference");
    }
    seen.add(reference);
  }
}
