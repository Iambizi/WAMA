WAMA PRD v0.1

William-Operated MVP for Private SME Acquisition Matching

1. Overview

WAMA is a private, AI-assisted acquisition network and deal-readiness platform operated initially by William, a boutique M&A advisor based in Montreal, Québec.

The MVP is not designed as a public marketplace or multi-advisor SaaS platform. Instead, it is a William-operated platform that helps qualify sellers, verify buyers, surface potential acquisition matches, and manage deal flow and pipeline progression.

The platform’s main purpose is to help William turn inbound seller and buyer interest into structured, reviewable, advisor-approved opportunities.

WAMA should support three initial user groups:

1. Sellers who may be interested in selling their business.
2. Buyers who are looking for acquisition opportunities.
3. William/admin, who reviews, qualifies, matches, and manages the overall process.

The MVP should focus on readiness, qualification, and controlled matching rather than automated deal execution.

⸻

2. Product Vision

WAMA helps William operate a private, curated acquisition network where sellers can assess their readiness, buyers can apply to become verified acquisition candidates, and William can use AI-assisted workflows to identify and manage high-quality acquisition opportunities.

The long-term vision is to create an AI-powered M&A operating system that improves how SME acquisition opportunities are sourced, qualified, prepared, matched, and managed.

The initial version should prove that:

* Sellers are willing to submit structured business information.
* Buyers are willing to submit acquisition criteria and verification information.
* William can save time reviewing and qualifying both sides.
* AI can help summarize, score, and suggest relevant matches.
* A curated private network can produce better deal flow than an open marketplace.

⸻

3. Problem Statement

Small and medium-sized business acquisition activity is highly relationship-driven, but the process is often messy, manual, and inefficient.

For sellers, many business owners are curious about selling but are not transaction-ready. They often do not know what information buyers need, how prepared their business is, or what steps they should take before approaching the market.

For buyers, finding credible and relevant SME acquisition opportunities can be difficult. Many buyers waste time reviewing businesses that do not match their criteria, size, geography, financing ability, or acquisition strategy.

For William, the advisor/operator, the challenge is managing fragmented buyer and seller information, qualifying serious participants, identifying relevant matches, and progressing opportunities without wasting time on unqualified leads.

WAMA should solve this by creating a structured, private, AI-assisted workflow for acquisition readiness, buyer verification, matching, and deal flow management.

⸻

4. MVP Goals

The MVP should allow William to:

1. Receive structured seller intake submissions.
2. Receive structured buyer applications.
3. Review and qualify sellers.
4. Review and verify buyers.
5. Use AI to generate summaries, readiness indicators, and match suggestions.
6. Approve or reject buyer/seller progression.
7. Manage deal flow and pipeline progression.
8. Control when and how introductions happen.
9. Track the status of buyers, sellers, opportunities, and matches.

The MVP should allow sellers to:

1. Submit basic business and ownership information.
2. Explain their selling motivation and timeline.
3. Provide basic financial and operational information.
4. Understand whether they appear ready, not ready, or need advisor review.
5. Enter William’s private advisory pipeline without needing to pay upfront.

The MVP should allow buyers to:

1. Submit an acquisition profile.
2. Define acquisition criteria.
3. Provide financing and seriousness indicators.
4. Apply to become a verified buyer.
5. Potentially access curated opportunities after William approval.

⸻

5. Non-Goals

The MVP should not include:

* Multi-advisor support.
* Public marketplace listings.
* Automated buyer/seller introductions without William approval.
* In-platform deal closing.
* Escrow or payment handling.
* Transaction-based success fees processed by the platform.
* Legal document negotiation.
* Full virtual data room functionality.
* AI-generated official valuations.
* Seller paid subscriptions.
* Complex CRM integrations.
* Buyer-to-seller direct messaging without admin control.
* Regulatory, tax, legal, or investment advice.

The platform should not present itself as a licensed broker, securities dealer, investment advisor, law firm, accountant, or valuation provider.

⸻

6. Target Users

6.1 William / Admin

William is the initial operator and main internal user of the platform.

He needs to:

* Review seller submissions.
* Review buyer applications.
* Qualify or reject users.
* Understand seller readiness.
* Understand buyer seriousness.
* See AI-assisted match suggestions.
* Approve introductions.
* Manage deal flow and pipeline progression.
* Track the status of each opportunity.
* Maintain control over the advisory relationship.

6.2 Sellers

Sellers are business owners who may be interested in selling their business, planning succession, exploring acquisition interest, or understanding how ready they are for a potential transaction.

They may be:

* Curious but not ready.
* Actively looking to sell.
* Considering retirement or succession.
* Seeking a strategic buyer.
* Seeking partial exit or majority sale.
* Unsure what their business may be worth.
* Unsure what information buyers will need.

Sellers should not be forced to pay at the beginning of the funnel.

6.3 Buyers

Buyers are individuals, groups, investors, operators, searchers, or companies interested in acquiring SMEs.

They may include:

* Individual acquisition entrepreneurs.
* Search fund-style buyers.
* Independent sponsors.
* Strategic buyers.
* Small private investors.
* Existing business owners looking for acquisitions.
* Private equity-style buyers focused on smaller deals.

Buyers should be able to apply for free, but paid verified buyer membership may become the first major subscription revenue layer.

⸻

7. Business Model Assumptions

7.1 Initial Model

The initial business model should be:

* Free seller intake.
* Free buyer application.
* William-operated review and advisory process.
* Paid verified buyer membership introduced once there is enough opportunity quality.
* Optional seller readiness/preparation packages later.
* William’s advisory services remain separate from the platform.

7.2 Buyer Monetization

Buyer monetization should be framed as verified membership and curated access, not as paying to browse an open marketplace.

Possible buyer value propositions:

* Become a verified buyer.
* Receive curated advisor-approved opportunities.
* Save acquisition criteria.
* Receive relevant opportunity alerts.
* Access anonymized seller teasers when approved.
* Request introductions through William.
* Improve acquisition profile and readiness.

7.3 Seller Monetization

Seller monetization should not be part of the initial MVP.

Potential future seller products:

* Business readiness report.
* Exit preparation plan.
* Document readiness package.
* Valuation preparation guidance.
* Advisor consultation.
* Premium readiness review.

7.4 Future Advisor SaaS

WAMA may later become SaaS for other boutique M&A advisors, but this is not part of the MVP.

The MVP should first prove the workflow with William as the sole advisor/operator.

⸻

8. Core User Journeys

8.1 Seller Flow

Primary Flow

1. Seller lands on WAMA.
2. Seller learns that WAMA helps business owners assess acquisition readiness.
3. Seller starts seller intake.
4. Seller submits business profile information.
5. Seller submits motivation and timeline.
6. Seller submits basic financial and operational information.
7. Platform generates an internal seller summary.
8. Platform generates readiness indicators.
9. William reviews seller profile.
10. William assigns a status:

* New
* Needs review
* Qualified
* Not ready
* Follow up later
* Rejected

11. William decides whether to contact the seller.
12. Seller enters William’s deal flow/pipeline if relevant.

Seller Outcome States

A seller can be:

* Not reviewed.
* Under review.
* Qualified.
* Not ready.
* Needs more information.
* Follow-up later.
* Rejected.
* Matched to potential buyers.
* Intro approved.
* In active advisory process.

⸻

8.2 Buyer Flow

Primary Flow

1. Buyer lands on WAMA.
2. Buyer learns that WAMA offers access to curated acquisition opportunities.
3. Buyer starts buyer application.
4. Buyer submits identity and contact information.
5. Buyer submits acquisition criteria.
6. Buyer submits financing information.
7. Buyer submits experience and seriousness indicators.
8. Platform generates an internal buyer summary.
9. Platform generates buyer fit and seriousness indicators.
10. William reviews buyer profile.
11. William assigns a status:

* New
* Needs review
* Verified
* Needs more information
* Rejected
* Follow up later

12. Verified buyers may become eligible for curated opportunities.
13. Paid verified membership may later unlock additional access or priority.

Buyer Outcome States

A buyer can be:

* Not reviewed.
* Under review.
* Needs more information.
* Verified.
* Rejected.
* Inactive.
* Paid verified member.
* Matched to potential sellers.
* Intro requested.
* Intro approved.
* In active opportunity review.

⸻

8.3 William/Admin Flow

Primary Flow

1. William logs into admin dashboard.
2. William reviews new seller submissions.
3. William reviews new buyer applications.
4. William sees AI-generated summaries.
5. William sees readiness and verification indicators.
6. William sees AI-assisted fit/match suggestions.
7. William prioritizes qualified opportunities.
8. William approves, rejects, or delays users.
9. William approves introductions.
10. William manages deal flow and pipeline progression.
11. William tracks status changes across buyers, sellers, matches, and opportunities.

Admin Outcome States

William should be able to:

* See all new submissions.
* Filter buyers and sellers.
* Search by criteria.
* Review AI summaries.
* Override AI suggestions.
* Assign statuses.
* Add internal notes.
* Create match records.
* Approve or reject introductions.
* Track pipeline stage.
* Manage follow-ups.

⸻

9. Functional Requirements

9.1 Authentication and Roles

The platform should support the following roles:

Seller

Can:

* Create seller profile.
* Submit seller intake.
* Edit own profile before submission.
* View basic submission status.
* Receive next-step messaging.

Cannot:

* View buyers.
* Browse opportunities.
* Contact buyers directly.
* See AI match suggestions.

Buyer

Can:

* Create buyer profile.
* Submit buyer application.
* Edit acquisition criteria.
* View application status.
* View approved opportunities only if William grants access.
* Request interest in an approved opportunity.

Cannot:

* Browse all sellers by default.
* Contact sellers directly.
* See seller-identifying information unless approved.
* Bypass William.

Admin / William

Can:

* View all buyers.
* View all sellers.
* View all AI summaries.
* View readiness indicators.
* View match suggestions.
* Approve/reject users.
* Approve/reject intros.
* Manage deal flow and pipeline.
* Add internal notes.
* Update statuses.
* Control access.

⸻

9.2 Seller Intake

Seller intake should collect:

Business Basics

* Business name.
* Industry.
* Location.
* Year founded.
* Number of employees.
* Ownership structure.
* Website.
* Short business description.

Financial Snapshot

* Annual revenue range.
* EBITDA or profit range.
* Revenue trend.
* Customer concentration.
* Recurring revenue percentage if applicable.
* Debt level range.
* Whether financial statements are available.

Sale Motivation

* Reason for considering sale.
* Desired timeline.
* Full sale vs partial sale.
* Willingness to stay post-acquisition.
* Succession concerns.
* Ideal buyer type.

Readiness Indicators

* Are financials clean and up to date?
* Are tax filings current?
* Are contracts organized?
* Are employee agreements documented?
* Are customer contracts transferable?
* Are there legal disputes?
* Are there key-person dependencies?
* Has the owner received previous offers?

Document Availability

* Financial statements.
* Tax returns.
* Corporate documents.
* Customer contracts.
* Employee agreements.
* Lease agreements.
* Debt documents.
* Operational reports.

For MVP, document upload can be optional or limited. A simple document readiness checklist may be enough for v1.

⸻

9.3 Buyer Application

Buyer application should collect:

Buyer Basics

* Name.
* Email.
* Phone.
* Location.
* Buyer type:
    * Individual buyer
    * Strategic buyer
    * Existing business owner
    * Searcher
    * Independent sponsor
    * Investor group
    * Other
* Company name, if applicable.
* Website or LinkedIn.

Acquisition Criteria

* Target industries.
* Target geography.
* Revenue range.
* EBITDA/profit range.
* Deal size range.
* Preferred ownership structure:
    * Full acquisition
    * Majority acquisition
    * Minority investment
    * Partnership
    * Asset purchase
    * Other
* Preferred seller involvement post-sale.
* Timeline to acquire.
* Number of deals currently reviewing.
* Past acquisition experience.

Financing and Seriousness

* Available capital range.
* Financing source:
    * Cash
    * Bank financing
    * Investor-backed
    * Seller financing expected
    * Not yet secured
* Proof of funds available?
* Financing pre-approval available?
* Acquisition team members.
* Advisor/lawyer/accountant involved?
* NDA willingness.
* Reason for acquiring.

⸻

9.4 Admin Dashboard

The admin dashboard should include:

Dashboard Overview

* New seller submissions.
* New buyer applications.
* Sellers needing review.
* Buyers needing review.
* Qualified sellers.
* Verified buyers.
* Suggested matches.
* Active opportunities.
* Follow-ups due.
* Pipeline summary.

Seller Management

Admin should be able to:

* View seller list.
* Filter by status.
* Filter by industry.
* Filter by geography.
* Filter by revenue range.
* Filter by readiness score.
* Open seller profile.
* View AI summary.
* View readiness indicators.
* Add internal notes.
* Update seller status.
* Mark seller as qualified, not ready, rejected, or follow-up later.

Buyer Management

Admin should be able to:

* View buyer list.
* Filter by status.
* Filter by buyer type.
* Filter by geography.
* Filter by acquisition criteria.
* Filter by capital range.
* Open buyer profile.
* View AI summary.
* View verification indicators.
* Add internal notes.
* Update buyer status.
* Mark buyer as verified, rejected, needs more info, or follow-up later.

Match Management

Admin should be able to:

* View suggested matches.
* See match rationale.
* Compare seller profile to buyer criteria.
* Approve match.
* Reject match.
* Save match for later.
* Create opportunity record.
* Approve introduction.
* Track introduction status.

Deal Flow and Pipeline

Admin should be able to manage opportunity stages such as:

* New opportunity.
* Under review.
* Seller qualified.
* Buyer identified.
* Match suggested.
* Intro approved.
* NDA stage.
* Initial conversation.
* Information shared.
* Buyer reviewing.
* LOI discussion.
* In diligence.
* Closed.
* Lost.
* Paused.
* Follow-up later.

The MVP does not need to support full transaction execution, but it should allow William to track where an opportunity stands.

⸻

10. AI-Assisted Features

AI should support William’s workflow but should not make final decisions automatically.

10.1 Seller Summary

Given seller intake data, AI should generate:

* Plain-language business summary.
* Seller motivation summary.
* Key strengths.
* Potential red flags.
* Missing information.
* Readiness assessment.
* Suggested follow-up questions.

10.2 Buyer Summary

Given buyer application data, AI should generate:

* Buyer profile summary.
* Acquisition criteria summary.
* Financing seriousness indicators.
* Experience indicators.
* Potential concerns.
* Suggested follow-up questions.

10.3 Readiness Indicators

AI may assist in identifying readiness categories:

* Financial readiness.
* Legal/document readiness.
* Operational readiness.
* Owner motivation clarity.
* Buyer-fit clarity.
* Overall review priority.

The output should be framed as internal guidance for William, not as official advice to the user.

10.4 Match Suggestions

AI should compare seller profiles against buyer criteria and suggest potential matches.

Each match suggestion should include:

* Match score or fit level.
* Why the buyer may be relevant.
* Where the seller fits the buyer’s criteria.
* Criteria mismatches.
* Risks or caveats.
* Suggested next step.

AI should not automatically reveal seller information to buyers.

William must approve all matches and introductions.

10.5 Follow-Up Question Generation

AI should suggest follow-up questions for:

* Sellers missing key readiness information.
* Buyers with unclear financing.
* Buyers with vague acquisition criteria.
* Sellers with unclear motivation.
* Opportunities with mismatched expectations.

⸻

11. Data Model / Core Entities

11.1 User

Fields:

* ID
* Name
* Email
* Phone
* Role
* Status
* Created date
* Last updated date

Roles:

* Seller
* Buyer
* Admin

11.2 Seller Profile

Fields:

* ID
* User ID
* Business name
* Industry
* Location
* Description
* Revenue range
* EBITDA/profit range
* Employee count
* Sale motivation
* Timeline
* Desired transaction type
* Readiness responses
* Document readiness checklist
* AI summary
* Readiness indicators
* Admin status
* Admin notes
* Created date
* Last updated date

11.3 Buyer Profile

Fields:

* ID
* User ID
* Buyer type
* Company name
* Acquisition criteria
* Target industries
* Target geography
* Revenue range
* EBITDA/profit range
* Deal size range
* Financing status
* Capital range
* Acquisition experience
* AI summary
* Verification indicators
* Admin status
* Admin notes
* Created date
* Last updated date

11.4 Match

Fields:

* ID
* Seller profile ID
* Buyer profile ID
* Match score or fit level
* AI match rationale
* Criteria matches
* Criteria mismatches
* Admin status
* Admin notes
* Intro status
* Created date
* Last updated date

11.5 Opportunity / Pipeline Record

Fields:

* ID
* Seller profile ID
* Buyer profile ID, optional
* Match ID, optional
* Pipeline stage
* Priority
* Next step
* Follow-up date
* Internal notes
* Created date
* Last updated date

11.6 Admin Note

Fields:

* ID
* Related entity type
* Related entity ID
* Admin user ID
* Note content
* Created date
* Last updated date

⸻

12. Permissions and Access Control

The platform should be designed around strict permission boundaries.

Sellers

Sellers should only access their own profile and submission status.

Buyers

Buyers should only access their own profile and opportunities specifically approved by William.

Admin

Admin can access all buyer, seller, match, and opportunity data.

Opportunity Access

Seller-identifying information should not be shown to buyers unless William explicitly grants access.

The MVP should prioritize controlled visibility over open browsing.

⸻

13. Compliance, Privacy, and Risk Assumptions

WAMA should be positioned as a software and advisory workflow platform operated by William.

The platform should not claim to provide:

* Legal advice.
* Tax advice.
* Investment advice.
* Securities advice.
* Broker-dealer services.
* Official valuation services.
* Financing guarantees.
* Guaranteed buyer or seller matches.

The platform should include:

* Terms of service.
* Privacy policy.
* Consent language for data processing.
* Clear disclaimers around AI-generated outputs.
* Admin-only AI decision support.
* User consent for storing sensitive business information.
* Role-based access controls.
* Audit trail for admin actions.
* Secure handling of financial and business data.

Important compliance considerations:

* Québec Law 25.
* Canadian privacy requirements.
* Cross-border data transfer if U.S. expansion occurs.
* U.S. broker-dealer/finder rules if WAMA later operates directly in the U.S.
* Securities law analysis if transactions involve shares, securities, or transaction-based compensation.
* Avoiding custody or movement of funds in MVP.

⸻

14. UX Principles

The platform should feel:

* Trustworthy.
* Private.
* Professional.
* Curated.
* Advisor-led.
* Simple for sellers.
* Serious for buyers.
* Efficient for William.

The product should not feel like:

* A public listing marketplace.
* A casual business-for-sale directory.
* A crypto/blockchain product.
* An automated broker.
* A generic CRM.
* A legal or valuation engine.

The key UX message should be:

WAMA helps serious buyers and business owners connect through a private, advisor-led acquisition process.

⸻

15. MVP Feature List

15.1 Must Have

* Landing page explaining WAMA.
* Seller intake form.
* Buyer application form.
* User authentication.
* Seller profile creation.
* Buyer profile creation.
* William/admin dashboard.
* Seller review interface.
* Buyer review interface.
* Admin statuses.
* Internal admin notes.
* AI-generated seller summaries.
* AI-generated buyer summaries.
* Basic readiness indicators.
* Basic buyer verification indicators.
* AI-assisted match suggestions.
* Match approval/rejection.
* Opportunity/pipeline tracking.
* Role-based access control.

15.2 Should Have

* Email notifications for new submissions.
* Follow-up reminders.
* Basic anonymized seller teaser generation.
* Buyer criteria search/filtering.
* Seller search/filtering.
* Exportable summary report.
* NDA status tracking.
* Simple opportunity activity timeline.
* Admin-created follow-up questions.

15.3 Could Have

* Document upload.
* Buyer paid membership.
* Stripe billing.
* Advanced readiness scoring.
* Advanced match scoring.
* Branded PDF reports.
* Calendar integration.
* CRM import.
* Automated email templates.
* Buyer opportunity alerts.
* Seller readiness dashboard.

15.4 Not MVP

* Multi-advisor accounts.
* White-label advisor portals.
* Escrow/payment flows.
* Direct buyer-seller messaging.
* Public marketplace browsing.
* In-platform LOI negotiation.
* Full data room.
* Transaction closing workflow.
* Automated valuation engine.
* Broker commission management.

⸻

16. Success Metrics

16.1 Seller Metrics

* Number of seller submissions.
* Percentage of completed seller intakes.
* Percentage of qualified sellers.
* Percentage of sellers marked not ready.
* Average readiness score.
* Number of sellers moved into active pipeline.
* Seller follow-up conversion rate.

16.2 Buyer Metrics

* Number of buyer applications.
* Percentage of completed buyer applications.
* Percentage of verified buyers.
* Percentage of buyers needing more information.
* Buyer willingness to pay for verified membership.
* Number of buyers matched to sellers.
* Buyer response rate to curated opportunities.

16.3 Admin / William Metrics

* Time saved reviewing sellers.
* Time saved reviewing buyers.
* Number of AI summaries generated.
* Number of match suggestions reviewed.
* Match suggestion acceptance rate.
* Number of approved introductions.
* Number of active opportunities.
* Pipeline progression rate.

16.4 Business Metrics

* Buyer application volume.
* Seller submission volume.
* Verified buyer conversion.
* Paid buyer membership conversion.
* Qualified opportunity volume.
* Intro-to-call conversion.
* Opportunity-to-active-process conversion.
* Advisory revenue influenced by platform.

⸻

17. Future Phases

Phase 1: William-Operated MVP

Focus:

* Seller intake.
* Buyer application.
* Admin review.
* AI summaries.
* Basic readiness indicators.
* Basic match suggestions.
* Deal flow and pipeline tracking.

Phase 2: Verified Buyer Membership

Focus:

* Paid buyer plans.
* Buyer dashboard.
* Curated opportunity access.
* Saved acquisition criteria.
* Opportunity alerts.
* Buyer membership management.

Phase 3: Seller Readiness Products

Focus:

* Seller readiness reports.
* Exit preparation plan.
* Document readiness workflow.
* Premium advisory review.
* Paid preparation packages.

Phase 4: Advanced Deal Workspace

Focus:

* NDA workflow.
* Document sharing.
* Permissioned opportunity rooms.
* Buyer activity tracking.
* More advanced pipeline management.

Phase 5: Advisor SaaS Expansion

Focus:

* Multi-advisor support.
* Advisor workspaces.
* White-label portals.
* Advisor billing.
* Team permissions.
* Advisor-specific private networks.

⸻

18. Open Questions

Business Model

1. What will the first paid buyer membership include?
2. What price should verified buyers pay?
3. Should paid membership be monthly, annual, or application-based?
4. Should William charge sellers separately for advisory services outside the platform?
5. Will buyer membership include access to all approved opportunities or only curated matches?

Product Scope

1. Should document upload be part of MVP or phase 2?
2. Should users have accounts immediately, or should intake start as simple forms?
3. Should sellers receive an automated readiness result, or should William review first?
4. Should buyers see any opportunities before being verified?
5. Should AI match scoring be numerical or qualitative?

Compliance

1. What disclaimers are needed on seller and buyer intake?
2. What data can be safely shown to buyers before NDA?
3. What should the NDA workflow look like?
4. What legal review is needed before U.S. buyer participation?
5. What privacy requirements apply to storing sensitive business data?

Operations

1. How often will William review new submissions?
2. What criteria will William use to verify buyers?
3. What criteria will William use to qualify sellers?
4. What pipeline stages does William already use?
5. What manual tasks should the platform eliminate first?

⸻

19. MVP Definition of Done

The MVP is considered complete when:

1. Sellers can submit structured business intake.
2. Buyers can submit structured acquisition applications.
3. William can review all submissions in an admin dashboard.
4. William can update buyer and seller statuses.
5. AI can generate useful seller and buyer summaries.
6. AI can suggest possible matches between buyers and sellers.
7. William can approve, reject, or save matches.
8. William can manage deal flow and pipeline progression.
9. Sensitive seller information is protected from buyers by default.
10. The platform can support William’s real workflow with actual buyers and sellers.

⸻

20. Core Positioning Statement

WAMA is a private, advisor-led acquisition network that helps serious buyers and business owners move through a structured, AI-assisted qualification and matching process.

For sellers, WAMA provides a simple way to understand acquisition readiness and enter a trusted advisory process.

For buyers, WAMA provides a way to become verified and receive curated acquisition opportunities.

For William, WAMA provides an AI-powered operating system for managing buyers, sellers, matches, deal flow, and pipeline progression.

The platform’s core promise is:

WAMA helps turn messy buyer and seller interest into qualified, advisor-approved acquisition opportunities.