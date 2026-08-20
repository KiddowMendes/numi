---
version: 1.0.0
status: Draft
owner: Product
related_documents: [03_Architecture/02_System_Design.md, 07_Roadmap/01_MVP_Scope.md]
decision_record: null
---

# 04 — Release Process

> **Status:** Draft

## Packages

| Package | Channel | Tooling |
|---|---|---|
| Mobile app | App Store / Play Store | EAS Build + EAS Submit |
| Web app | Vercel (static export) | `pnpm build` → deploy |
| Domain | npm | `pnpm publish` (`packages/domain`) |

## Mobile (EAS)

- Channels: `production` (store release), `preview` (TestFlight / internal track), `development` (local builds).
- Versioning: `mobile@vX.Y.Z` tag on the release commit; EAS build number derived from it.
- Expo Updates (OTA) allowed for JS-only changes. Native changes (expo SDK bump, new native module) always go through the store.
- Submit manually, never scripted blindly: `eas submit --platform all --profile production`.

## Web (Vercel)

- `main` push to `apps/web` deploys automatically to the production alias.
- The web app is a static export — no server runtime. Auth tokens are httpOnly cookies handled by Supabase Auth; secrets never live in the web bundle.
- Previews on pull requests; no `staging` environment in v1.

## Domain (npm)

- Publish on semver bump: `pnpm publish` from `packages/domain`.
- Tag `domain@vX.Y.Z` at the same commit.
- Consuming apps upgrade via workspace protocol in v1; the registry copy matters only for external consumers (not in v1 scope).

## Rollback

| Package | How |
|---|---|
| Mobile | Submit previous build via EAS (approval applies). No OTA downgrade; deprecated builds route users to update. |
| Web | Vercel instant rollback to previous deployment. |
| Domain | `npm unpublish` only within 72h per registry policy; prefers publishing a fixed version. |

## Post-Release

1. Update `docs/playbook/08_Changelog/` with what shipped.
2. Cut `mobile@vX.Y.Z` / `web@vX.Y.Z` / `domain@vX.Y.Z` tags.
3. Empty the open Release section of the roadmap (`07_Roadmap/`).
4. Bump version in the changed package's `package.json`.

## Pre-Release Checklist

- [ ] `pnpm lint`, `pnpm test`, `pnpm build` clean on `main` head
- [ ] Domain coverage ≥ 100% gate passed
- [ ] Changelog entries written
- [ ] Smoke test on: nearest device (mobile), latest browser (web)