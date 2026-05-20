# WAMA Platform — Product Requirements Document
## V0: Internal Advisor Tool

**Version:** 1.0  
**Status:** Ready for build  
**Build target:** V0 — single advisor, no buyer/seller login  

---

## 1. Product Overview

A secure internal tool for a boutique M&A advisor to prequalify buyers and sellers, track deal readiness, and generate AI-assisted match recommendations for SME buy-sell transactions.

**One-line description:**  
The qualification and matching brain for a boutique M&A advisor — before any documents change hands.

**What this is not:**  
- A marketplace or listing platform  
- A document room  
- A public-facing product  

---

## 2. Problem Statement

Boutique M&A advisors managing SME transactions manually track buyer criteria, seller profiles, and potential matches across spreadsheets and email threads. There is no structured way to:

- Systematically qualify buyers and sellers before investing time in introductions
- Compare buyer criteria against seller profiles at scale
- Maintain an audit-ready record of who was qualified, when, and why
- Get a structured AI recommendation on match quality without exposing sensitive identity data

---

## 3. Users

### V0: Single user
- **William (Advisor)** — the only person who logs in. He creates all buyer and seller profiles manually. He reviews AI match suggestions and manages the pipeline.

### Future (V1+)
- Buyers and sellers will receive intake links and log in with limited access to their own profiles only.

---

## 4. Core Flows

### 4.1 Buyer Profile Creation
1. Advisor navigates to `/buyers/new`
2. Fills in structured form: name, contact info, acquisition criteria, financial readiness, timeline
3. Saves profile — status defaults to `pending`
4. Advisor reviews and changes status to `qualified` or `disqualified`

### 4.2 Seller Profile Creation
1. Advisor navigates to `/sellers/new`
2. Fills in structured form: business name, sector, financials, transaction type, document readiness checklist
3. Saves profile — status defaults to `pending`
4. Advisor reviews and changes status to `qualified` or `disqualified`

### 4.3 AI Match Generation
1. Advisor opens a seller profile and clicks "Generate Matches"
2. System pulls all `qualified` buyers from the database
3. Server-side route sends de-identified structured data to Claude API (no names, emails, or documents)
4. Claude returns a ranked list of buyers with a compatibility score (0–100) and a plain-language explanation for each
5. Results are saved as `suggested` matches
6. Advisor reviews the recommendations and approves or rejects each one

### 4.4 Pipeline Management
1. Approved matches appear in `/matches` with status `approved`
2. Advisor manually advances pipeline stages: `approved` → `introduced` → `nda_signed` → `in_discussions` → `closed_won` / `closed_lost`
3. Each stage change is logged in `activityLogs`

### 4.5 Dashboard
- Summary stats: total buyers, sellers, pending qualifications, active matches, pipeline stage breakdown
- Recent activity feed from `activityLogs`
- Quick links to pending profiles

---

## 5. Feature Scope

### ✅ In V0

| Feature | Notes |
|---|---|
| Advisor authentication | Clerk, single user |
| Buyer profile CRUD | Manual data entry by advisor |
| Seller profile CRUD | Manual data entry by advisor |
| Qualification status | pending / qualified / disqualified |
| Document readiness checklist | Checkbox fields only — no file upload |
| Advisor dashboard | Stats + recent activity |
| AI match generation | Structured data only, de-identified |
| Match review (approve/reject) | Advisor-controlled |
| Pipeline stage tracking | 6 stages |
| Basic activity log | Key events only |

### ❌ Deferred to V1+

| Feature | Reason |
|---|---|
| Buyer/seller login and portals | V1 — intake links |
| File upload and document storage | V2 — high security complexity |
| NDA workflow | V2 — after document storage |
| Email notifications | V1+ |
| Bilingual UI (French/English) | V1 — content architecture ready in V0 |
| Multi-advisor support | V2+ |
| Full audit log dashboard | V1+ |
| Public marketplace features | Not in roadmap |

---

## 6. Success Criteria for V0

- William can create a buyer profile in under 3 minutes
- William can create a seller profile in under 3 minutes
- AI match generation returns at least 3 ranked buyers for a given seller in under 10 seconds
- Match explanations are readable and actionable (not generic)
- No buyer can see seller data (enforced at data layer, not just UI)
- Advisor can advance a match through all pipeline stages

---

## 7. Content Architecture Notes

All user-facing copy (form labels, status labels, navigation, placeholder text) must be stored in a central constants or copy file — not hardcoded inline in components. This enables French translation in V1 without a full refactor.

Suggested: `/lib/copy.ts` — a flat object of all UI strings, keyed by component/section.

---

## 8. Security Principles (non-negotiable)

1. **Role isolation at the data layer** — Convex queries must enforce access rules, not just the UI
2. **AI sees minimized data only** — No names, emails, company names, or documents go into the Claude prompt
3. **Advisor controls all status changes** — No automated qualification or match approval
4. **Activity logging from day one** — Key events logged to `activityLogs` table on every mutation
5. **No document storage in V0** — Document readiness is tracked as boolean checklist fields only

---

## 9. Out of Scope (All Versions)

- Valuation tools or financial modeling
- Legal document generation
- Payment processing
- Public search or browse features
- Automated buyer/seller communication
