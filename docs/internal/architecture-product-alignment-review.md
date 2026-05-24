# WAMA Architecture and Product Alignment Review

Date: 2026-05-24

Context: Existing codebase review for WAMA, an internal AI-assisted M&A brokerage workflow platform for William. This review is intentionally inspection-only and does not describe code changes made during the review.

# 1. Executive Summary

The codebase is directionally aligned with William's internal M&A brokerage workflow, not a public marketplace. The strongest pieces are the buyer/seller CRUD foundations, Convex schema, Clerk integration, advisor-only UI posture, readiness checklists, and an existing match pipeline schema.

The main gap is that the product is still scaffold-stage beyond buyer/seller profiles. Dashboard and matches are mock data; AI matching is described but not implemented; permissions mean "any signed-in Clerk user," not explicit broker/admin authorization; audit logs are basic activity records rather than approval-grade audit trails.

Recommended path: continue the current architecture, do not rebuild. Add explicit role/authz, replace mock dashboard/matches with live Convex modules, implement AI as suggestion-only with de-identified allowlisted payloads, and add approval/access/audit tables before exposing more sensitive deal data.

# 2. Current Architecture Map

Stack:
- Next.js App Router, TypeScript, React 19, Tailwind v4, Clerk, Convex, Anthropic SDK dependency.
- Actual versions: `next@16.2.6`, `react@19.2.4`, Convex `^1.39.1`, Clerk `^7.4.0` in `package.json`.
- Internal docs still say Next.js 15, so docs are stale against installed runtime.

Routing:
- App Router under `app/`.
- `/` redirects to `/dashboard`.
- Implemented pages: `/dashboard`, `/buyers`, `/buyers/new`, `/buyers/[id]`, `/sellers`, `/sellers/new`, `/sellers/[id]`, `/matches`.
- No implemented `/matches/[id]`.
- No `app/api/*/route.ts`, `proxy.ts`, or `middleware.ts`.

Backend/API:
- Backend is primarily Convex functions.
- Implemented Convex modules: `buyers`, `sellers`, `activityLogs`.
- `matches` exists in schema but has no `convex/matches.ts`.
- No AI route/action exists yet.

Database model:
- Tables: `buyers`, `sellers`, `matches`, `activityLogs` in `convex/schema.ts`.
- Buyer/seller schema is practical for intake and qualification.
- Match schema anticipates AI score/reasoning and human pipeline status.

Auth:
- Clerk wraps app UI in `components/providers/convex-client-provider.tsx`.
- Convex functions call `requireAdvisor`, but that helper only verifies a Clerk identity exists, not that the identity is William/admin/advisor.

Permissions:
- Data layer blocks anonymous access.
- No role table, allowlist, Clerk org role, admin claim, or per-entity access model.
- For V0 single-advisor, this may work only if Clerk app access is tightly controlled outside code.

Forms/validation:
- Forms are client components with local `useState` and manual validation.
- No shared validator such as Zod, Valibot, or Convex-side business validation beyond value types.
- Many copy strings are centralized, but several labels/messages are still hardcoded in components.

AI integration:
- Anthropic SDK installed.
- Product docs specify Claude matching, de-identification, and allowlists.
- Runtime implementation is absent.

Deployment:
- Vercel-oriented Next app.
- Convex + Clerk env assumptions.
- `NEXT_PUBLIC_CONVEX_URL` has a placeholder fallback, useful for build safety but risky if a real deployment lacks env validation.

# 3. Product Alignment Review

Aligned:
- The product docs explicitly define V0 as an internal advisor tool, not a marketplace.
- Buyer and seller flows are separate.
- Buyer qualification and seller readiness are first-class.
- Seller profiles use "mandate" language, readiness score, document checklist, and confidential advisor notes.
- The app visually and structurally centers William/advisor workflows.

Marketplace drift:
- Low current drift. There are no public listing browse pages, buyer portals, seller portals, payment flows, blockchain flows, wallets, or public marketplace search.
- The main future drift risk is exposing `/matches` as if it were a marketplace list. Keep it explicitly internal: recommendation queue, review, approval, staged intro.

Broker/admin centrality:
- Product intent is strong.
- Runtime is partial: status changes are manual, but AI/match approval flows are not implemented yet.
- Need explicit "advisor approved" fields and audit records before introductions.

Sensitive data gating:
- Partially aligned.
- UI labels warn that AI should exclude names/business titles/notes.
- Actual gating is not yet enforceable because AI integration does not exist.
- NDA/access is represented as booleans, not access policy.

# 4. Data Model Review

Supports reasonably well:
- Sellers: `sellers` table with contact identity, business profile, readiness checklist, status, notes.
- Buyers: `buyers` table with contact identity, acquisition criteria, readiness checklist, status, notes.
- Matches: schema exists with `sellerId`, `buyerId`, `aiScore`, `aiReasoning`, `aiMatchedCriteria`, status.
- Qualification/readiness: buyer/seller statuses and seller readiness score.
- Human approvals: match statuses include `approved`, `rejected`, `introduced`.

Partial:
- Businesses/listings: sellers double as "seller + business/mandate." Fine for V0, but later split `sellers` from `businesses` or `mandates`.
- Deal opportunities: `matches` approximates this but lacks deal-specific metadata, intro dates, access states, owner approval, buyer interest, NDA per match.
- Admin notes: single `notes` fields exist, but not structured note history.
- AI summaries: seller `reasonForSale` exists, match AI reasoning exists; no general `aiSummaries` or `aiRuns`.
- Audit logs: `activityLogs` exists but lacks actor ID, role, before/after JSON, request correlation, immutable event enum, and access-change detail.

Missing:
- Explicit `users/advisors` or role model.
- NDA/access states per buyer-seller relationship.
- Introduction approval records.
- Access grants/revocations.
- AI run metadata: model, prompt version, input hash, output JSON, createdBy, reviewedBy.
- Follow-up questions/tasks.
- Diligence checklist entities.
- Internal notes as append-only thread/history.

# 5. Buyer/Seller/Admin Flow Review

Buyer flow:
- Live Convex list/detail/create/edit/status exists.
- Qualification status can be changed from buyer profile.
- Good foundation for intake and qualification.
- Needs stronger qualification checklist states and "why qualified/disqualified."

Seller flow:
- Live Convex list/detail/create/edit/status exists.
- Readiness score is computed from checklist booleans in `convex/sellers.ts`.
- Seller detail has AI match-ready summary and confidentiality warnings.
- "Generate AI Matches" is only a shortcut to `/matches`, not a real action.

Admin/dashboard:
- Dashboard is mock data.
- Activity logs are written by buyer/seller mutations, but dashboard does not query them.
- Needs live counts, pending-review queues, recent activity, and match review queue.

Matches:
- `/matches` is mock data.
- No match detail route.
- No pipeline mutations.

# 6. AI-Agent Readiness Review

Ready in concept:
- Structured buyer/seller criteria exists.
- De-identification rules are documented.
- Match schema can store AI score/reasoning.
- Seller summary field is intended as AI-safe free text.

Not ready in implementation:
- No AI prompt builder.
- No allowlist utility.
- No server-side AI route/action.
- No output schema validation.
- No `aiRuns` table.
- No human review workflow around AI outputs.
- No prompt/version audit trail.

Safe AI pattern:
- Use a server-only route or Convex action to generate suggestions.
- Build prompt payload from explicit allowlist, never object spread or generic serialization.
- Store raw AI output in an `aiRuns`/`aiRecommendations` record with `status: draft | suggested | reviewed | dismissed`.
- Convert recommendations to `matches.status = "suggested"` only.
- Require broker mutation for `approved`, `introduced`, access grants, NDA-stage movement, or sensitive-data release.
- Log every AI run and every human decision.

# 7. Trust, Permissions, and Audit Review

Current trust boundary:
- Anonymous users blocked by Clerk/Convex.
- Any signed-in Clerk identity can access all Convex buyer/seller data.
- No explicit role enforcement.

Needed:
- `requireAdvisor` should verify Clerk subject/email/org role against an advisor allowlist.
- Add permission helpers: `requireBroker`, `requireAdmin`, later `requireBuyerOwnProfile`, `requireSellerOwnProfile`.
- Keep authorization in Convex mutations/queries, not only UI.
- Do not expose generic `activityLogs.create` to arbitrary client callers for important audit events; audit creation should happen inside domain mutations.

Audit log approach:
- Make audit append-only.
- Fields: `actorUserId`, `actorEmail`, `action`, `entityType`, `entityId`, `before`, `after`, `reason`, `metadata`, `aiRunId`, `createdAt`.
- Use enum-like action names.
- Always log qualification changes, readiness changes, match generation, match approval/rejection, introductions, NDA/access grants, sensitive-data views/downloads later.

# 8. MVP Gap Analysis

Already good:
- Broker-oriented PRD and tech spec.
- App Router + Convex + Clerk foundation.
- Buyer CRUD.
- Seller CRUD.
- Seller readiness scoring.
- Basic activity logging.
- No blockchain/crypto product surface found.

Partially implemented:
- Dashboard: UI only, mock data.
- Matches: schema + mock page only.
- AI matching: dependency + docs only.
- Audit: basic activity feed table, not approval-grade audit.
- Sensitive data safety: UI/documentation intent, not enforceable policy yet.
- Copy localization: central file exists, but hardcoded strings remain.

Missing:
- `convex/matches.ts`.
- `/matches/[id]`.
- `/api/match` or Convex AI action.
- Match approve/reject/stage mutations.
- Live dashboard queries.
- Role-based permissions.
- AI run records and prompt allowlist.
- NDA/access state per match.
- Internal note history.
- Follow-up questions/tasks.

Overbuilt/defer:
- Full public buyer/seller portals.
- File storage/data room.
- NDA e-sign workflow.
- Blockchain/crypto.
- Automated emails.
- Multi-advisor complexity, unless required soon.

Risky:
- `requireAdvisor` is identity-only.
- Mock dashboard/matches can mislead product review.
- Placeholder Convex URL can hide missing env config.
- Free-text `reasonForSale` can contain PII despite UI warning.
- Activity logs lack actor identity and before/after state.

# 9. Recommended MVP Architecture

Domain model:
- `advisors`: user identity/role allowlist.
- `buyers`: current table plus qualification reason, source, status timestamps.
- `sellers`: current table, eventually split from `businesses/mandates`.
- `matches`: current table plus `reviewedBy`, `approvedBy`, `introducedAt`, `rejectedReason`.
- `accessGrants`: buyerId, sellerId/matchId, accessLevel, ndaStatus, approvedBy, grantedAt, revokedAt.
- `aiRuns`: taskType, model, promptVersion, inputHash, sanitizedPayload, output, status, createdBy.
- `notes`: entityType, entityId, body, visibility, createdBy.
- `auditLogs`: append-only structured events.

Modules/folders:
- `convex/authz.ts`: role helpers.
- `convex/audit.ts`: internal audit writer.
- `convex/buyers.ts`, `convex/sellers.ts`: keep, tighten validation.
- `convex/matches.ts`: list/get/generate result upsert/approve/reject/advance.
- `convex/dashboard.ts`: counts and activity summaries.
- `lib/ai/matchingPayload.ts`: explicit allowlist sanitizer.
- `lib/ai/matchingSchema.ts`: response validation.
- `components/matches/*`, `components/dashboard/*`.

Routes/pages:
- `/dashboard`: live stats, pending queues, recent audit.
- `/buyers`, `/buyers/new`, `/buyers/[id]`: keep.
- `/sellers`, `/sellers/new`, `/sellers/[id]`: keep.
- `/matches`: live recommendation/pipeline queue.
- `/matches/[id]`: review AI reasoning, approve/reject, stage intro.
- Later: `/intake/buyer/[token]`, `/intake/seller/[token]` for gated intake links.

API/actions:
- `POST /api/matches/generate` or Convex action `matches.generateForSeller`.
- `matches.approve`, `matches.reject`, `matches.advanceStage`.
- `buyers.updateQualification`, `sellers.updateReadinessStatus`.
- `notes.create`.
- `accessGrants.grant/revoke`.

Permission model:
- V0: only `advisor` role can read/write everything.
- Match/access-changing mutations require `broker` or `admin`.
- Later buyer/seller roles can only read their own intake records and never browse deal data.
- AI service can only read sanitized criteria through dedicated functions.

# 10. Prioritized Next Build Steps

1. Replace `requireAdvisor` with explicit advisor allowlist/role verification.
2. Implement live dashboard queries and wire `/dashboard` to Convex.
3. Add `convex/matches.ts` and replace `/matches` mock data with live records.
4. Add `/matches/[id]` for review, approve/reject, and pipeline advancement.
5. Implement structured audit log v2 before sensitive access changes grow.
6. Add AI run table + de-identified prompt builder + validated AI response.
7. Wire seller "Generate Matches" to create `suggested` matches only.
8. Add access/NDA state per match before any sensitive seller info is shown to buyers.
9. Move remaining hardcoded UI strings into `lib/copy.ts`.
10. Add focused tests or at least validation checks for authz, sanitizer allowlist, and match-stage transitions.

# 11. AI Agents Implementation Blueprint

This product should use AI agents as broker-assistive workers, not autonomous decision-makers. Agents may draft, summarize, score, flag, and recommend. They must not approve introductions, grant sensitive access, qualify a buyer/seller as final, or make deal decisions without William/admin approval.

## 11.1 Recommended Agent Roles

Seller Intake Agent:
- Purpose: turn raw seller intake or advisor notes into structured seller profile suggestions.
- Inputs: seller intake answers, advisor notes, checklist booleans, optional raw transcript.
- Outputs: proposed seller fields, de-identified business summary, missing information list, risk flags.
- Human gate: William approves before creating/updating the seller record or marking seller as qualified.
- Forbidden: no final readiness approval, no buyer recommendations, no disclosure of seller identity.

Buyer Intake Agent:
- Purpose: normalize buyer criteria and identify qualification gaps.
- Inputs: buyer intake answers, budget, sector/geography preferences, funding/experience checklist.
- Outputs: proposed buyer fields, buyer profile summary, missing proof/verification list, follow-up questions.
- Human gate: William approves before creating/updating buyer record or marking buyer as qualified.
- Forbidden: no seller access, no direct seller recommendations to buyer.

Seller Readiness Agent:
- Purpose: score seller preparedness and produce a readiness explanation.
- Inputs: seller checklist, transaction type, financial ranges, years in operation, advisor-safe summary.
- Outputs: readiness score suggestion, readiness label, missing items, recommended next steps.
- Human gate: William confirms score/status before seller moves to qualified.
- Forbidden: no automatic qualification or confidential data release.

Buyer Qualification Agent:
- Purpose: assess buyer seriousness and fit for confidential opportunities.
- Inputs: buyer criteria, financing type, proof-of-funds flag, NDA flag, background-check flag, experience/timeline.
- Outputs: qualification recommendation, concerns, missing requirements, suggested follow-up questions.
- Human gate: William confirms buyer qualification status.
- Forbidden: no qualification status mutation without approval.

Matching Agent:
- Purpose: rank qualified buyers against a qualified seller mandate.
- Inputs: de-identified seller criteria and qualified buyer criteria only.
- Outputs: ranked match recommendations, score, matched criteria, concise reasoning, risk flags.
- Human gate: recommendations are saved as `suggested`; William must approve/reject and control introduction stages.
- Forbidden: no names, emails, phone numbers, businessName, notes, documents, or final approval.

Follow-Up Agent:
- Purpose: draft next-step questions or advisor tasks.
- Inputs: entity state, missing fields, qualification/readiness gaps, recent notes.
- Outputs: proposed follow-up questions, task suggestions, email draft text if email is later added.
- Human gate: William reviews before any message is sent or task is treated as complete.
- Forbidden: no autonomous outbound communication in MVP.

Deal Summary Agent:
- Purpose: summarize a buyer, seller, or match for internal review.
- Inputs: role-appropriate, permission-filtered fields.
- Outputs: internal brief, strengths, concerns, next recommended broker action.
- Human gate: summary is advisory only.
- Forbidden: no legal, valuation, or final transaction advice.

Diligence Checklist Agent:
- Purpose: generate a suggested diligence checklist once a match reaches approved/introduced stages.
- Inputs: transaction type, sector, readiness checklist, match context, access state.
- Outputs: checklist items and priority/rationale.
- Human gate: William approves checklist before sharing externally or using it as official process.
- Forbidden: no legal document generation, no document room access in MVP.

## 11.2 Agent Permission Model

All agent access should be mediated by server-side functions. Agents should never receive raw database rows by default.

Recommended permission layers:
- `advisor`: William/admin user. Can review and approve AI outputs.
- `agent:seller_intake`: can read sanitized seller intake drafts and write draft suggestions.
- `agent:buyer_intake`: can read sanitized buyer intake drafts and write draft suggestions.
- `agent:matching`: can read only allowlisted buyer/seller matching criteria.
- `agent:summary`: can read permission-filtered entity fields and write summaries.
- `agent:follow_up`: can read gaps and notes needed for drafting, but cannot send messages.

Sensitive fields that should be denied to matching agents:
- Buyer/seller `name`
- `email`
- `phone`
- seller `businessName` if it may identify the business
- `notes`
- raw documents or file contents
- access grant records unrelated to the requested match

Agent outputs should land in draft tables or draft status records. Domain mutations that change real workflow state must require a human advisor identity.

## 11.3 Recommended AI Data Model

Add `aiRuns`:
- `taskType`: `seller_intake | buyer_intake | readiness | qualification | matching | follow_up | deal_summary | diligence_checklist`
- `entityType`: `buyer | seller | match | deal | intake`
- `entityId`
- `model`
- `promptVersion`
- `inputHash`
- `sanitizedInput`
- `output`
- `status`: `draft | suggested | accepted | rejected | superseded | failed`
- `createdBy`: advisor user ID or system agent ID
- `reviewedBy`
- `reviewedAt`
- `createdAt`

Add `aiSuggestions` if separate from run storage:
- `aiRunId`
- `suggestionType`
- `targetEntityType`
- `targetEntityId`
- `patch`
- `summary`
- `riskFlags`
- `confidence`
- `status`: `pending_review | accepted | rejected`

Add `followUps`:
- `entityType`
- `entityId`
- `source`: `manual | ai_suggested`
- `question`
- `priority`
- `status`: `suggested | approved | completed | dismissed`
- `createdBy`
- `approvedBy`

Add `accessGrants` before external data sharing:
- `buyerId`
- `sellerId`
- `matchId`
- `accessLevel`: `teaser | confidential_summary | diligence`
- `ndaStatus`
- `approvedBy`
- `grantedAt`
- `revokedAt`

## 11.4 Agent Input/Output Contract Pattern

Each agent should use an explicit schema:
- Input schema: exactly which fields the agent may see.
- Output schema: exactly what the agent may propose.
- Validation: parse and validate model output before storing it.
- Persistence: store original sanitized input, model output, model name, and prompt version.
- Review: require human review before applying output to production entities.

Example Matching Agent input:

```json
{
  "seller": {
    "sellerRef": "seller_abc",
    "sector": "manufacturing",
    "geography": "montreal",
    "revenueRange": "1m_3m",
    "ebitdaRange": "250k_500k",
    "employeeCount": "6_15",
    "yearsInOperation": 12,
    "transactionType": "full_sale",
    "readinessScore": 80,
    "readinessChecklist": {
      "financialStatementsAvailable": true,
      "taxReturnsAvailable": true,
      "leaseDocumentsAvailable": false,
      "corporateDocumentsAvailable": true,
      "ndaSigned": true
    }
  },
  "buyers": [
    {
      "buyerRef": "buyer_xyz",
      "sectorInterest": ["manufacturing"],
      "budgetMin": 1000000,
      "budgetMax": 5000000,
      "geography": ["montreal"],
      "financingType": "mixed",
      "acquisitionExperience": "experienced",
      "acquisitionTimeline": "6_12mo",
      "qualificationChecklist": {
        "proofOfFundsReviewed": true,
        "ndaSigned": true,
        "backgroundCheckComplete": true
      }
    }
  ]
}
```

Example Matching Agent output:

```json
{
  "matches": [
    {
      "buyerRef": "buyer_xyz",
      "score": 88,
      "matchedCriteria": ["sector", "budget", "geography", "timeline"],
      "reasoning": "The buyer's sector focus, target budget, and geography align strongly with this mandate. The buyer is also verified and operating on a near-term acquisition timeline.",
      "riskFlags": ["Confirm financing mix before introduction"]
    }
  ]
}
```

## 11.5 Human Approval Gates

Hard gates:
- Buyer status change to `qualified` or `disqualified`.
- Seller status change to `qualified` or `disqualified`.
- Creating an approved match from an AI suggestion.
- Advancing a match to `introduced`.
- Granting access to any confidential seller information.
- Sending any external communication.
- Creating a diligence checklist that will be shared outside the internal workspace.

Soft gates:
- Applying AI-suggested field cleanup to buyer/seller profiles.
- Accepting AI-generated follow-up questions.
- Accepting AI-generated internal summaries.

Recommended UI pattern:
- AI output appears in a review panel with `Accept`, `Edit`, `Reject`, and `Regenerate`.
- Accepted output runs a normal human-authenticated mutation.
- Rejected output records a rejection reason for future prompt tuning.

## 11.6 Agent Orchestration Flow

Seller intake flow:
1. Advisor enters or imports seller intake.
2. Seller Intake Agent creates a draft seller profile and missing-info questions.
3. Seller Readiness Agent creates readiness recommendation.
4. William reviews and applies selected fields/questions.
5. William manually sets qualification status.
6. Audit log records applied AI suggestions and human status decision.

Buyer intake flow:
1. Advisor enters or imports buyer intake.
2. Buyer Intake Agent creates draft buyer profile and missing-info questions.
3. Buyer Qualification Agent creates qualification recommendation.
4. William reviews and applies selected fields/questions.
5. William manually sets qualification status.
6. Audit log records applied AI suggestions and human status decision.

Matching flow:
1. William opens a qualified seller.
2. System fetches qualified buyers.
3. Matching Agent receives sanitized allowlisted payload.
4. AI recommendations are stored as `matches.status = suggested` or `aiSuggestions.pending_review`.
5. William reviews each recommendation.
6. William approves/rejects.
7. Only approved matches can move to staged introduction.

Follow-up flow:
1. Agent detects missing readiness/qualification data or stale match stage.
2. Agent drafts follow-up questions or task suggestions.
3. William approves, edits, or rejects.
4. In MVP, no outbound communication happens automatically.

## 11.7 Audit Events for Agents

Add audit events for:
- `ai_run_created`
- `ai_run_failed`
- `ai_suggestion_created`
- `ai_suggestion_accepted`
- `ai_suggestion_rejected`
- `ai_profile_patch_applied`
- `ai_match_suggested`
- `match_approved_by_human`
- `match_rejected_by_human`
- `access_granted_by_human`
- `access_revoked_by_human`
- `follow_up_suggested`
- `follow_up_approved`
- `follow_up_dismissed`

Each event should include:
- actor: advisor user ID or agent/system ID
- reviewer: human reviewer where applicable
- entity and entity ID
- AI run ID where applicable
- before/after state for applied changes
- timestamp

## 11.8 Recommended Implementation Sequence for Agents

1. Build `convex/authz.ts` and stronger advisor role enforcement.
2. Build structured `auditLogs` or upgrade current `activityLogs`.
3. Add `aiRuns` and `aiSuggestions` schema.
4. Add sanitizers and allowlisted payload builders under `lib/ai/`.
5. Implement Matching Agent first because the schema already anticipates matches.
6. Add match review UI with explicit approve/reject.
7. Add Buyer Qualification and Seller Readiness agents.
8. Add Follow-Up Agent for draft questions/tasks.
9. Add Seller/Buyer Intake agents only when intake links or raw intake imports are ready.
10. Add Diligence Checklist Agent after match pipeline and access grants are stable.

# 12. Files Inspected

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `app/layout.tsx`
- `components/providers/convex-client-provider.tsx`
- `components/layout/sidebar.tsx`
- `convex/schema.ts`
- `convex/auth.config.ts`
- `convex/activityLogs.ts`
- `convex/buyers.ts`
- `convex/sellers.ts`
- `app/dashboard/page.tsx`
- `app/matches/page.tsx`
- `app/buyers/page.tsx`
- `app/buyers/new/page.tsx`
- `app/buyers/[id]/page.tsx`
- `app/sellers/page.tsx`
- `app/sellers/new/page.tsx`
- `app/sellers/[id]/page.tsx`
- `components/buyers/buyer-form.tsx`
- `components/sellers/seller-form.tsx`
- `lib/constants.ts`
- `lib/copy.ts`
- `docs/internal/wama-prd.md`
- `docs/internal/wama-tech-spec.md`
- `docs/internal/wama-session-resume.md`
- `docs/internal/session-log.md`

# 13. Questions for Product Owner

1. Is V0 truly single-user William only, or should the next pass support multiple internal advisors/admins?
2. Should buyer/seller intake stay advisor-entered for MVP, or should private intake links be added soon?
3. What is the minimum NDA/access gate for MVP: boolean checklist only, or match-level access approval records?
4. Should AI matching use Anthropic only, or should the architecture abstract providers from the start?
5. Should `businessName` remain an internal code name, or will it sometimes be the actual company name and require stricter masking?
