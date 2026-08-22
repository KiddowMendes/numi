---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/01_Domain/04_Engine_API.md"
  - "docs/playbook/02_Product_Mechanics/03_Behavioral_Loops.md"
  - "docs/playbook/03_Architecture/02_System_Design.md"
decision_record: none
---

# 04 — Data Flow

> Where data lives, how it moves, and where it transforms. Technology-agnostic.

---

## Data Stores

| Store | Purpose | Owner |
|---|---|---|
| Local Database (Device) | Authoritative ledger. All entities. | Device |
| In-Memory State | Current AppState passed to Engine. | App |
| Cloud Mirror (Optional) | Copy of device data for web/multi-device. | User's account (Freemium/Premium) |
| Web Cache | Lagged read-only copy for web app. | Browser |

---

## The Golden Path: Offline User (Free Tier)

```
[User Input] ──► [UI Validation] ──► [Engine Operation] ──► [In-Memory State] ──► [Local DB Write]
                                                                              │
                                                                              ▼
                                                                       [UI Update]
```

- No network involved.
- Engine receives AppState, returns new AppState.
- Local DB persists asynchronously. UI does not wait.
- If DB write fails, retry in background. If still failing, warn user but keep in-memory state.

---

## The Sync Path: Freemium/Premium User

```
[Device Engine] ──► [Local DB] ──► [Sync Queue] ──► [Push to Cloud] ──► [Cloud DB]
                                                          │
                                                          ▼
[Web App] ◄── [Pull from Cloud] ◄── [Cloud DB]
```

- Sync is **device-initiated, non-blocking**.
- The device pushes changes. The cloud never pulls.
- Web app reads from cloud. It is always lagged unless a sync just completed.
- Conflict resolution: **device wins**. Web edits on stale data are rejected.

---

## Data Transformations

| From | To | Where | How |
|---|---|---|---|
| User input (Rands) | Cents (integer) | UI layer | Multiply by 100, round |
| Cents (integer) | Display Rands | UI layer | Divide by 100, format |
| Local DB rows | AppState | Repository layer | Map rows to entities |
| AppState | Local DB rows | Repository layer | Map entities to rows |
| AppState | Engine result | Engine | Pure function: old state + operation = new state |
| Engine result | UI update | UI layer | Reactive binding |

---

## Read vs. Write Flows

### Read (Safe-to-Spend on Home Screen)

```
[UI requests] ──► [Read from In-Memory State] ──► [Engine.getDailySafeToSpend()] ──► [Display]
```

- No DB read on every render. AppState is held in memory.
- DB is read once at app launch, then kept in sync via writes.

### Write (Log Expense)

```
[User taps Save] ──► [UI validates input] ──► [Engine.logExpense()] ──► [New AppState] ──► [UI updates] ──► [Local DB writes in background]
```

- UI updates immediately from engine result.
- DB write is async and fire-and-forget.
- If DB write fails, queue for retry. Do not block UI.

---

## The Sync Queue

A simple outbox pattern on the device:

```
[Operation] ──► [Apply to Local DB] ──► [Add to Sync Queue] ──► [Background Sync] ──► [Cloud]
```

- Queue is persistent (survives app kill).
- Each queue item: operation type, entity ID, timestamp, checksum.
- Sync runs: on app open (if online), on user pull-to-refresh, or every 15 minutes (Premium only, user-configurable).
- If sync fails, retry with exponential backoff. Never drop queue items.

---

## Web App Data Flow (Freemium/Premium)

```
[User opens web] ──► [Fetch from Cloud] ──► [Display lagged data] ──► [Show sync status]
```

- Web app has no local authority. It is a mirror.
- If cloud data is older than device data: show stale banner, go read-only.
- If user edits on web: write to cloud, but device must acknowledge before cloud accepts. Device wins.

---

## Failure Modes

| Scenario | Behavior |
|---|---|
| Device offline | Continue normally. Queue sync for later. |
| DB corruption on device | Enter read-only mode. Prompt user to restore from backup (Freemium/Premium) or export data. |
| Cloud sync conflict | Device wins. Web edit rejected with message: "Your phone has newer data." |
| App killed mid-transaction | In-memory state lost, but DB has last known good state. On relaunch, resume from DB. |
| User deletes app | Local data gone. Freemium/Premium users can restore from cloud backup. Free users lose data (by design — no account, no cloud). |

---

## Privacy Boundary

| Data | Stays on Device | Goes to Cloud |
|---|---|---|
| Transactions | Yes | Only if user has account and sync enabled |
| Categories | Yes | Yes (if synced) |
| Wallet names | Yes | Yes (if synced) |
| Goals | Yes | Yes (if synced) |
| User email/password | No (not in domain) | Yes (handled by auth infrastructure) |
| Analytics events | No | Aggregate counts only, no user ID |

---

## What Happens After This Document

This data flow is implemented in `03_Architecture/02_System_Design.md` and `03_Architecture/04_Offline_First_Strategy.md`.

Next: docs/playbook/03_Architecture/01_Tech_Stack.md