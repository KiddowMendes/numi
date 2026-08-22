---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/04_Data_Flow.md"
  - "docs/playbook/02_Product_Mechanics/01_Invariants.md"
  - "docs/playbook/02_Product_Mechanics/02_User_States.md"
  - "docs/playbook/00_Foundation/02_Principles.md"
  - "docs/playbook/03_Architecture/02_System_Design.md"
  - "docs/playbook/03_Architecture/05_Security.md"
decision_record: none
---

# 04 — Offline First Strategy

> The device is the source of truth. The cloud is a mirror, and the web is a mirror of that mirror.

---

## The Offline-First Identity

**OF1. The core experience never requires a network.**

- In airplane mode, the user can log transactions, create Assignments, and view safe-to-spend exactly as if online (I7).
- The only features that degrade are those that require connectivity by definition: sync and the web view.
- No nagging banners demanding connection (I7).

**OF2. The local database is the authoritative ledger.**

- The cloud is a mirror, never a master (R6.1).
- The web app has no local authority; it is a mirror of the mirror (System Design boundary rules).

**OF3. v1 ships without any cloud dependency.**

- Sync is a v2, Premium-only capability (System Design v1/v2 boundaries; Tech Stack §Sync Infrastructure).
- v1 must not bake in assumptions that prevent v2: the Sync Layer is an optional adapter around the Repository, not a replacement.

---

## Data Stores and Authority

| Store | Purpose | Authority |
|---|---|---|
| Local Database (device) | Authoritative ledger. All entities. | Source of truth (R6.1) |
| In-Memory State | Current AppState passed to the Engine. | Derived from local DB |
| Cloud Mirror (Freemium/Premium) | Copy of device data for web and multi-device. | Mirror only |
| Web Cache | Lagged read-only copy for the web app. | Mirror of the mirror |

---

## The Offline Path (v1)

**OF4. State is loaded once at launch, then kept in memory.**

- Load-at-start pattern: Repository reads all tables, maps rows to entities, assembles `AppState` on boot.
- Reads afterwards come from in-memory state — no DB reads per render (read flow in `04_Data_Flow.md`).

**OF5. Writes apply to state immediately and persist asynchronously.**

- Engine returns new `AppState`; the UI updates immediately, fire-and-forget.
- Repository writes changed entities to SQLite in the background; the UI never waits.
- If the DB write fails, queue for retry. Do not roll back in-memory state.
- If persistence keeps failing, warn the user but keep using in-memory state.

---

## The Sync Path (v2, Premium)

**OF6. Sync is device-initiated and never blocking.**

- The device pushes changes; the cloud never pulls.
- The web app reads from the cloud and is always lagged unless a sync just completed.
- The app must never freeze while syncing (R6.4).

**OF7. The Sync Layer never writes to the local DB directly.**

- All incoming state changes pass through the Engine so invariants are preserved (System Design boundary rules).

| Trigger | Notes |
|---|---|
| App open | Only if online |
| Pull-to-refresh | User-initiated |
| Every 15 minutes | Premium only, user-configurable |

While the app is closed, no sync occurs. A user returning after an inactive period (S8) catches up on the next open — no aggressive background behavior.

---

## The Sync Queue

**OF8. The queue is a persistent outbox on the device.**

- Survives app kill.
- Each item: operation type, entity ID, timestamp, checksum.
- Push flow: device completes operation → queue item appended → background sync pushes → cloud acknowledges → item removed.

**OF9. Queue items are never dropped.**

- Failed syncs retry with exponential backoff.
- Device offline: continue normally, queue for later.

**OF10. The queue is invisible in the core UI.**

- No pending-sync badges or counts on budgeting screens.
- Sync health lives in Settings / diagnostics only.

---

## Conflict Resolution

**OF11. The device wins, always.**

- Last write from the device wins; no complex merge algorithms (R6.5).
- Diverged copies are never silently discarded — the user is notified (R6.2).

**OF12. The ordering signal is device timestamp + checksum.**

- Comparisons use the timestamp attached to each queue item or entity, verified by its checksum.
- Device clock skew is a known limitation of this model and receives no extra machinery in v2.

**OF13. Web edits on stale data are rejected by timestamp check.**

- When a web edit arrives, the cloud checks the device timestamp.
- If the device has newer data: the edit is rejected with "Your phone has newer data." (R6.5, System Design conflict rules).
- This implements the device-acknowledgement requirement of `04_Data_Flow.md` as a cloud-side check — there is no separate staging bucket for web edits.

---

## Web App Behavior

**OF14. The web app shows its lag honestly.**

- On open: fetch from cloud, display lagged data, show sync status.
- If cloud data is older than the device: stale banner and read-only mode (R6.3).
- Exact message: **"Your phone has newer data. Sync to see the latest."** (R6.2)
- This satisfies I3: the user must never act on stale numbers without knowing they are stale.

---

## Failure Modes

| Failure | Behavior |
|---|---|
| Device offline | Continue normally; queue sync for later |
| Cloud push fails | Retry with exponential backoff; never drop queue items |
| Cloud pull fails (web) | Show last known or error state; retry on refresh |
| DB write fails | In-memory state stays correct; retry queue; warn if persistent |
| DB corruption on device | App enters read-only; prompt restore (see below) |
| App killed mid-transaction | Resume from last known good DB state on relaunch |
| User deletes app | Free: data gone by design (no account, no cloud). Freemium/Premium: restore from cloud backup |

---

## Corruption and Restore

**OF16. Restore is a full overwrite of the last-known-good backup.**

- Restore replaces the device DB wholesale; no merge with surviving rows (no-complex-merge, R6.5).
- Freemium/Premium: cloud backup is encrypted with the user's sync key; restore requires the same account plus device authentication (S12).
- Free tier: plaintext JSON export is the user's own responsibility (S11).
- The app stays read-only until the restore is resolved.

---

## Account and Tier Edge Cases

**OF17. Cloud account deletion never touches local data.**

- Deleting the cloud account keeps the local ledger intact (R6.6).
- Unsubscribing from Premium never deletes local history (R6.6).

---

## v1 vs v2 Boundaries

| Component | v1 | v2 |
|---|---|---|
| Sync Layer | Absent. No cloud. | Supabase integration. |
| Web App | Static landing page or read-only demo. | Full mirror with real-time sync. |

v1 must not bake in assumptions that prevent v2.

---

## What Happens After This Document

This strategy is implemented in `03_Monorepo_Structure.md` (package layout; `packages/database` is created when sync work begins) and guarded by `02_Product_Mechanics/04_Data_Flow.md`. Data-at-rest and in-transit protections are specified in `05_Security.md`.

Next: docs/playbook/03_Architecture/05_Security.md