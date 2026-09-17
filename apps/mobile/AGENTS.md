# mobile

## Overview

The Expo React Native app, NUMI's primary interface. It uses expo router for file based routing and zustand for client state. Routes live under `app/`, app code under `src/`.

## Stack

- Expo SDK 57, React Native 0.86, React 19
- expo router (file based routes, entry is `expo-router/entry`)
- zustand for client state
- Workspace deps: @numi/domain and @numi/database

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

- Routes are file based under `app/`: the `(onboarding)/` and `(tabs)/` groups, with `_layout.tsx` files defining the navigational shell.
- Screens go through the domain engine, never directly into the repository. Sessions in this repo have fixed boundary crossings where a screen reached into the repository and was moved back to an engine call.

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