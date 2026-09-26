# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # vite dev server
npm run build     # tsc -b && vite build  (typecheck is part of the build)
npm run preview   # serve dist/ — note it is served under the base path, i.e. /necromunda-app/
npm run typecheck # tsc -b --noEmit
npm run lint      # biome check .
npm run format    # biome check --write .
```

There is no test suite. Verification is done by building and driving the app in
a browser.

Lefthook runs biome + typecheck on pre-commit and a full build on pre-push, so a
commit that passes hooks is already lint- and type-clean.

## Architecture

A single-screen React SPA with no router. All state lives in one reducer.

- `src/store.tsx` — the whole application. A `useReducer` over `BattleState`,
  exposed through `StoreProvider` / `useStore`. **All game rules live in this
  reducer**; components only dispatch.
- `src/lib/storage.ts` — persistence. The entire state is one JSON blob in
  `localStorage` under `necromunda-tracker`. `normaliseFighter` is the migration
  path: it coerces partial or older-version fighters rather than versioning
  migrations separately (v3 had `condition` + `fleshWounds` and a `rules`
  setting; they collapse into the single `injured` flag). **Bump `BattleState['version']` and extend
  `normaliseFighter` together when the fighter shape changes**, or existing
  users lose their roster.
- `src/components/` — presentational, each reads `useStore()` directly. No prop
  drilling. Local state is limited to transient UI: the add-fighter inputs and
  `ConfirmButton`'s armed state.
- `src/i18n/en.ts` — **every user-facing string**, including aria-labels and
  the rules tips. Components import `t`; never inline copy. Interpolated
  strings are functions (`t.fighter.remove(name)`). Build-time page metadata is
  the one exception and lives in `vite.config.ts`.
- Destructive actions use `ConfirmButton` (tap to arm, tap again to commit,
  auto-disarms after 4s). Do not use `window.confirm()`.

### Game rules encoded in the reducer

Rules follow **Necromunda (2026)**. Its quick reference defines them; the
classic LRB and N18 books differ, so do not reintroduce their pinning rules.
Two rules are automated, everything else is a manual toggle:

1. `injured` is "on zero wounds". `applyWounds` sets it when wounds reach 0 and
   clears it when they rise above 0, only on those transitions, so a manual
   toggle is not undone by unrelated edits. Down / seriously injured is shown
   on the table and deliberately not tracked.
2. Suppressed costs one action and lifts at the end of the fighter's
   activation, so `toggleFlag` clears `suppressed` when `activated` turns on.
   `newTurn` only resets activations.

The app was deliberately simplified after feedback from the player it is
built for: prefer fewer toggles over modelling dice outcomes the table already
shows.

### Theming and visual language

Underhive-industrial look: riveted gunmetal plates in dark mode, a printed grey
fighter datasheet in light mode. Keep to these constraints when adding UI:

- **Colour.** Tailwind v4 `@theme` tokens in `src/index.css` are `var(--surface-*)`
  / `var(--accent-*)` indirections, so light mode is a variable swap. **Do not
  add `dark:` classes**; redefine the variables. Light values are declared twice
  on purpose: under `@media (prefers-color-scheme: light)` scoped to
  `:root:not([data-theme='dark'])` for "system", and under
  `:root[data-theme='light']` for the explicit choice. `hazard` is the only
  interactive accent; `blood` means injury and `toxin` means suppression, and
  neither is used for anything else.
- **Material.** `.plate` (bevelled panel with corner rivets), `.well` (recessed
  input/inactive control), `.hazard-band` and `.press` (transform-only tactile
  push) are component classes in `index.css`. Reuse them rather than restyling.
- **Shape.** Every corner is `rounded-[2px]`. No other radius.
- **Type.** `font-stencil` (Big Shoulders Stencil) for big numbers only,
  `font-condensed` (Barlow Condensed, uppercase) for labels and controls,
  default `font-sans` (Barlow) for sentences. Fonts are self-hosted via
  fontsource Latin subsets imported in `main.tsx`, so the PWA precaches them.
  Import them **without** `.css` (the package exports map appends it) and from
  JS, not CSS: Tailwind's CSS `@import` drops them silently.
- **Icons.** `@phosphor-icons/react`, using the `*Icon` export names (the bare
  names are deprecated), `weight="bold"`.
- **Motion.** Feedback only, and everything is zeroed under
  `prefers-reduced-motion`.

`useAppliedTheme` in `ThemeToggle.tsx` sets/removes `data-theme` and keeps the
`theme-color` meta tag in sync.

### PWA and deployment

`vite.config.ts` reads `base` from `BASE_PATH` (default `/necromunda-app/`)
because the app is served from a GitHub Pages subpath; the deploy workflow
passes `/<repo-name>/`. The PWA manifest's `start_url`, `scope` and the workbox
`navigateFallback` are all derived from that same `base` — changing one by hand
breaks installation.

`registerType: 'autoUpdate'` means a stale service worker can serve an old
bundle during local testing. When a browser check does not reflect a code
change, unregister the service worker and clear caches before concluding
anything about the code.

### Page metadata

Title, description, theme colour and the absolute site URL live in the `site`
object in `vite.config.ts`, and feed the HTML head, Open Graph/Twitter cards,
JSON-LD and the PWA manifest. A small `siteMeta` plugin substitutes
`%SITE_*%` placeholders in `index.html`; edit copy there, not in the HTML.
`SITE_URL`, and `REPO_URL` (exposed to the app as the `__REPO_URL__` define
for the settings panel's source link), come from the workflow like `BASE_PATH`. `public/og-image.png` is
the 1200x630 social card; it is deliberately excluded from the service worker
precache.
