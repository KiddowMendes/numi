---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/07_Roadmap/01_MVP_Scope.md"
  - "docs/playbook/00_Foundation/02_Principles.md"
decision_record: none
---

# 02 — Phases

> NUMI grows in layers, not leaps. Each phase has a trigger and a boundary.

---

## Phase 0: Foundation (Complete)

**Trigger:** Playbook drafted, monorepo scaffolded.

**Deliverables:**
- All upstream docs (Foundation, Domain, Mechanics, Architecture, Design System) drafted.
- Turborepo monorepo running locally.
- Mobile and web apps build without errors.

**Status:** Done.

---

## Phase 1: Core Engine (v1.0.0)

**Trigger:** Foundation locked.

**Duration:** 4–6 weeks.

**Deliverables:**
- `packages/domain` fully implemented with 100% test coverage.
- `packages/database` schema and migrations.
- Mobile app: Onboarding, Daily Budgeting, Budget Setup, Spending, Review.
- SQLite persistence. Offline-only.

**Boundary:**
- No cloud. No accounts. No web app.
- Free tier only.

**Success:** A friend can download it, track money for a week, and answer "Will my money last?"

---

## Phase 2: Polish & Escape Hatch (v1.1.0)

**Trigger:** v1.0.0 shipped, 10+ people using it daily.

**Duration:** 2–3 weeks.

**Deliverables:**
- Manual JSON export (Free tier escape hatch).
- Bug fixes from real usage.
- Performance: app launch <1s, list scroll 60fps on budget devices.
- Basic analytics: aggregate event counts only (no user IDs).

**Boundary:**
- Still no cloud. Still no accounts.
- No new features, just refinement.

---

## Phase 3: Freemium (v1.2.0)

**Trigger:** Users ask for web access or backup.

**Duration:** 3–4 weeks.

**Deliverables:**
- NUMI Account (free registration).
- Web app: read-only mirror, lagged.
- Manual cloud backup (JSON to Supabase storage).
- 3 Wallets, 3 Goals for Freemium tier.
- Tier enforcement in engine.

**Boundary:**
- No auto-sync. No real-time.
- Web is view-only when stale.

---

## Phase 4: Premium & Sync (v2.0.0)

**Trigger:** Freemium users active, infrastructure costs understood.

**Duration:** 6–8 weeks.

**Deliverables:**
- Premium subscription (affordable: ~R29/month or R199 once).
- Real-time sync across devices.
- Unlimited Wallets and Goals.
- Voice logging.
- Widgets (home screen).
- CSV/PDF export.
- Advanced insights (trends, "you usually overspend Food by 15%").

**Boundary:**
- No bank linking. No social features. No ads.

---

## Phase 5: Scale (v2.x)

**Trigger:** 1,000+ active users, revenue funds infrastructure.

**Duration:** Ongoing.

**Deliverables:**
- Self-hosted sync option (for privacy-maximal users).
- Family sharing (one Premium, multiple viewers).
- Debt tracking (mashonisa support).
- Stokvel pooling (multi-user Wallet).
- Localization (isiZulu, isiXhosa, Afrikaans).

**Boundary:**
- Core remains free. Premium funds the mission.

---

## Phase Table

| Phase | Version | Trigger | Duration | Cloud? | Account? |
|---|---|---|---|---|---|
| 0 | — | Playbook done | Done | No | No |
| 1 | v1.0.0 | Foundation locked | 4–6 weeks | No | No |
| 2 | v1.1.0 | 10+ daily users | 2–3 weeks | No | No |
| 3 | v1.2.0 | Users want backup | 3–4 weeks | Yes (manual) | Optional |
| 4 | v2.0.0 | Freemium stable | 6–8 weeks | Yes (auto) | Required for Premium |
| 5 | v2.x | 1,000+ users | Ongoing | Yes | Optional free, required Premium |

---

## What Happens After This Document

Next: Known Unknowns — what we are deliberately not deciding yet.