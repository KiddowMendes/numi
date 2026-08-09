---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/00_Foundation/01_Manifesto.md"
  - "docs/playbook/00_Foundation/02_Principles.md"
  - "docs/playbook/01_Domain/01_Entities.md"
decision_record: none
---

# 03 — Glossary

> Words have power. When we all use the same word to mean the same thing, we stop arguing about definitions and start building.

---

## A

**Account (NUMI Account)**  
A free registration that enables cloud-adjacent features (web view, manual backup, limited history). Distinct from a Wallet. Does not require payment.

**Actual**  
One of the three sacred lenses. A record of what *really happened* — money that was truly spent, earned, or moved. Used for learning and calibration, not judgment. See also: Current, Planned.

**Agency**  
The user's right to choose. NUMI informs; it does not decide. A core principle.

---

## B

**Budget**  
A plan for money that has already arrived. In NUMI, a budget is not a forecast of future income. It is an assignment of existing money to categories. A budget is complete when every Rand has a job.

---

## C

**Category**  
A label that describes the purpose of a transaction. Examples: Groceries, Transport, Airtime. Categories are unlimited on all tiers. A transaction must have exactly one category.

**Commitment**  
Money that has been assigned to a category or goal and is therefore no longer available for casual spending. Committed money is still physically present in a Wallet, but it reads as *spoken-for*.

**Current**  
One of the three sacred lenses. A real-time view of what is *truly free to spend right now* — total available money minus total commitments. The default view when the app opens.

---

## D

**Debt (Informal)**  
Money borrowed outside formal banking — typically from family, friends, or mashonisas. Tracked manually in NUMI. A Premium feature (v2).

**Device**  
The user's phone. The authoritative source of truth for all financial data. See also: Source of Truth.

---

## E

**Engine**  
The pure TypeScript layer that enforces business rules and performs calculations. It knows nothing about React, React Native, or the UI. Lives in `packages/domain`.

**Entry**  
The act of recording a transaction into NUMI. Must be frictionless.

---

## F

**Free Tier**  
NUMI Core. Unlimited transactions and categories. One Wallet (Cash Wallet). No account required. No internet required. Forever.

**Freemium Tier**  
NUMI Account. Free registration. Up to 3 Wallets, 3 Goals. Web view (lagged). Manual backup. A bridge between Free and Premium.

---

## G

**Goal**  
A named target that requires money to be set aside over time. Examples: "New phone," "School fees," "Emergency fund." Goals are containers for committed money. Free tier: 0. Freemium: 3. Premium: unlimited.

---

## I

**Invisible Spending**  
Money that leaves the user's hands in small increments (R20, R50, R100) without conscious awareness. The core problem NUMI exists to solve. See also: Visibility.

---

## L

**Lump-sum Income**  
Money that arrives as a single payment and must be stretched across a period — bursaries, grants, stokvel payouts, weekend job earnings. The typical income pattern of NUMI's primary user. Distinct from a monthly salary.

---

## M

**Mashonisa**  
An informal money lender operating outside regulated banking. Common in South African townships. NUMI tracks mashonisa debt as a Wallet or Debt entry (Premium, v2).

---

## N

**NUMI**  
The product. A financial clarity app, not a bank, not an accounting tool, not an investment platform.

**NUMI Card**  
Colloquial term for a Wallet. A manual representation of a real-world store of money. Not a physical card. Not linked to any bank.

---

## P

**Planned**  
One of the three sacred lenses. A view of money that has been *assigned to a purpose* but not yet spent. Shows whether commitments will last until the next income arrives. Used to surface tension before it becomes a crisis.

**Premium Tier**  
NUMI Supporter. Paid. Unlocks unlimited Wallets and Goals, real-time sync, voice logging, widgets, advanced insights, export tools, and family sharing. Funds the free tier.

---

## R

**Regret**  
The emotional state that follows invisible spending — understanding what happened only after the money is gone. NUMI exists to replace regret with clarity.

---

## S

**Safe-to-Spend**  
The single most important number in NUMI. Calculated as: total uncommitted money divided by days remaining until next expected income. Updated in real time. The answer to "Will my money last?"

**Source of Truth**  
The device (phone). The local database is the authoritative ledger. Cloud is a mirror. When they conflict, the device wins.

**Spoken-for**  
Money that has been assigned to a category or goal. It is not locked or hidden; it is labeled. The user can still spend it, but they do so with visible consequences.

**Stokvel**  
A communal savings or investment club common in South Africa. May be represented as a Wallet in NUMI.

**Sync**  
The act of pushing device data to the cloud or pulling cloud data to another device. Must be non-blocking, user-initiated or scheduled, never silent overwriting.

---

## T

**Tier**  
A level of access: Free, Freemium, or Premium. Determines how many organizational tools (Wallets, Goals) a user may create. Does not limit tracking.

**Transaction**  
The atomic unit of NUMI. A record of money moving in, out, or between Wallets. Every transaction has: amount, date, category, Wallet, and optional note.

---

## V

**Visibility**  
The state of seeing money clearly *before* spending it. The opposite of invisible spending. The core value proposition.

---

## W

**Wallet**  
A manual container representing a real-world store of money. Examples: Cash Wallet, Capitec Wallet, Stokvel Wallet. Money lives in Wallets. Transactions happen against Wallets. Wallets may transfer money between each other. Not a bank account. Not linked to any institution.

---

## Usage Rules

1. **These definitions are binding.** If a downstream document uses a word differently, the document is wrong.
2. **If a new concept needs a definition, it belongs here first.** Add it, then use it.
3. **Code must use the same names.** If the Glossary calls it a `Wallet`, the codebase calls it a `Wallet`, not `Account`, `Pocket`, or `Bucket`.

---

## What Happens After This Document

This Glossary is living. Terms may be added as the Domain layer reveals new concepts. Existing definitions may be refined, but never contradicted without an ADR.

Next: `docs/playbook/01_Domain/01_Entities.md` — the nouns of NUMI's world, given shape.
