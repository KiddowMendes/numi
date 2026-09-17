# numi — Agent Cheatsheet

Single reference distilled from `docs/playbook/`. Source of truth for agents building in this repo.
Regenerate via the `sync-cheatsheet` skill whenever the playbook changes.

## Monorepo

| Area | Path | Notes |
| --- | --- | --- |
| Mobile app | `apps/mobile` | Expo; native-first, offline core. |
| Web app | `apps/web` | Vercel static export; lagged read-only mirror. |
| Domain logic | `packages/domain` | Pure engine; 100% line coverage required (blocking). |
| Design system | `packages/design-system` | Shared components + tokens. |
| Types | `packages/types` | Leaf package; must not import anything. |
| Utils | `packages/utils` | e.g. `currency.ts` — the ONLY place Rands⇄cents convert. |
| Database | `packages/database` | SQLite; not yet created; declare in `03_Monorepo_Structure.md` before creating. |
| Tooling | `tooling/` | Add `- "tooling/*"` to `pnpm-workspace.yaml` when referenced. |

Forbidden arrows:
- `packages/domain` → `packages/database` or `apps/*`
- `packages/types` → anything (leaf)
- `apps/mobile` → `apps/web`
- `apps/web` → `packages/database`

## Coding Standards

- TypeScript strict; no `any`, no `@ts-ignore`.
- Money = integer cents everywhere except `packages/utils/src/currency.ts`.
- Engine returns `Result<AppState, EngineError>` — never throws.
- Import order: external → `@numi/*` → relative.
- Prettier width 100.
- kebab-case files, verb-first camelCase functions, PascalCase types/components, `UPPER_SNAKE_CASE` constants, co-located `*.styles.ts`.
- All domain logic (BR-*, C1–C15) must be unit tested; factories in `packages/domain/tests/factories/`.

## Git / CI / Release

- Long-lived `main`. Branches: `feature/<name>` / `spike/<name>`.
- Commits: `type(scope): subject`; scopes `mobile|web|domain|design-system|database|playbook|context|adr|repo`.
- Pre-push: `pnpm format`, `pnpm lint`, `pnpm test`, `pnpm build`.
- Never force-push `main`; never amend pushed commits; no merge commits on `main`.
- Tags only via release: `mobile@vX.Y.Z`, `web@vX.Y.Z`, `domain@vX.Y.Z`.
- Tests: Vitest. `packages/domain` line coverage 100% blocking; integration ≥80% `packages/database`; E2E deferred.
- Release: Mobile = EAS (OTA JS-only); Web = Vercel static export + Supabase Auth in browser storage (secrets never bundled); Domain = `pnpm publish` + tag. Steps: update `08_Changelog/`, cut tags, empty open Release roadmap section, bump changed package version.

## Playbook Layout

`docs/playbook/`:
- `00_Foundation/`
- `01_Domain/` → `01_Entities`, `02_Business_Rules`, `03_Calculations`, `04_Engine_API`
- `02_Product_Mechanics/` → `01_Invariants`, `02_User_States`, `03_Behavioral_Loops`, `04_Data_Flow`
- `03_Architecture/`
- `04_Design_System/`
- `05_Features/_LOCK.md` + per-feature `Screens|Overview|Flow|Edge_Cases.md`
- `06_Implementation/`, `07_Roadmap/`, `08_Changelog/_LOCK.md`

Canonical in-feature read order: Overview → Flow → Screens → Edge_Cases.
Features: `01_Onboarding`, `02_Budget_Setup`, `03_Daily_Budgeting`, `04_Spending`, `05_Debt_Tracking` (Planned), `06_Review`.

## Engine & Domain

- **Pure, synchronous.** `UserContext` = `{ userId, tier: 'free' | 'freemium' | 'premium' }`.
- `AppState` immutable: `{ user, activePeriod, periods, wallets, categories, goals, assignments, transactions }`.
- `Result<T,E> = { ok: true; value: T } | { ok: false; errors: E[] }`.
- `EngineError`: `INSUFFICIENT_BALANCE`, `TIER_LIMIT_EXCEEDED`, `INVALID_STATE`, `DATA_CORRUPTION`, `NOT_FOUND`.
- Glossary names used exactly; contradictions require an ADR.

### Business Rules

- **BR-P1** — Only one active Period at a time.
- **BR-W1** — Wallet balances never negative.
- **BR-W4** — Tier cap on Wallet count.
- **BR-W5** — Transfers are atomic: if any step fails, no part applies.
- **BR-C1** — Expense Categories exist.
- **BR-C2** — Income Transactions have zero Categories.
- **BR-C3** — Deleting a Category referenced by a Transaction is rejected → toast **"Move or delete its transactions first."**
- **BR-T1** — Transaction amount must be > 0.
- **BR-T2** — Duplicate Transactions are allowed.
- **BR-T3/BR-T4** — Reversals: original Transaction is never edited or deleted; reversal carries note **`"Reversal of [original_id]"`**.
- **BR-T5** — Transfer source Wallet ≠ destination Wallet.
- **BR-A1** — Assignment amounts positive.
- **BR-X3** — Conservation invariant (money moved, not created/destroyed).
- **BR-X4** — Date grouping in device local timezone.

### Calculations (C1–C15)

- **C1** Daily STS: `(wallet_balance + income_this_period − spent_this_period) ÷ days_left`.
- **C5** Breakdown results **cached, invalidated on every write**.
- **C6/C7** Planned assigned/spent/remaining; sorted **soonest-to-run-out first**.
- **C10** Sum of Assignments ≤ Wallet balance.
- **C11** Transfer requires sufficient *available* balance.
- **C12** v1 **hard rejects** `INSUFFICIENT_BALANCE` — no overdraft.
- **C15** Corruption → read-only mode; restore validates signature.
- Full set: C1–C15 + Pseudocode Conventions live in `01_Domain/03_Calculations.md`.

### Invariants (I1–I12)

- **I2** Negative STS shown with same confidence, no shame.
- **I6** Debounce (double-tap = exactly one action); **no draft modal** (draft in memory only while amount AND category present); quiet discards.
- **I7** Core loop works offline.
- **I8** Tier limits enforced **at point of action**.
- **I12** Both Wallets' histories show a transfer.

## Design System

- **Button** heights sm36/md44/lg56; min touch target 48×48; one Primary per screen.
- **SafeToSpendHero** ~40% of HomeScreen. Precedence: `stateAlert` → zero → `stateCaution` (<20%) → `stateSafe`.
- **AmountInput** 56px, static "R", tabular-nums, non-negative, 1–9 integer digits + 2 decimals.
- **TextInput** 48px.
- **ListItem / TransactionRow** 72px min; prefix "+"/"−"/"→".
- **EmptyState** — 4 variants.
- **BottomSheet**: mobile max 70%; web modal max 480px; `max-height: min(90vh, 640px)`; `role="dialog"` + `aria-modal="true"`.
- **Toast**: bottom 24px; auto-dismiss 3s; swipe-up; **no error toasts** (errors are inline).
- **SegmentedControl**: web radiogroup + arrow keys.
- **FAB**: 56×56, bottom-right 24px, hidden on scroll down.

## Product Mechanics

### User States (S1–S8)
E.g. **S4** "You planned R2,000…" — presents actions; S6/S7 copy in `02_Product_Mechanics/02_User_States.md`.

### Behavioral Loops
- Core loop; notifications **OFF by default**; ~5-sec logging; **no gamification**; goal = zero notifications.

### Data Flow
- Source of truth: device. **Device wins conflicts** (R6.5 / OF13).
- Rands⇄cents only at the UI layer.
- Persistent outbox queue, cap 5,000.
- Web = lagged read-only mirror (OF2/OF6/OF14).

## Patterns

### Inline errors
| Error | UI copy |
| --- | --- |
| `INSUFFICIENT_BALANCE` | "You don't have enough available in this wallet." |
| `TIER_LIMIT_EXCEEDED` | "Upgrade to create more wallets." |
| `INVALID_STATE` | "Cannot do this right now." |

Rejection messages are defined **once** in `01_Domain/04_Engine_API.md`; UI consumes, never rewords.

- Shake animation only for input errors.
- Sync banner: **"Sync pending. Your data is safe on your device."** — backoff 30s→10min, 20 attempts.
- Destructive confirms via BottomSheet; **no double-confirm**.
- Undo is not v1.
- Caps: >1000 tx → Search; >12 categories → A-Z jump; Wallet list horizontal scroll max 3.
- A11y SR strings: `"Safe to spend today: {amount}. {n} days remaining."` / `"{Category}. Minus {amount}. {Wallet}. {relative date}."`
- Never blame the user.

## Features

### Onboarding (Specified)
- Min viable state: **1 Wallet + 1 Period**. Never asks for personal data, internet, or payment.
- Free default: 1 Wallet, no Goals.
- Flows 1–5: Splash (1.5s) → Wallet Setup Sheet → Period Setup Sheet (**"My Budget"**, today → +30) → optional Category Assignment (defaults Food/Transport/Airtime).
- Edge Cases EC1–EC15 (**EC15**: airplane mode → fully local).

### Budget Setup (Specified)
- Success = new Period in <30s; previous Assignments appear as **suggestions, never defaults**.
- Free: Unlimited Periods / 1 Wallet. Freemium: + Web archived. Premium: + templates.
- Out of scope: recurring, AI, shared, forecasting.
- Close-early confirm: **"Close '[Old Period]' and start new? Unspent money will be available in the new period."**
- Extend: 365-day warning if daily < R1.
- Edge Cases EC1–EC10: min 1 day (**"A period must be at least 1 day."**), past end rejected, negative unspent → **"R[abs(amount)] over budget."**; deleting all Assignments is valid.

### Daily Budgeting (Specified)
Lens: **Current=Yes, Planned=Partial, Actual=Partial** (history lives in Spending).
- Success = STS in 2 taps (R2.1); one-screen log <5s, no confirmation (R2.2/R1.3); real-time STS (R2.3); fully offline.
- Negative STS: same confidence, no shame (R4.3 / I2).
- Hero copy: **"R[global_safe] total · [days] days left."** or "--" if no Period.
- Expense log: TransactionLogSheet, defaults = last used; toast **"R[amount] logged."**; hero animates (`motion.default`) before sheet closes.
- Income: no Category (BR-C2); wallet = destination; soft dismissible nudge **"Start a new period?"** (Behavioral Loop 2, never blocking).
- Transfer: type toggle **"Transfer"**, two Wallet selectors, `Engine.transfer()` → validates BR-T5 + enough *available* balance (C11), atomic (BR-W5), both histories show it (I12), total STS unaffected.
- Quick adjust: tap CategoryCard remaining → QuickCategoryAdjustSheet; same Assignment-editing engine path as Budget Setup; **sole** place Daily Budgeting touches Assignments.
- Breakdown: SegmentedControl **Current/Planned/Actual**, read-only.
- Out of scope: full history, filter/search, reversing, charts, voice.
- Edge Cases EC1–EC12: expense > balance → C12 hard reject inline + shake + Save disabled; zero/invalid → Save disabled, silent-until-submit; same-wallet transfer → **"Choose two different wallets"**; interrupt mid-log → no Transaction unless Save tapped; double-tap → one (I6); tier caps neutral (**"Wallets are capped at 1 on the Free plan."**); sync conflict → device wins **"Your phone has newer data."**; "Log similar" resets date to today, clears note; offline local (R4.4/I7).
- Screens: **HomeScreen** `/home` — Block A STS hero (~40%), Block B WalletCards ("R[x] available"; Free exactly one, Premium >3 horizontal), Block C CategoryCards (only if Assignments; `textPrimary` ≥0 / `stateAlert` negative), Block D EmptyStates (NoWallet/NoPeriod/NoTransactions), FAB "Log expense", tabs Home/Plan/History/Settings. **TransactionLogSheet** — type toggle, "Log similar" locks type, Amount autofocus, Category chips Expense-only most-recent first (hidden for Income/Transfer), single Wallet (last used), From/To for Transfer, Date today low-emphasis, Note collapsed, Save disabled until valid; rejection → inline + `motion.fast` shake. **QuickCategoryAdjustSheet** — "[Category name]", current Assignment read-only, "R[wallet_available] available in [Wallet name].", Primary "Update"/Ghost "Cancel", inline **"You only have R[x] available."** **Breakdown** `/home/breakdown` — Current (global STS / per-Wallet / days), Planned (C6/C7 sorted soonest-to-run-out), Actual (deep link to History filtered "this period").
- **Tail**: Daily Budgeting is the default landing of mobile + web.

### Spending (Specified)
Tagline: *"See what happened. Learn without shame. The Actual lens made visible."*
Lens: **Actual=Yes** (only deep Actual feature in v1), Planned=Partial, Current=No.
- Success = find any tx from last 30 days <10s; reverse in 2 taps; all amounts neutral; fully offline.
- Free: full history, filters = time + type only. Freemium: + lagged web view. Premium: Category multi-select, amount range, note search, CSV.
- Out of scope: charts/trends (v2/Premium), merchant recognition, receipts, split tx, Budget-vs-Actual (→ Review).
- Browse: HistoryScreen groups Today/Yesterday/"[Day name]"/Earlier this "[Month]"; virtualize after 50; default = all Wallets/all Categories/all types, last 30 days, newest first.
- Reverse confirm: **"Reverse this R[amount] [type]?"** / **"A reversing entry will be created. Your history will show both transactions."** → `reverseTransaction` (BR-T3/BR-T4); toast **"Reversed."**; STS updates immediately; original never edited/deleted; note `"Reversal of [original_id]"`; reversal-of-reversal allowed.
- Recovery: cancel filter → list unchanged; 0 results → **"No transactions match."** + "Clear filters"; wrong reversal → reverse the reversal; web = lagged mirror + stale banner.
- Edge Cases EC1–EC12: fresh install → **"No transactions yet. Log your first spend to see your money clearly."**; zero results **"No results for '[query]'."** / "Try a different word or clear filters."; "This period" with no active Period → silent All time; double-negatives allowed, never merged/hidden; reversing a Transfer = new Transfer with source/dest swapped (BR-T5, BR-W5 atomic); double-tap Reverse → one reversal, one toast (I6); offline reversal keeps original+reversal in persistent queue in creation order (OF8/OF9); premium lapse → view keeps working, Premium actions blocked neutrally at point of action (I8), CSV disabled; web edits rejected **"Your phone has newer data."** (OF13); interrupted browsing discarded quietly (I6), reversal never lost.
- Screens: **HistoryScreen** `/history` — header + Funnel (Premium: MagnifyingGlass); chips + X + "Clear all"; date groups; empty states; tabs Home/Plan/History(active)/Settings. **FilterSheet** — Wallet radio + "All Wallets", Category single (Free)/multi (Premium) + "All Categories", Type SegmentedControl, Date radio, Apply/Cancel. **TransactionDetailSheet** — auto-height; `amountHero` `color.income|color.expense|color.transfer`; Category `textPrimary`, Wallet `textSecondary`, Date `textMuted`, Note `textSecondary`/`"No note."`; Metadata collapsible (v2), truncated ID + "Reverses [original_id]"; Ghost `stateAlert` + Ghost `color.primary`. **SearchOverlay** Premium — overlay on `/history`, autofocus + clear, debounced, grouped, highlighted.

### Review (Specified)
Tagline: *"The honest post-mortem. No grades, just facts."*
Lens: **Current=No, Planned=Yes, Actual=Yes**.
- Route `/review?periodId=[id]`; trigger `today > active_period.end_date`; closed Periods archived, never deleted (P5); read-only; banner below SafeToSpendHero.
- Metrics: % starting new Period within 24h; category with most Planned > Actual; avg unspent. Never shaming.
- Flow 1 (auto prompt): banner **"Your [Period name] has ended. Review or start fresh?"** → ReviewScreen or Budget Setup.
- Flow 2 (review closed): summary card (name, dates, duration, total income/spent; unspent **"R[amount] left over"** — never "underspent"); per-Category Planner/Actual/Difference (absolute, neutral, no moral indicators); suggested next Period **"Start [Month] Budget with these amounts?"** pre-filled from Actuals; Primary "Start new period" → Budget Setup, Ghost "Close" → HomeScreen.
- Flow 3 (from History): same, no "Start new period", "Close" only.
- Flow 4 (skip): banner never reappears for that Period; reachable via History; no nagging.
- Flow 5 (extend closed): "Extend this period" → end-date picker (must be after original end) → reopens; Assignments re-committed at remaining amounts; state-only; STS recalculates.
- Edge Cases EC1–EC7: 0 transactions → **"No transactions logged this period."** + suggest start fresh, no failed-to-track language; massive overspend → **"Over by R[amount]"** `stateAlert` on total only + **"You spent more than planned. Consider a longer period or more income."**; delete closed Period → impossible (P5); transferred money: not in Category breakdown (no Category), in Wallet breakdown, not in "Spent" total; income after close → included in income total, STS not recalculated, new Period starts higher.
- Screens: **ReviewScreen** — header "[Period name]" + "[start] – [end] · [duration] days"; Block A Period Summary Card (Income, Spent, "Left over"/"Over by" absolute, no judgment text); Block B "By category" rows with difference bar (width ∝ max(Planned, Actual), Planned `color.border`, Actual Category color, no red; tap to expand tx list); Block C Wallet Breakdown (optional, collapsible); Block D Suggestion Card (just-ended only, `surfaceRaised`, 3px `color.primary` left border, "Start your next period", top 3 Categories from Actuals, Primary "Use this plan" / Ghost "Start fresh"); Block E Primary "Start new period" (just-ended only) + Ghost "Close". **PeriodEndedBanner** — inline on HomeScreen below hero; "Your [Period name] has ended." + "R[unspent] left over. R[overspent] over budget." (omit zero lines); actions "Review" + "Start new period".

### Debt Tracking (Planned — NOT specified)
Tagline: *"Money you owe, tracked without shame. The debt you can't forget, remembered for you."*
- Status **Planned**; owner Elton Pascoal; `decision_record: none`; Overview/Flow/Edge_Cases/Screens are 23-line stubs (`version: 1.0.0`, `status: Planned`).
- Planned shape: informal debt (creditor, amount, purpose); mashonisa preset (daily/weekly installments); each repayment is a Transaction referencing the Debt; remaining + next installment at a glance; on-device due-date reminders; never guilt.
- **Data model decision (do not pre-implement):** Debt is a **separate entity, NOT a Wallet** → BR-W1 (no negative balances) and BR-X3 stay untouched.
- Tiers: Free/Freemium excluded (R3.7), Premium full.
- Out of scope: interest/APR, formal loans, consolidation advice, creditor notification.
- Until playbook is edited to Detail/Draft, do **not** add Debt behavior to engine or UI.

## Architecture Notes
- `apps/mobile/src/screens/HomeScreen.tsx` and `apps/web/app/page.tsx` already show the Onboarding tail (first Wallet + Period) — matches the Specified flows above.