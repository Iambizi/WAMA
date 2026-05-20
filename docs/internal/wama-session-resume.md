# WAMA Platform — Session Resume Prompt
## For: Claude Code / AI Coding Agent

---

## What You're Building

An internal advisor tool for a boutique M&A advisor (William, WAMA Consulting, Montreal). He manages SME buy-sell transactions. The tool lets him:
- Create and qualify buyer and seller profiles
- Track document readiness (checklist only — no file upload in V0)
- Generate AI-assisted match recommendations (Claude API, de-identified data only)
- Manage a deal pipeline across stages

There are no buyer or seller logins in V0. William is the only user.

---

## Stack

- **Framework:** Next.js 15, App Router, TypeScript
- **UI:** Tailwind CSS + shadcn/ui (zinc base, CSS variables)
- **Database + backend:** Convex
- **Auth:** Clerk (single advisor user)
- **AI:** Claude API via `@anthropic-ai/sdk`, server-side only
- **Hosting:** Vercel

---

## Non-Negotiable Architecture Rules

1. Every Convex query and mutation must call `requireAdvisor(ctx)` as the first line — auth is enforced at the data layer, not just the UI.
2. The AI prompt builder must use an explicit field allowlist — no names, emails, company names, notes, or free text go into the Claude prompt. Structured criteria and ranges only.
3. All UI strings live in `/lib/copy.ts` — never hardcoded inline in components. This enables French translation later without a refactor.
4. Activity logging on every mutation — use the event strings defined in the tech spec.
5. No file upload, no document storage. Document readiness is boolean checklist fields only.

---

## Current State

> **Update this section at the start of each session.**

```
Last completed step: [ ]
Next step to build: [ Step 1 — Project scaffold ]
Blockers: none
```

---

## Build Order

Work through these steps in sequence. Do not skip ahead. Each step should leave the app in a working, deployable state.

**Step 1 — Project scaffold**
- `create-next-app` with TypeScript, Tailwind, App Router
- Install and configure Convex, Clerk, shadcn/ui, Anthropic SDK
- Root layout with `ClerkProvider` wrapping `ConvexProviderWithClerk`
- Sidebar layout with nav links: Dashboard, Buyers, Sellers, Matches
- Auth guard on all routes (redirect to Clerk sign-in if unauthenticated)
- Empty placeholder pages at `/dashboard`, `/buyers`, `/sellers`, `/matches`
- ✅ Done when: app loads, Clerk sign-in works, sidebar renders

**Step 2 — Buyer CRUD**
- Convex schema for `buyers` table (see tech spec)
- `convex/buyers.ts` — `list`, `get`, `create`, `update`, `updateStatus` mutations
- `/buyers` page — list with status filter tabs (All / Pending / Qualified / Disqualified)
- `/buyers/new` — create form with all fields from schema
- `/buyers/[id]` — profile view with edit mode, status change dropdown, notes field
- Status badge component: gray/green/red
- ✅ Done when: can create, view, edit, and change status of a buyer

**Step 3 — Seller CRUD**
- Convex schema for `sellers` table (see tech spec)
- `convex/sellers.ts` — same pattern as buyers
- `/sellers` page — same list pattern
- `/sellers/new` — create form (includes sector, revenue/EBITDA ranges, transaction type, document readiness checklist)
- `/sellers/[id]` — profile view, edit mode, readiness checklist with computed score displayed, notes, "Generate Matches" button (non-functional placeholder for now)
- ✅ Done when: can create, view, edit, and manage a seller profile with readiness score

**Step 4 — Dashboard**
- Convex queries for counts: total buyers, total sellers, pending qualifications, active matches
- `activityLogs` table + mutation helper
- Retroactively add `activityLogs` insert to buyer and seller create/update mutations
- Dashboard stats grid (4 stat cards)
- Activity feed (latest 20 events, reverse chronological)
- ✅ Done when: dashboard shows live counts and recent activity

**Step 5 — AI Matching**
- `POST /api/match` route handler
- De-identification utility: maps seller + buyer array → safe prompt payload
- Claude API call with structured prompt (system + user from tech spec)
- JSON response parsing and validation
- Upsert match records into `matches` table
- `convex/matches.ts` — `listBySeller`, `get`, `upsertFromAI` mutations
- Wire up "Generate Matches" button on seller profile page
- `/matches` page — list all matches with status filter
- ✅ Done when: clicking "Generate Matches" on a seller profile calls Claude and creates match records visible on `/matches`

**Step 6 — Match Pipeline**
- `/matches/[id]` page — match detail view
- AI score display (0–100 with visual indicator)
- AI reasoning text
- Matched criteria tags
- Buyer and seller profile summaries (no PII exposure — show criteria only in this view)
- Pipeline stage advancement: approve, reject, or advance stage
- Stage advancement logs to `activityLogs`
- ✅ Done when: advisor can review an AI-suggested match and advance it through pipeline stages

**Step 7 — Polish**
- Loading skeletons on all list and detail pages
- Empty states for zero buyers, zero sellers, zero matches
- Form validation error messages
- Confirm dialog on status changes (qualified → disqualified, match rejection)
- Review all copy against `/lib/copy.ts` — nothing should be hardcoded
- ✅ Done when: app handles all edge cases gracefully

---

## Key Files Reference

| File | Purpose |
|---|---|
| `convex/schema.ts` | Full database schema — source of truth |
| `convex/auth.config.ts` | Clerk JWT configuration |
| `lib/copy.ts` | All UI strings |
| `lib/constants.ts` | Enum arrays for dropdowns (sectors, ranges, etc.) |
| `app/api/match/route.ts` | AI match server route |

---

## Prompt Construction Rules (AI Matching)

When building the Claude prompt in `/api/match/route.ts`:

**Allowed fields:**
- `sector`, `sectorInterest`
- `geography`
- `revenueRange`, `ebitdaRange`, `budgetMin`, `budgetMax`
- `transactionType`, `financingType`
- `acquisitionTimeline`, `acquisitionExperience`
- `employeeCount`, `yearsInOperation`
- `transactionType`, `reasonForSale` (summarized, not raw)
- Readiness checklist booleans

**Forbidden fields — never include:**
- `name`, `email`, `phone`
- `businessName`
- `notes`
- Any field not on the allowlist above

Use internal Convex IDs (shortened) as buyer/seller references in the prompt. Map them back to real IDs after parsing the response.

---

## Convex Mutation Pattern

All mutations follow this pattern:

```typescript
export const create = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    const id = await ctx.db.insert("tableName", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLogs", {
      action: "entity_created",
      entityType: "buyer", // or "seller" or "match"
      entityId: id,
      entityLabel: args.name,
      createdAt: now,
    });

    return id;
  },
});
```

---

## If You're Starting a New Session

1. Read this file
2. Check the **Current State** section above
3. Continue from the next incomplete step
4. Update **Current State** before ending the session
