---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/03_Architecture/02_System_Design.md"
  - "docs/playbook/02_Product_Mechanics/04_Data_Flow.md"
  - "docs/playbook/00_Foundation/02_Principles.md"
decision_record: none
---

# 04 — Offline-First Strategy

> The device is never waiting for permission to be correct. Sync is something that happens *to* the truth, not something the truth depends on.

---

## Scope

This document is the single source of truth for **how sync, conflict resolution, and the sync queue actually work**. Other documents reference these mechanics but do not define them:

- `03_Architecture/02_System_Design.md` — names the Sync Layer and its failure domains.
- `02_Product_Mechanics/04_Data_Flow.md` — sketches the push/pull paths and the outbox pattern.
- `03_Architecture/05_Security.md` — defines what sync payloads must protect.
- `04_Design_System/03_Patterns.md` — defines what the *user* sees when sync degrades.

If any of those documents conflicts with this one on a sync mechanic, this document wins; they should be read as UI/security consequences of the rules defined here.

This document governs **Freemium and Premium tiers only**. Free tier has no cloud and none of this applies — Free tier's "sync" is the manual JSON export in `05_Security.md` (S11).

---

## Foundational Rule

**R6.1 restated as an architectural constraint:** the local database on the device is the only ledger the Engine ever writes against. Nothing — not a cloud push acknowledgment, not a pending sync state, not a web edit — is permitted to block, delay, or roll back a local Engine operation. Sync is strictly an *outbound* concern layered on top of a ledger that has already committed.

This is why the Sync Layer sits outside the Engine boundary in `02_System_Design.md`: it consumes completed operations, it does not participate in producing them.

---

## The Sync Queue

An outbox pattern, persisted locally so it survives app kill.

**Queue item shape:**

```
{
  id: string,
  operation_type: string,   // e.g. "logExpense", "createAssignment"
  entity_id: string,
  payload_checksum: string,
  created_at: Date,
  attempt_count: number,
  status: 'pending' | 'syncing' | 'failed'
}
```

**Enqueue rule:** every successful Engine operation that mutates `AppState` appends exactly one queue item, in the same local transaction as the DB write it belongs to (per I6 — the operation is atomic from the user's perspective; queuing failure must not be visible to the user, but must not silently drop the item either).

**Dequeue rule:** an item is removed from the queue only after the cloud acknowledges receipt AND checksum match. A push that times out or errors leaves the item in `pending`.

**Retention limit:** 5,000 pending items. This ceiling exists to bound worst-case local storage and retry cost, not because 5,000 unsynced operations are expected in practice — see Escalation below for what happens if it's reached.

---

## Push Flow (Device → Cloud)

```
[Engine commits AppState] ──► [Local DB write] ──► [Queue item appended]
                                                          │
                                                          ▼
                                              [Background sync trigger]
                                                          │
                                                          ▼
                                                   [Push to Cloud]
                                                          │
                                        ┌─────────────────┴─────────────────┐
                                        ▼                                   ▼
                                 [Cloud acknowledges]              [Push fails / times out]
                                        │                                   │
                                        ▼                                   ▼
                              [Queue item removed]              [Retry with backoff — see below]
```

**Trigger conditions for a sync attempt:**
- App enters foreground (if online).
- User pulls to refresh.
- Every 15 minutes while the app is foregrounded, Premium tier only, user-configurable (per `01_Tech_Stack.md`'s Supabase real-time notes).
- Freemium tier syncs on the first three triggers only — no scheduled interval sync (manual backup cadence, consistent with R3.5's "lagged" web view for Freemium).

**What is never a trigger:** a sync attempt never blocks a UI transition. If a sync is in flight when the user navigates away or logs another transaction, the sync continues in the background; it does not need the screen that initiated it.

---

## Pull Flow (Web / Secondary Device)

```
[Web app requests state] ──► [Cloud returns latest known state + timestamp]
                                                │
                              ┌─────────────────┴─────────────────┐
                              ▼                                   ▼
                    [Timestamp is current]              [Timestamp is stale]
                              │                                   │
                              ▼                                   ▼
                   [Full read/write access]              [Stale banner, read-only]
```

**Staleness definition:** cloud data is stale if the device has queue items still `pending` at the time the web app fetches, or if the cloud's `last_synced_at` timestamp is older than a threshold (default: 5 minutes) from the current time. Either condition alone is sufficient to mark stale — this is intentionally conservative; a false "stale" flag costs nothing, a false "fresh" flag risks a rejected web edit or worse, a silently lost one.

**Web app has no local authority (per `02_System_Design.md`).** It never queues its own outbox. Every web write is a direct, synchronous request to the cloud, evaluated against the Conflict Resolution rule below before being accepted.

---

## Conflict Resolution

**The rule is intentionally simple (R6.5): the device always wins.**

There is no field-level merge, no three-way diff, no "keep both" prompt. This is a deliberate simplification traded off against complexity the team does not have bandwidth to build correctly for v1 — see `00_Foundation/01_Manifesto.md` Principle 6.

**Resolution procedure, on a web write attempt:**

1. Web app submits a write with the `last_synced_at` timestamp it read the state at.
2. Cloud compares that timestamp against the device's most recent successful push.
3. If the device has pushed anything newer than the web app's read: **reject the web write.** Return the current cloud state and an explicit conflict reason.
4. If the device has not pushed anything newer: **accept the web write**, update cloud state, and mark it as authoritative until the device's next push supersedes it (which it eventually will, since the device pushes on every foreground/refresh/interval trigger).

**What "the device wins" does NOT mean:**
- It does not mean device data silently overwrites a web edit the user just made. The rejection is explicit and shown to the user (I3): *"Your phone has newer data."*
- It does not mean the web edit is deleted from history. Rejected writes are logged locally in the web session (not persisted server-side) so the user can see what they attempted and manually re-apply it against fresh state if it's still relevant.
- It does not mean two devices racing each other produce undefined behavior. Only one authoritative device path exists per user account in v1 (multi-device write conflicts are out of scope until Phase 5's family-sharing work; a second phone signed into the same account should be treated as a known unknown, not a supported configuration, until then).

---

## Retry & Backoff

Applies to push attempts only (pull is synchronous and simply fails/succeeds per request; a failed pull just means the web app shows a network-error read-only state, per `04_Design_System/03_Patterns.md`).

| Parameter | Value |
|---|---|
| Initial backoff | 30 seconds |
| Backoff growth | Doubles each attempt |
| Backoff cap | 10 minutes |
| Max attempts per sync run | 20 |
| Queue retention limit | 5,000 pending items |

**After 20 failed attempts:** the sync run stops for that session. It resumes on the next trigger condition (foreground, pull-to-refresh, or interval), starting the backoff sequence fresh. Data is never dropped — only the retry *cadence* resets, not the queue contents.

**If the queue reaches its 5,000-item retention limit:** this is treated as an escalation, not a silent truncation. Per `04_Design_System/03_Patterns.md`'s Sync Failure pattern, the banner escalates from the subtle "Sync pending" state to a blocking prompt asking the user to retry manually or contact support. The oldest queued changes are never dropped to make room — the device remains the authoritative ledger regardless of how large the backlog gets.

---

## Failure Modes

| Failure | What Happens Locally | What the User Sees | Recovery |
|---|---|---|---|
| Device offline | Nothing — Engine and local DB are unaffected | Nothing (no banner, per R4.4 and I7) | Sync resumes automatically on reconnect |
| Push times out | Queue item stays `pending` | Nothing, until repeated failures escalate the banner | Backoff retry per table above |
| Push succeeds but ack is lost | Item may be retried once more; cloud dedupes by checksum | Nothing | Cloud-side idempotency via `payload_checksum` prevents double-application |
| Cloud rejects a web write (conflict) | N/A — device-side, unaffected | Web app: explicit "Your phone has newer data" message | User re-applies the edit on fresh data if still needed |
| Cloud unreachable (web pull) | N/A | Web app: "Cannot reach server. Data may be outdated." Read-only. | Retry button; web app never invents state |
| Local DB write fails (storage full) | In-memory `AppState` remains correct for the session; DB write queued for retry | Toast after repeated failure: "Unable to save. Free up space and try again." | Per Onboarding EC10 — same underlying storage-failure handling, not sync-specific |
| Local DB corruption detected (C15 fails) | App enters read-only mode | Blocking banner, forced export/restore flow | Per `05_Security.md` and `04_Design_System/03_Patterns.md` Data Corruption pattern |
| Queue exceeds retention limit | Queue itself is untouched (no drop) | Banner escalates to blocking, prompts manual retry/support | User-driven; data is never lost, only delayed |

---

## Tier Applicability

| Tier | Local Ledger | Sync Queue | Push Triggers | Web Access |
|---|---|---|---|---|
| Free | Yes (SQLite) | None — no cloud exists | N/A | None (manual JSON export only, S11) |
| Freemium | Yes (SQLite) | Yes | Foreground, pull-to-refresh, manual backup | Read-mostly, stale-gated (R3.5) |
| Premium | Yes (SQLite) | Yes | Foreground, pull-to-refresh, 15-min interval | Full read/write when fresh (R3.5) |

---

## What This Document Does Not Cover

- **Multi-device write conflicts** (two phones on one account) — explicitly deferred; see `07_Roadmap/03_Known_Unknowns.md`.
- **End-to-end payload encryption details** — the *requirement* is defined in `05_Security.md` (S5); the specific KDF/cipher choice belongs to an implementation ADR when the sync package is built.
- **Self-hosted sync option** — Phase 5 scope per `07_Roadmap/02_Phases.md`; this document assumes Supabase-managed cloud per `01_Tech_Stack.md`.

---

## What Happens After This Document

This strategy is implemented by `packages/database`'s sync adapter when Phase 4 (Premium & Sync) begins — see `03_Monorepo_Structure.md`'s note that `packages/database` does not exist yet and is created at that point. Until then, this document exists so that `02_System_Design.md`, `05_Security.md`, and the sync-affecting Design System patterns have a single mechanic they can all cite without duplicating or drifting from each other.

Next: with Architecture's two remaining Draft files (this one and the ones already complete) in place, `03_Architecture/_LOCK.md` criteria can be re-evaluated for a full-directory lock pass.
