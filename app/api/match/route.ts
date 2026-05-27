import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize session using Clerk context
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { sellerId } = body;

    if (!sellerId) {
      return new NextResponse("Missing sellerId", { status: 400 });
    }

    // 2. Initialize authenticated Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    // 3. Fetch target seller mandate and all active qualified buyers
    const seller = await convex.query(api.sellers.get, { id: sellerId });
    if (!seller) {
      return new NextResponse("Seller mandate not found", { status: 404 });
    }

    const allBuyers = await convex.query(api.buyers.list);
    const qualifiedBuyers = (allBuyers || []).filter(
      (b) => b.qualificationStatus === "qualified"
    );

    // If there are zero qualified buyers, we can short-circuit immediately
    if (qualifiedBuyers.length === 0) {
      return NextResponse.json({ matches: [], message: "No qualified buyers available to match." });
    }

    // 4. Implement strict de-identification allowlist payload mapper (Stripping PII & Notes)
    const sanitizedSeller = {
      sellerRef: String(seller._id).slice(-6), // shorten ID for de-identification
      sector: seller.sector,
      geography: seller.geography,
      revenueRange: seller.revenueRange,
      ebitdaRange: seller.ebitdaRange,
      employeeCount: seller.employeeCount,
      yearsInOperation: seller.yearsInOperation,
      transactionType: seller.transactionType,
      reasonForSale: seller.reasonForSale,
    };

    // Store map of shortened ref to original Convex buyer ID for reverse mapping
    const refToIdMap = new Map<string, string>();
    const sanitizedBuyers = qualifiedBuyers.map((b) => {
      const shortened = String(b._id).slice(-6);
      refToIdMap.set(shortened, b._id);

      return {
        buyerRef: shortened,
        sectorInterest: b.sectorInterest,
        budgetMin: b.budgetMin,
        budgetMax: b.budgetMax,
        geography: b.geography,
        financingType: b.financingType,
        acquisitionExperience: b.acquisitionExperience,
        acquisitionTimeline: b.acquisitionTimeline,
      };
    });

    // 5. Structure system and user prompts
    const systemPrompt = `You are an M&A match recommendation engine for a boutique SME advisor in Quebec, Canada.
Your job is to analyze a seller profile and a list of qualified buyers, then recommend the best matches.

Rules:
- Only use the structured criteria provided. Do not infer or hallucinate details.
- Score each buyer from 0 to 100 based on fit with the seller.
- Explain your reasoning in plain language (2–3 sentences max per match).
- List which specific criteria aligned (e.g. "sector", "budget", "geography", "timeline").
- Return ONLY valid JSON. No preamble, no markdown.

Response format:
{
  "matches": [
    {
      "buyerRef": "string",
      "score": number,
      "reasoning": "string",
      "matchedCriteria": ["sector", "budget", ...]
    }
  ]
}`;

    const userPrompt = `SELLER PROFILE:
- Ref: ${sanitizedSeller.sellerRef}
- Sector: ${sanitizedSeller.sector}
- Geography: ${sanitizedSeller.geography}
- Revenue range: ${sanitizedSeller.revenueRange}
- EBITDA range: ${sanitizedSeller.ebitdaRange}
- Transaction type: ${sanitizedSeller.transactionType}
- Employee count: ${sanitizedSeller.employeeCount}
- Years in operation: ${sanitizedSeller.yearsInOperation}
- Reason for sale: ${sanitizedSeller.reasonForSale}

QUALIFIED BUYERS:
${sanitizedBuyers.map((b) => `
- Ref: ${b.buyerRef}
  Sectors of interest: ${b.sectorInterest.join(", ")}
  Budget: ${b.budgetMin}–${b.budgetMax} CAD
  Geography: ${b.geography.join(", ")}
  Financing: ${b.financingType}
  Experience: ${b.acquisitionExperience}
  Timeline: ${b.acquisitionTimeline}
`).join("")}

Return the top matches ranked by score descending. Include all buyers with a score above 30.`;

    // 6. Initialize Anthropic Claude API client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawOutput = msg.content[0].type === "text" ? msg.content[0].text : "";

    // Clean JSON response (strip any accidental markdown block wrapper backticks if Claude includes them)
    const jsonString = rawOutput.includes("```json")
      ? rawOutput.split("```json")[1].split("```")[0].trim()
      : rawOutput.includes("```")
        ? rawOutput.split("```")[1].split("```")[0].trim()
        : rawOutput.trim();

    const parsedData = JSON.parse(jsonString);
    const matchesResult = parsedData.matches || [];

    // 7. Loop through match proposals and upsert into the Convex database
    let insertedCount = 0;
    for (const m of matchesResult) {
      const realBuyerId = refToIdMap.get(m.buyerRef);
      if (!realBuyerId) continue;

      await convex.mutation(api.matches.upsertFromAI, {
        sellerId: seller._id,
        buyerId: realBuyerId as Id<"buyers">,
        aiScore: Number(m.score),
        aiReasoning: m.reasoning,
        aiMatchedCriteria: m.matchedCriteria,
      });
      insertedCount++;
    }

    // 8. Log the generation completion event
    if (insertedCount > 0) {
      await convex.mutation(api.matches.logMatchGeneration, {
        sellerId: seller._id,
        matchCount: insertedCount,
      });
    }

    return NextResponse.json({
      success: true,
      matchesCount: insertedCount,
      message: `${insertedCount} matches successfully synchronized.`,
    });
  } catch (error) {
    console.error("AI Matching Engine route failure:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to process matching engine recommendations.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
