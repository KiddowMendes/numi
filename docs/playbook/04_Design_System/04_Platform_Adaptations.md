---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/04_Design_System/01_Tokens.md"
  - "docs/playbook/04_Design_System/02_Components.md"
  - "docs/playbook/03_Architecture/01_Tech_Stack.md"
decision_record: none
---

# 04 — Platform Adaptations

> What differs between mobile and web, and why. Keep this list tiny.

---

## Adaptation Philosophy

1. **One shared design system.** Mobile and web use the same tokens, same components, same patterns.
2. **Adaptation is structural, not visual.** Colors, typography, and spacing never change.
3. **Mobile is primary.** Web is a read-mostly mirror. Web does not get features mobile lacks.

---

## Navigation

### Mobile (Primary)

- **Pattern:** Bottom tab bar.
- **Height:** 64px including safe area.
- **Tabs:** Home (Current), Plan (Planned), History (Actual), Settings.
- **Active state:** Icon `Bold` weight, `color.primary`. Label `typography.caption`.
- **Inactive state:** Icon `Regular` weight, `color.textMuted`.
- **Behavior:** Tap to switch. No swipe between tabs.

### Web (Desktop)

- **Pattern:** Left sidebar.
- **Width:** 240px.
- **Items:** Same as mobile tabs, plus "Export data" (if Premium).
- **Active state:** Left border 3px `color.primary`, background `color.surfaceRaised`.
- **Behavior:** Click to navigate. URL updates (`/`, `/plan`, `/history`, `/settings`).

### Web (Mobile Browser)

- **Pattern:** Bottom tab bar, identical to mobile app.
- **Exception:** FAB hidden. Primary action in header instead.

---

## Input Methods

### Mobile

- **AmountInput:** Numeric keypad (`keyboardType="numeric"`). No decimal by default.
- **TextInput:** Standard keyboard. `autoCapitalize="sentences"`.
- **Date picker:** Native platform picker. No custom calendar component.
- **Selection:** Long press for context menu. No right-click.

### Web

- **AmountInput:** HTML `input type="number"`, step="1". Cents toggle via button.
- **TextInput:** Standard keyboard. `autocomplete="off"` for sensitive fields.
- **Date picker:** Native HTML date input.
- **Selection:** Click for focus. Right-click disabled (no custom context menu).

---

## Gestures

### Mobile

| Gesture | Action | Component |
|---|---|---|
| Tap | Select, activate | All interactive |
| Long press | Multi-select (future), context menu | ListItem |
| Swipe left | Reveal actions (Reverse, Delete) | ListItem |
| Swipe down | Dismiss BottomSheet | BottomSheet |
| Pull down | Refresh / Sync | Lists |
| Pinch | None | — |

### Web

- No swipe gestures.
- Click and keyboard navigation only.
- `Escape` key dismisses modals and sheets.
- `Tab` key navigates focus order logically.

---

## Modals & Overlays

### Mobile

- **BottomSheet:** Slides up from bottom. Draggable handle. Dismiss by drag down or tap backdrop.
- **Toast:** Bottom of screen, 24px above FAB or bottom edge.
- **Full-screen:** Period creation, Wallet setup. Push navigation, not modal.

### Web

- **Modal:** Centered, max-width 480px. Backdrop click to dismiss. `Escape` to dismiss.
- **Toast:** Bottom center, 24px from bottom.
- **Full-screen:** Same as mobile but centered in viewport with max-width container.

---

## Safe Areas & Notches

### Mobile

- **iOS:** Respect `SafeAreaView`. Bottom tab bar adds padding for home indicator. Status bar text is `color.textPrimary` on `color.background`.
- **Android:** Respect `StatusBar` height. No translucent bars. Solid `color.background`.
- **Landscape:** Bottom tab bar moves to side (80px width) on tablets. Phones keep bottom tabs.

### Web

- No safe area concerns.
- Max content width: 720px centered. Background `color.background` extends full width.

---

## Performance Adaptations

### Mobile

- **Images:** No raster images. Phosphor icons only. Keeps APK < 50MB.
- **Animations:** `layout` animations disabled on low-end devices (`reduceMotion` or RAM < 2GB).
- **Lists:** Virtualized after 50 items.

### Web

- **Images:** Same. No raster images.
- **Animations:** CSS transitions only. No Reanimated on web.
- **Lists:** Virtualized after 100 items.

---

## Platform-Specific Exceptions

| Feature | Mobile | Web | Reason |
|---|---|---|---|
| Biometric lock | Yes | No | Web cannot reliably access biometrics |
| Push notifications | Yes | No | Web notifications deferred to v2 |
| Share sheet | Yes | No | Web uses native download |
| Haptic feedback | Yes (light) | No | Web vibration API is intrusive |
| Widget | Yes (v2) | No | Platform-specific |

---

## Forbidden Adaptations

The following are **not** platform adaptations. They are inconsistencies, and they are forbidden:

- Different color palettes per platform.
- Different typography per platform.
- Different component behavior per platform (e.g., Button looks different on web).
- Web-only features not in mobile.
- Mobile-only UI patterns that cannot be expressed on web (e.g., force touch).

---

## What Happens After This Document

The Design System is complete. It feeds into `05_Features/` where every screen references these tokens, components, patterns, and adaptations.

Next: `docs/playbook/05_Features/01_Onboarding/Overview.md`

---

## Design System Lock Criteria Check

Before locking `04_Design_System/`:

- [ ] Tokens are semantic, not literal (`color.stateSafe`, not `green`).
- [ ] Every component has a purpose, variants, and usage rules.
- [ ] Patterns cover empty states, errors, loading, and confirmation.
- [ ] Platform adaptations list is minimal and justified.
- [ ] No design decision contradicts `02_Principles.md` R2.4 (sunlight readable).