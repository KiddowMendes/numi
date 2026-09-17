# @numi/design-system

## Overview

Design tokens and the shared UI component library used by both apps. It is the single source for spacing, colors, and typography.

## Stack

- TypeScript
- Depends on @numi/types

## Commands

No local scripts. It is consumed as a workspace package from the apps.

## Conventions

- The components that render money or dates are the ones that get tests.
- Tokens are the one place visual values live; apps do not hardcode colors or spacing.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._