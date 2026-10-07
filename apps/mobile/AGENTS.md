# mobile

## Overview

The Expo React Native app, NUMI's primary interface. It uses expo router for file based routing and zustand for client state. Routes live under `app/`, app code under `src/`.

## Stack

- Expo SDK 57, React Native 0.86, React 19
- expo router (file based routes, entry is `expo-router/entry`)
- zustand for client state
- Workspace deps: @numi/domain, @numi/database, @numi/design-system, @numi/utils

## Commands

```bash
# Dev (from repo root)
pnpm --filter mobile start

# Run on a platform
pnpm --filter mobile android
pnpm --filter mobile ios
pnpm --filter mobile web

# Lint
pnpm --filter mobile lint
```

## Conventions

- Routes are file based under `app/`: four groups (root, `(onboarding)/`, `(auth)/`, `(tabs)/`), with `_layout.tsx` files defining the navigational shell.
- Screens go through the domain engine, never directly into the repository. Sessions in this repo have fixed boundary crossings where a screen reached into the repository and was moved back to an engine call.
- Nothing in `app/` imports from `app/`. Routes are leaf nodes; every shared resource comes from `src/` (via `@/`) or a workspace package.

## Routes

14 route files. The tables below are the complete dependency map: what each route imports from the repo, and how far each shared module reaches. React Native and Expo primitives (`react-native`, `expo-router`, `react-native-reanimated`, `expo-haptics`, `react-native-safe-area-context`, …) are omitted — they carry no repo coupling. The one third-party native dep worth naming is `@react-native-community/datetimepicker`, used only by `quick-setup`.

| Route                          | `src/` imports                                                                                                                                                                                             | Workspace packages            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `_layout.tsx`                  | `lib/polyfill`, `components/app-toast`, `constants/tokens`, `hooks/use-stack-screen-options`, `hooks/use-theme`, `store`                                                                                   | —                             |
| `review.tsx`                   | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `store`                                                                                                     | —                             |
| `(onboarding)/_layout.tsx`     | `hooks/use-stack-screen-options`                                                                                                                                                                           | —                             |
| `(onboarding)/welcome.tsx`     | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-theme`, `store`                                                                                  | —                             |
| `(onboarding)/pin.tsx`         | `components/app-icon`, `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-reduced-motion`, `hooks/use-shake`, `hooks/use-theme`, `lib/pin`, `store` | —                             |
| `(onboarding)/quick-setup.tsx` | `components/app-icon`, `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-theme`, `lib/category-accent`, `store`                                    | `@numi/domain`, `@numi/utils` |
| `(onboarding)/all-set.tsx`     | `components/app-icon`, `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-theme`, `store`                                                           | —                             |
| `(auth)/_layout.tsx`           | `hooks/use-stack-screen-options`                                                                                                                                                                           | —                             |
| `(auth)/unlock.tsx`            | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-shake`, `lib/pin`, `store`                                                                       | —                             |
| `(tabs)/_layout.tsx`           | `components/app-icon`, `constants/tokens`, `hooks/use-tab-bar-space`, `hooks/use-theme`                                                                                                                    | —                             |
| `(tabs)/index.tsx`             | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-tab-bar-space`, `store`                                                                          | `@numi/domain`                |
| `(tabs)/plan.tsx`              | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-category-accent-map`, `hooks/use-tab-bar-space`, `store`                                         | `@numi/domain`                |
| `(tabs)/history.tsx`           | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-category-accent-map`, `hooks/use-tab-bar-space`, `store`                                         | `@numi/domain`                |
| `(tabs)/settings.tsx`          | `components/screen-background`, `components/themed-text`, `components/ui`, `constants/tokens`, `hooks/use-tab-bar-space`, `store`                                                                          | —                             |

### Reach of each shared module

| Module                                                                                    | Routes                                                                                |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `constants/tokens`                                                                        | 12 (every route but the `(auth)` and `(onboarding)` layouts)                          |
| `store`                                                                                   | 11 (every route but the three group layouts)                                          |
| `components/ui`                                                                           | 10 (every route but the four `_layout` files)                                         |
| `components/themed-text`                                                                  | 10 (every route but the four `_layout` files)                                         |
| `components/screen-background`                                                            | 10 (every route but the four `_layout` files)                                         |
| `hooks/use-theme`                                                                         | 6 (`_layout`, `(tabs)/_layout`, `welcome`, `pin`, `quick-setup`, `all-set`)           |
| `hooks/use-tab-bar-space`                                                                 | 5 (`(tabs)/_layout`, `index`, `plan`, `history`, `settings`)                          |
| `components/app-icon`                                                                     | 4 (`(tabs)/_layout`, `quick-setup`, `pin`, `all-set`)                                 |
| `hooks/use-stack-screen-options`                                                          | 3 (the root, `(auth)` and `(onboarding)` stacks; `(tabs)` is a `Tabs`, not a `Stack`) |
| `hooks/use-shake`, `lib/pin`                                                              | 2 (`unlock`, `pin`)                                                                   |
| `hooks/use-category-accent-map`                                                           | 2 (`plan`, `history`)                                                                 |
| `lib/category-accent`, `hooks/use-reduced-motion`, `components/app-toast`, `lib/polyfill` | 1 each (`quick-setup`, `pin`, `_layout`, `_layout`)                                   |

Invariants the tables encode: no route imports `@numi/database` (screens reach the repository through the engine in `store`), and no route imports `@numi/design-system` directly (`constants/tokens` is the platform seam).

## Agent skills

Installed as one bundle from `expo/skills`. Read the skill that matches the task before you run the related tool.

- [eas-app-stores](.agents/skills/eas-app-stores/): expo/skills, app store submission
- [eas-hosting](.agents/skills/eas-hosting/): expo/skills, EAS Hosting deployment
- [eas-observe](.agents/skills/eas-observe/): expo/skills, metrics and logs from EAS Observe
- [eas-simulator](.agents/skills/eas-simulator/): expo/skills, installing EAS builds on a simulator
- [eas-update](.agents/skills/eas-update/): expo/skills, over the air updates with EAS Update
- [eas-update-insights](.agents/skills/eas-update-insights/): expo/skills, analytics for EAS Update
- [eas-workflows](.agents/skills/eas-workflows/): expo/skills, EAS Workflows CI
- [expo-animation](.agents/skills/expo-animation/): expo/skills, animation patterns and reanimated
- [expo-app-clip](.agents/skills/expo-app-clip/): expo/skills, iOS App Clips
- [expo-brownfield](.agents/skills/expo-brownfield/): expo/skills, adding Expo to an existing native app
- [expo-data-fetching](.agents/skills/expo-data-fetching/): expo/skills, data fetching patterns
- [expo-design-system](.agents/skills/expo-design-system/): expo/skills, design system patterns
- [expo-dev-client](.agents/skills/expo-dev-client/): expo/skills, custom development clients
- [expo-dom](.agents/skills/expo-dom/): expo/skills, DOM components
- [expo-examples](.agents/skills/expo-examples/): expo/skills, example apps and snippets
- [expo-migrate-module](.agents/skills/expo-migrate-module/): expo/skills, migrating config plugins
- [expo-module](.agents/skills/expo-module/): expo/skills, native modules
- [expo-native-ui](.agents/skills/expo-native-ui/): expo/skills, native UI components
- [expo-overview](.agents/skills/expo-overview/): expo/skills, Expo SDK overview and project review
- [expo-project-structure](.agents/skills/expo-project-structure/): expo/skills, standard Expo project layout
- [expo-router](.agents/skills/expo-router/): expo/skills, file based routing with expo router
- [expo-skill-eval](.agents/skills/expo-skill-eval/): expo/skills, evaluating an Expo skill
- [expo-skill-feedback](.agents/skills/expo-skill-feedback/): expo/skills, sending feedback on Expo skills
- [expo-ui](.agents/skills/expo-ui/): expo/skills, Expo UI components
- [expo-upgrade](.agents/skills/expo-upgrade/): expo/skills, upgrading between Expo SDK versions
- [expo-web-to-native](.agents/skills/expo-web-to-native/): expo/skills, porting web UI to native

MCP servers: Expo MCP (recommended)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
