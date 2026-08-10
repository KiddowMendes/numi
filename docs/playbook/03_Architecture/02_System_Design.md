---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/03_Architecture/01_Tech_Stack.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
  - "docs/playbook/02_Product_Mechanics/04_Data_Flow.md"
decision_record: none
---

# 02 — System Design

> The boxes and arrows. What talks to what, and what must never leak across boundaries.

---

## Architectural Layers

```
┌─────────────────────────────────────────┐
│  Presentation Layer                     │
│  Mobile: React Native (Expo)            │
│  Web: Next.js (static export)           │
│  Job: Render UI, capture input, display │
│         Current / Planned / Actual        │
├─────────────────────────────────────────┤
│  State Layer                            │
│  Tool: Zustand                          │
│  Job: Hold AppState in memory. Feed     │
│         Engine. React to changes.         │
├─────────────────────────────────────────┤
│  Engine Layer                           │
│  Package: @numi/domain                  │
│  Job: Enforce rules, run calculations,  │
│         return new immutable AppState       │
├─────────────────────────────────────────┤
│  Repository Layer                       │
│  Package: @numi/database                │
│  Job: Map entities to SQLite rows.      │
│         Read on boot. Write async.        │
├─────────────────────────────────────────┤
│  Storage Layer                          │
│  Mobile: SQLite (expo-sqlite)           │
│  Web: IndexedDB / SQLite WASM (v1)      │
│  Job: Durable, queryable, offline.      │
├─────────────────────────────────────────┤
│  Sync Layer (v2, Premium)               │
│  Tool: Supabase client / REST            │
│  Job: Push device truth to cloud.       │
│         Pull to web. Never overwrite.     │
└─────────────────────────────────────────┘
```

---

## Boundary Rules

| Rule | Enforcement |
|---|---|
| Presentation never calls Repository directly | Engine is the only entry point |
| Engine never imports React / React Native | Pure TypeScript. Testable in Node. |
| Repository never imports Engine | Maps rows to entities, not the reverse |
| Sync Layer never writes to local DB directly | Writes through Engine to preserve invariants |
| Web app has no local authority | Reads from cloud. Device wins conflicts. |

---

## The Engine Boundary

The Engine (`@numi/domain`) is a pure function:

```
(AppState, UserContext, Operation) => Result<AppState, EngineError[]>
```

It knows nothing about:
- React hooks
- SQLite schemas
- Network status
- The existence of a web app

It knows everything about:
- Whether a transaction is valid
- What safe-to-spend equals today
- Whether a tier limit is exceeded

The Presentation layer passes `AppState` in, receives new `AppState` out, and tells the Repository to persist it.

---

## The Repository Pattern

The Repository layer (`@numi/database`) has one job: translate between SQLite rows and domain entities.

```
SQLite Rows ──► Repository ──► Entities ──► Engine
     ▲                                          │
     └────────────── Repository ◄───────────────┘
```

On app launch:
1. Repository reads all tables.
2. Maps rows to entities.
3. Assembles `AppState`.
4. Injects into Zustand store.

On engine operation:
1. Presentation calls Engine with current `AppState`.
2. Engine returns new `AppState` (or errors).
3. Presentation updates Zustand store immediately.
4. Repository writes changed entities to SQLite async.
5. If write fails, queue for retry. Do not roll back Zustand.

---

## The Sync Architecture (v2)

```
┌─────────────┐     push     ┌─────────────┐
│   Device    │ ───────────► │    Cloud    │
│  (Source)   │              │   (Mirror)    │
│             │ ◄─────────── │             │
└─────────────┘   pull/ack   └─────────────┘
       │
       │ read-only
       ▼
┌─────────────┐
│   Web App   │
│  (Mirror of │
│    Mirror)  │
└─────────────┘
```

**Push flow:**
1. Device completes local operation.
2. Sync Queue appends operation record.
3. Background sync pushes to cloud.
4. Cloud acknowledges.
5. Queue item removed.

**Pull flow (web):**
1. Web app requests data from cloud.
2. Cloud returns latest known state.
3. Web app displays with timestamp.
4. If cloud data is older than device: stale banner, read-only.

**Conflict:**
- Web edit submitted.
- Cloud checks device timestamp.
- If device has newer data: reject web edit, return error.
- Device wins. Always.

---

## Monorepo Package Mapping

| Package | Layer | Depends On |
|---|---|---|
| `apps/mobile` | Presentation + State | `@numi/domain`, `@numi/database`, `@numi/design-system`, `@numi/types`, `@numi/utils` |
| `apps/web` | Presentation (read-mostly) | `@numi/domain` (for types), `@numi/design-system` |
| `packages/domain` | Engine | `@numi/types`, `@numi/utils` |
| `packages/database` | Repository | `@numi/domain`, `@numi/types` |
| `packages/design-system` | Tokens | none |
| `packages/types` | Shared interfaces | none |
| `packages/utils` | Helpers | none |

**Forbidden dependencies:**
- `packages/domain` must not import `packages/database`
- `packages/domain` must not import React
- `apps/web` must not import `packages/database` directly

---

## Failure Domains

| Failure | Impact | Recovery |
|---|---|---|
| Engine throws error | Operation blocked. No state change. | User sees error. Retry. |
| SQLite write fails | In-memory state is correct. DB is stale. | Retry queue. Warn user if persistent. |
| Cloud push fails | Device works normally. Web is stale. | Retry with backoff. |
| Cloud pull fails (web) | Web shows last known or error state. | Retry on user refresh. |
| DB corruption on device | App enters read-only. | Prompt restore from backup or export. |

---

## v1 vs v2 Boundaries

| Component | v1 | v2 |
|---|---|---|
| Sync Layer | Absent. No cloud. | Supabase integration. |
| Web App | Static landing page or read-only demo. | Full mirror with real-time sync. |
| Family Sharing | Absent. | One Premium account, multiple viewers. |
| Voice Logging | Absent. | Premium feature. |
| Widgets | Absent. | Premium, platform-specific. |

v1 architecture must not bake in assumptions that prevent v2. The Sync Layer is an optional adapter around the existing Repository, not a replacement.

---

## What Happens After This Document

This design is implemented in `03_Monorepo_Structure.md` (the actual folder layout) and `04_Offline_First_Strategy.md` (the detailed conflict resolution and queue mechanics).

Next: docs/playbook/03_Architecture/03_Monorepo_Structure.md