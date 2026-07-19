# WAMA security remediation and deployment controls

Updated: 2026-07-18

This document describes implemented technical controls and remaining operational decisions. It is not legal advice and does not claim that WAMA is fully secure or legally compliant.

## Executive TL;DR

**Current status:** WAMA's major application-level security issues have been remediated, including administrator impersonation, role bypasses, excessive buyer/seller data exposure, and unnecessary disclosure to AI providers. Security tests, linting, type checks, production builds, and the high-severity dependency audit pass.

**Key issues corrected:**

- Removed the email-spoofing path that allowed an authenticated user to assign themselves an administrator role.
- Replaced stored-role-only checks with trusted, live Clerk identity verification on privileged Convex operations.
- Prevented buyers and sellers from creating the opposite profile type, bypassing onboarding, or setting advisor-only verification and approval fields.
- Reviewed and restricted API routes and Convex functions, returning explicit least-privilege records instead of complete database rows.
- Added server-enforced progressive disclosure so buyers cannot see seller identity or deal details before the required approval and NDA stages.
- Minimized AI payloads by excluding names, contact details, internal IDs, notes, exact financial values, verification data, and uploaded documents.
- Added AI request limits, concurrency controls, deduplication, prompt-injection boundaries, output validation, and generic error responses.
- Added semantic input validation, safer audit logging, security headers and CSP, dependency updates, and automated security regression tests.
- Confirmed that the current application has no document-upload feature; malware scanning and private-file access controls must be implemented before uploads are introduced.

**Readiness:** The application is suitable for local testing with synthetic data. It is **not yet ready for real confidential client information** because production identity settings, infrastructure controls, AI-provider terms, privacy procedures, and independent security verification still require completion.

Before introducing real client information, complete these actions in order:

1. Review, commit, and deploy the complete remediation change set to an isolated staging environment.
2. Configure immutable `ADMIN_CLERK_IDS`, require administrator MFA, and verify Clerk session and JWT settings.
3. Run the read-only administrator/profile ownership audit and resolve every unexplained anomaly.
4. Confirm production separation, access controls, backups, monitoring, HTTPS/HSTS, rate limiting, and secret rotation.
5. Approve the AI provider's no-training, retention, region, subprocessors, deletion, and contractual terms.
6. Obtain Québec privacy/legal review of notices, consent, AI disclosure, retention, deletion, access/correction, cross-border processing, and incident response.
7. Complete an independent penetration test and remediate all critical and high-severity findings.
8. Run a limited beta using a small number of consented, lower-sensitivity records before broader production use.

**Go-live gate:** Do not load real confidential client data until administrator MFA and trusted IDs are active, the data audit is clean, production systems and secrets are isolated, AI and privacy terms are approved, incident and retention procedures exist, and no critical or high-severity penetration-test findings remain open.

## Trusted administrator setup

Every privileged Convex operation now revalidates the signed Clerk identity through `convex/authz.ts`. A stored database role is not sufficient.

Configure these values in each Convex deployment:

- `ADMIN_CLERK_IDS`: comma-separated immutable Clerk user IDs. This is the preferred authority and must contain William's production Clerk subject before production use.
- `ADMIN_EMAILS`: transitional fallback only. It works only when Clerk's signed Convex JWT contains both `email` and `email_verified: true`.
- `CLERK_JWT_ISSUER_DOMAIN`: the production Clerk issuer.

Configure the Clerk `convex` JWT template to include the verified email claims if the email fallback is temporarily required. Remove `ADMIN_EMAILS` after `ADMIN_CLERK_IDS` is confirmed.

Require MFA for every administrator in Clerk. Prefer a Clerk organization role or immutable custom JWT claim in a future hardening pass.

## Existing-data security audit

The audit is read-only and does not remove or modify profiles. Invoke it with a trusted administrator identity:

```bash
npx convex run users:auditSecurityState '{}' --identity '{"subject":"CLERK_ADMIN_USER_ID"}'
```

It reports stored admin users, whether their subjects match `ADMIN_CLERK_IDS`, conflicting buyer/seller ownership, duplicate profiles, and profiles without owners. Ownerless profiles may be legitimate advisor-created records and require manual review.

After reviewing the dry-run output and confirming `ADMIN_CLERK_IDS`, explicitly downgrade untrusted stored admins with:

```bash
npx convex run users:remediateInvalidAdminRoles '{"confirmation":"DOWNGRADE_UNTRUSTED_ADMINS"}' --identity '{"subject":"CLERK_ADMIN_USER_ID"}'
```

This remediation only changes untrusted `admin` roles to `unassigned`. It never deletes or reassigns profiles. Conflicting, duplicate, or ownerless profiles require case-by-case decisions.

## Current authorization and onboarding behavior

- New authenticated users synchronize from signed Clerk claims and begin `unassigned`.
- Selecting buyer or seller intent leaves the role unassigned while onboarding is in progress.
- Intent cannot be switched once selected or after a profile is submitted.
- Self-service creation requires the matching in-progress intent, rejects duplicates, assigns the corresponding role, and moves the record to `submitted`.
- Submitted self-service profiles cannot be edited unless a future advisor-controlled reopen workflow is implemented.
- Buyer and seller self-service schemas exclude verification, NDA, background-check, qualification, readiness, document, deal, and internal-note fields.
- Advisor create/update/review functions revalidate the trusted administrator identity.

## AI data flow and field inventory

```text
Browser
  -> Clerk authentication and signed Convex JWT
  -> trusted administrator check in Convex
  -> seller and qualified buyers read inside WAMA
  -> deterministic local shortlist (sector, geography, budget compatibility, time in business)
  -> configured candidate cap (default 12, hard maximum 25)
  -> minimized structured JSON with one-time random references
  -> Anthropic, OpenAI, or OpenRouter
  -> schema and one-time-reference validation
  -> deterministic internal explanation generated by WAMA
  -> hidden match record
  -> human administrator review
  -> tiered buyer disclosure
```

Sensitive fields retained inside WAMA include identity/contact data, exact budgets and capital amounts, source of funds, verification states, seller identity, sale narrative, internal notes, match notes, and deal metadata.

Fields permitted to leave WAMA for AI matching are limited to:

- Seller: one-time reference, sector, broad geography enum, revenue range, EBITDA range, employee band, years-in-operation band, transaction type.
- Buyer: one-time reference, sector-interest enums, broad geography enums, budget bands, financing type, acquisition-experience enum, timeline enum, target-value band, minimum-EBITDA band, minimum employees, minimum time in business.

Names, emails, phones, Clerk IDs, Convex IDs, notes, source of funds, down payment, exact money values, background checks, proof-of-funds data, seller reason-for-sale narrative, and uploaded documents are prohibited from the AI payload. Raw prompts are not logged by application code. Provider-side logging and retention remain account-configuration questions.

## AI abuse controls

Persistent Convex reservations enforce administrator authorization, per-actor hourly and daily limits, global concurrency, per-seller locks, and ten-minute identical-request deduplication. Configuration:

- `AI_CANDIDATE_LIMIT` (default 12, maximum 25)
- `AI_HOURLY_REQUEST_LIMIT` (default 5)
- `AI_DAILY_REQUEST_LIMIT` (default 20)
- `AI_GLOBAL_CONCURRENCY_LIMIT` (default 2)

The route also enforces a 2 KiB request body, 45-second total model timeout, 1,500 output-token limit, capped output count, generic public errors, and correlation IDs. Logs contain no prompt or profile payload.

## Progressive buyer disclosure

- `hidden`: no buyer response.
- `teaser_shared`: de-identified sector, broad geography, revenue range, and transaction type.
- `nda_required`: same minimal teaser plus a derived NDA action.
- `intro_approved`: only for a qualified buyer with advisor-verified NDA; adds EBITDA band, employee band, and years band.
- `introduced`: same prerequisites; adds business name and reason-for-sale. Direct seller contact details are still withheld.

Access transitions are server validated. A match is hidden by default after AI creation and is never automatically released.

## Privacy lifecycle foundation

The schema now supports privacy-notice acknowledgement dates, AI-processing acknowledgement dates, retention review dates, deletion request dates, and tracked export/correction/deletion requests. These are workflow foundations only. No legal notice text or lawful basis has been invented, and deletion is not automatic. Provider deletion propagation remains marked pending until an operator completes and records it.

## Deployment checklist

### Before merge

- [ ] Review this change set and security tests.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm audit --omit=dev`.
- [ ] Confirm no real client data appears in tests, logs, or documentation.
- [ ] Review every schema change; all are additive except authorization behavior.
- [ ] Add CI checks for lint, typecheck, tests, build, secret scanning, and `npm audit --omit=dev --audit-level=high`.

### Before staging

- [ ] Set `ADMIN_CLERK_IDS` in the staging Convex deployment.
- [ ] Verify the Clerk issuer and `convex` JWT template claims.
- [ ] Run the read-only security audit and manually investigate every anomaly.
- [ ] Test CSP, Clerk sign-in, Convex WebSocket connections, and all portals in a real browser.
- [ ] Confirm hosting HTTPS and HSTS behavior.
- [ ] Set conservative AI limits and use synthetic profiles only.

### Before limited beta

- [ ] Enforce administrator MFA in Clerk.
- [ ] Confirm session duration, revocation, email verification, bot protection, and production/development instance separation.
- [ ] Confirm Convex dashboard access, backups, regions, logs, and production environment separation.
- [ ] Confirm AI provider no-training/retention settings, processing region, subprocessors, and deletion process.
- [ ] Execute required DPAs and complete a privacy impact assessment.
- [ ] Conduct an external penetration test covering Clerk, Convex, CSP, and authorization.
- [ ] Implement and rehearse incident response.

### Before real confidential client data

- [ ] Obtain qualified Québec privacy counsel review.
- [ ] Approve privacy policy, terms, collection notices, consent/acknowledgement language, and AI disclosure.
- [ ] Approve retention, deletion, correction, export, backup deletion, and legal-hold procedures.
- [ ] Confirm cross-border processing assessments and written agreements.
- [ ] Confirm breach registers and regulatory/client notification procedures.
- [ ] Complete the administrator-role and profile-ownership audit with no unexplained anomalies.
- [ ] Verify production monitoring and sensitive-access review.

### Ongoing

- [ ] Monthly: dependency and secret scan, privileged-user review, AI usage/cost review, failed authorization review.
- [ ] Quarterly: access recertification, retention review, restore test, incident exercise, vendor/subprocessor review.
- [ ] Annually or after material change: penetration test and privacy impact assessment refresh.

## Remaining decisions and external blockers

- Clerk: MFA policy, organization/custom-role design, verified JWT claims, sessions, bot/account protection, and webhook lifecycle.
- Convex: production environment values, region, dashboard permissions, backup retention, monitoring, and production data audit.
- Hosting: CSP validation, HSTS at the edge, deployment-log access, WAF/rate controls, and incident alerting.
- AI providers: chosen provider/model, retention/no-training configuration, regions, subprocessors, DPA, deletion, and whether OpenRouter is acceptable for confidential work.
- Product: advisor-controlled reopen workflow, NDA signing system of record, precise disclosure fields after introduction, and handling of advisor-created ownerless profiles.
- Privacy/legal: lawful basis, notice and consent wording, retention periods, portability/export content, deletion exceptions, breach process, cross-border assessment, and Québec counsel approval.

The remaining Next.js-bundled PostCSS production advisory is currently reported by npm as moderate with no available fix. Monitor Next.js releases and update promptly when a patched supported version is available.
