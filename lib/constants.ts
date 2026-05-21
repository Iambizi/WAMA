// lib/constants.ts
// Shared dropdown arrays and transaction enums for WAMA Platform.

export const SECTORS = [
  { value: "services", label: "Business Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "technology", label: "Technology & Software" },
  { value: "retail", label: "Retail & Consumer" },
  { value: "construction", label: "Construction & Trades" },
  { value: "wholesale", label: "Wholesale & Distribution" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "hospitality", label: "Hospitality & Leisure" },
  { value: "food_beverage", label: "Food & Beverage" },
] as const;

export const GEOGRAPHIES = [
  { value: "montreal", label: "Greater Montreal" },
  { value: "quebec_city", label: "Quebec City Region" },
  { value: "laurentides", label: "Laurentides / Lanaudière" },
  { value: "eastern_townships", label: "Eastern Townships (Estrie)" },
  { value: "outaouais", label: "Outaouais" },
  { value: "monteregie", label: "Montérégie" },
  { value: "other_quebec", label: "Other Quebec Regions" },
  { value: "canada_other", label: "Outside Quebec (Canada)" },
] as const;

export const FINANCING_TYPES = [
  { value: "cash", label: "All Cash / Self-Funded" },
  { value: "financed", label: "Leveraged / Bank Financed" },
  { value: "mixed", label: "Mixed Cash and Debt" },
  { value: "unknown", label: "Unspecified / Flexible" },
] as const;

export const ACQUISITION_EXPERIENCE = [
  { value: "first_time", label: "First-Time Buyer" },
  { value: "experienced", label: "Experienced / Existing Business Owner" },
  { value: "serial", label: "Serial Acquirer / Private Equity" },
] as const;

export const ACQUISITION_TIMELINE = [
  { value: "0_6mo", label: "Immediate (0-6 months)" },
  { value: "6_12mo", label: "Short Term (6-12 months)" },
  { value: "12_24mo", label: "Medium Term (12-24 months)" },
  { value: "24mo_plus", label: "Long Term / Opportunistic (24+ months)" },
] as const;

export const REVENUE_RANGES = [
  { value: "under_500k", label: "Under $500k CAD" },
  { value: "500k_1m", label: "$500k - $1M CAD" },
  { value: "1m_3m", label: "$1M - $3M CAD" },
  { value: "3m_5m", label: "$3M - $5M CAD" },
  { value: "5m_10m", label: "$5M - $10M CAD" },
  { value: "over_10m", label: "Over $10M CAD" },
] as const;

export const EBITDA_RANGES = [
  { value: "under_100k", label: "Under $100k CAD" },
  { value: "100k_250k", label: "$100k - $250k CAD" },
  { value: "250k_500k", label: "$250k - $500k CAD" },
  { value: "500k_1m", label: "$500k - $1M CAD" },
  { value: "over_1m", label: "Over $1M CAD" },
] as const;

export const EMPLOYEE_COUNTS = [
  { value: "1_5", label: "1 - 5 employees" },
  { value: "6_15", label: "6 - 15 employees" },
  { value: "16_50", label: "16 - 50 employees" },
  { value: "51_plus", label: "Over 50 employees" },
] as const;

export const TRANSACTION_TYPES = [
  { value: "full_sale", label: "Full Sale (100% Equity)" },
  { value: "majority", label: "Majority Shareholder Sale" },
  { value: "minority", label: "Minority Shareholder Sale / Partner Buy-out" },
  { value: "succession", label: "Succession Transfer" },
] as const;
