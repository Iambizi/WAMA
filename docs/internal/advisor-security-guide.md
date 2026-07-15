# M&A Advisor Security Talking Points & Cheat Sheet

This guide provides simple, clear, and reassuring talking points you can use when discussing data security, privacy, and AI safeguards with William. It explains his typical concerns as an M&A professional and how the WAMA platform addresses them.

---

## 1. The Core Reassurance Formula

If William expresses concern about inputting sensitive company names, contacts, or financials, use this summary:
> *"The platform keeps your real client names and private advisor notes strictly locked inside the database. When the AI matching engine runs, it strips away all names, emails, and company identifiers, replacing them with random reference codes. The AI only evaluates anonymous criteria like industry sector, general region, and financial ranges—it never sees who the clients actually are."*

---

## 2. Typical M&A Security Concerns & WAMA's Solutions

### Concern A: "Will the AI train on my client data and leak it to competitors?"
*   **The Worry:** Inputting proprietary mandates into an AI system could allow the model to learn and suggest that information to other users.
*   **The Answer:** WAMA communicates with AI models (Claude/GPT) via secure **Enterprise APIs**. 
    *   Under these corporate service agreements, the AI providers are **legally prohibited** from using any of our queries to train their models.
    *   Data is processed in memory to generate the match recommendations and is immediately discarded (**Zero Data Retention**).

### Concern B: "If someone hacks the database, will they know which business is for sale?"
*   **The Worry:** A leak of seller identities can cause panic among employees, customers, and suppliers, damaging the business valuation.
*   **The Answer:** WAMA enforces **De-identification by Default**.
    *   Before sending any profile to the matching engine, the system strips the business name, owner name, email, and phone number.
    *   It replaces them with a random 6-character reference code (e.g., *Projet Boulangerie* becomes *Project Ref: b7d3d0*).
    *   The only details processed are high-level statistics (e.g., "Food & Beverage sector, Greater Montreal, 6-15 employees, $1M-$3M CAD revenue range").

### Concern C: "Can potential buyers or sellers browse my other database files?"
*   **The Worry:** A buyer logged into the portal might bypass the visual screens and scrape a list of all active listings or view competitor information.
*   **The Answer:** WAMA enforces **Strict Role-Based Isolation**.
    *   All database access rules (powered by Convex and Clerk authentication) are validated on the server.
    *   A user signed in as a "buyer" or "seller" is mathematically blocked from executing query functions meant for "administrators." They can only fetch and edit their own personal profile data.

### Concern D: "Are my internal remarks and negotiation details safe?"
*   **The Worry:** The private remarks logged after meeting a client (e.g., *"Seller is desperate to retire due to health issues, willing to take a discount"*) might be leaked or parsed by the matching engine.
*   **The Answer:** Internal advisor notes are stored in a **fully encapsulated field** (`advisorNotes`).
    *   This field is strictly restricted to your admin login.
    *   It is completely omitted from the payload sent to the AI matching engine. It is purely a private ledger for William's eyes only.

---

## 3. Technical Specs (If he asks for the "under-the-hood" details)

If William asks for technical details on how the database itself is secured:
*   **Chiffrement au repos (AES-256) :** All records stored in the Convex database are encrypted at rest using AES-256 (the banking standard).
*   **Chiffrement en transit (TLS 1.3) :** All communications between the browser and the server are encrypted using TLS 1.3, making packet interception impossible.
*   **Hosting:** Hosted on Convex's enterprise cloud infrastructure, which benefits from high-availability firewalls and continuous security updates.
