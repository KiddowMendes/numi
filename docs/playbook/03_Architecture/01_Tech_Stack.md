---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/04_Data_Flow.md"
  - "docs/playbook/03_Architecture/02_System_Design.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
decision_record: none
---

# 01 — Tech Stack

&gt; Every choice serves the domain. If a tool does not solve a NUMI-specific problem, it is not chosen.

---

## Overview

| Layer | Technology | Justification |
|---|---|---|
| Mobile App | Expo (React Native) | Single codebase, offline-capable, OTA updates without store review |
| Web App | Next.js | Static export possible, file-system routing, React ecosystem shared with mobile |
| Monorepo | Turborepo + pnpm | Caches builds, shares code, handles Metro symlink issues via `node-linker=hoisted` |
| Language | TypeScript | Type safety across shared packages, single source of truth for domain |
| Local DB | SQLite (via expo-sqlite / react-native-quick-sqlite) | Embedded, zero-config, works offline, queryable, survives app updates |
| State Management | Zustand | Lightweight, no boilerplate, works outside React (engine can use it) |
| Sync (v2) | Supabase or self-hosted PostgreSQL | Open source, row-level security, real-time subscriptions for Premium sync |
| Styling | NativeWind (mobile) + Tailwind (web) | Shared design tokens, single token file in `packages/design-system` |

---

## Mobile: Expo (React Native)

**Why not Flutter?**  
Flutter is excellent, but NUMI is built by a solo developer who knows React. The shared React ecosystem between mobile and web reduces context switching. Expo handles build tooling, OTA updates, and SQLite integration without ejecting.

**Why not bare React Native?**  
Expo provides `expo-sqlite`, `expo-updates`, and managed builds. A solo developer should not maintain Xcode and Android Studio configurations.

**Traced to:** Principle 5 (Built for Small Amounts) — the app must run on budget devices. React Native's performance is acceptable for NUMI's UI complexity (lists of transactions, simple forms, one big number).

---

## Web: Next.js

**Why not Vite?**  
Next.js App Router supports static export (`output: 'export'`), which means the web app can be deployed as static files on a CDN. No Node server required. This aligns with the free tier having no backend dependency.

**Why not Remix?**  
Remix is server-rendering first. NUMI's web app is a client-side mirror of device data. It does not need server rendering. Next.js static export is simpler.

**Traced to:** Principle 3 (Free Core, Funded Future) — the web app must be hostable for free on Vercel or similar. Static export achieves this.

---

## Monorepo: Turborepo + pnpm

**Why Turborepo?**  
It is a task runner, not a framework. It caches `next build`, `expo export`, and `vitest run` so that changing one package does not rebuild everything. Essential for solo developer velocity.

**Why pnpm?**  
Strict dependency management prevents "works on my machine." `node-linker=hoisted` solves React Native Metro bundler's inability to resolve symlinks.

**Traced to:** Principle 6 (Device is Source of Truth) — the monorepo must share `packages/domain` between mobile and web without bundler conflicts.

---

## Language: TypeScript

**Why not JavaScript?**  
The domain engine (`packages/domain`) is pure logic with no UI. Type safety catches money-handling bugs at compile time. Cents arithmetic must not be approximate.

**Why not Rust / Go for the engine?**  
Cross-compilation to React Native's Hermes runtime is non-trivial. TypeScript is "good enough" for NUMI's performance requirements (no real-time trading, no complex graph algorithms).

**Traced to:** BR-X3 (Conservation of Money) — type safety reduces the risk of calculation errors that corrupt financial data.

---

## Local Database: SQLite

**Why not AsyncStorage / MMKV?**  
Key-value stores cannot query relationships. NUMI needs: "sum all expense transactions in Category X during Period Y from Wallet Z." SQLite handles this with standard SQL.

**Why not WatermelonDB / Realm?**  
WatermelonDB adds sync complexity we do not need for v1. Realm is proprietary and heavy. SQLite is boring, standard, and debuggable with any SQL tool.

**Why expo-sqlite specifically?**  
It is bundled with Expo, requires no native module linking, and supports both iOS and Android. For web, a WASM SQLite build or IndexedDB fallback will be used.

**Traced to:** Principle 6 (Device is Source of Truth) — the device must own a queryable, durable database that works without internet.

---

## State Management: Zustand

**Why not Redux?**  
Redux is overkill for NUMI's state shape. The engine returns new `AppState` on every operation. Zustand stores this immutable state and triggers React re-renders.

**Why not React Context?**  
Context causes unnecessary re-renders when any slice changes. Zustand uses selectors for granular subscriptions.

**Why not Jotai / Recoil?**  
Atomic state is interesting but adds mental overhead. NUMI's state is a single coherent ledger (`AppState`). A single store with slices is clearer.

**Traced to:** I1 (Safe-to-Spend visible immediately) — state updates must propagate to UI in &lt;16ms. Zustand selectors achieve this.

---

## Sync Infrastructure: Supabase (v2)

**Why not Firebase?**  
Firebase is proprietary and charges by read/write. Supabase is open-source PostgreSQL with self-hosting options. If NUMI grows, the database can be self-hosted to control costs.

**Why not a custom REST API?**  
A solo developer should not maintain a backend server for v1. Supabase provides auth, row-level security, and real-time subscriptions out of the box.

**Why deferred to v2?**  
Sync is a Premium feature. v1 must ship without any cloud dependency to prove the offline-first model works.

**Traced to:** Principle 3 (Free Core, Funded Future) — sync costs money to run. It must be funded by Premium users, not subsidized by ads or data harvesting.

---

## Styling: NativeWind + Tailwind

**Why not StyleSheet / Styled Components?**  
NativeWind brings Tailwind classes to React Native. This allows `packages/design-system` to export Tailwind config and token files used by both mobile and web. One source of truth for spacing, colors, and typography.

**Why not React Native Paper / NativeBase?**  
Component libraries impose their own design language. NUMI's design system is custom-built for South African accessibility (sunlight readability, large fonts). Starting from tokens gives full control.

**Traced to:** Principle 2 (Visibility in the Moment) — styling must serve readability, not aesthetic trends.

---

## Testing

| Layer | Tool | Purpose |
|---|---|---|
| Domain Engine | Vitest | Unit tests for all calculations and business rules |
| Mobile | Jest + React Native Testing Library | Component and integration tests |
| Web | Vitest + React Testing Library | Component and page tests |
| E2E | Maestro (mobile) + Playwright (web) | Critical path: log transaction, see safe-to-spend |

**Why Vitest over Jest for domain?**  
Vitest is faster, has native TypeScript support, and shares config with the web app's Vite tooling.

**Why Maestro over Detox?**  
Maestro tests are written in YAML and do not require native build steps. A solo developer can write `tapOn: "Save"` without maintaining Xcode simulators.

---

## Deployment

| Target | Method | Trigger |
|---|---|---|
| Mobile (iOS/Android) | EAS Build (Expo) | Manual release via `eas build` |
| Web | Static export to Vercel | Git push to `main` |
| Domain Package | Published to npm (private) | Git tag `domain@v*` |

---

## Forbidden Technologies

| Technology | Why Excluded |
|---|---|
| Firebase Analytics / Google Analytics | Violates Principle 4 (No Surveillance) |
| Redux | Unnecessary complexity |
| GraphQL | Overkill for CRUD sync. REST or Supabase client is sufficient. |
| MongoDB | Not embedded. Requires server. SQLite is sufficient. |
| Flutter | Different ecosystem, no web sharing with mobile |

---

## What Happens After This Document

These choices are implemented in `02_System_Design.md` — the boxes, arrows, and data paths.

Next: docs/playbook/03_Architecture/02_System_Design.md