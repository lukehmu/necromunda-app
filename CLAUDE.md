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
  reducer**; components only dispatch. `clearsThisTurn` is exported because the
  card UI needs to show the same recovery prediction the reducer will act on.
- `src/lib/storage.ts` — persistence. The entire state is one JSON blob in
  `localStorage` under `necromunda-tracker`. `normaliseFighter` is the migration
  path: it coerces partial or older-version fighters (v1/v2 had a boolean
  `injured` instead of `condition` + `fleshWounds`) rather than versioning
  migrations separately. **Bump `BattleState['version']` and extend
  `normaliseFighter` together when the fighter shape changes**, or existing
  users lose their roster.
- `src/components/` — presentational, each reads `useStore()` directly. No prop
  drilling, no local state except the add-fighter form inputs.

### Game rules encoded in the reducer

Two deliberately automated rules, everything else is manual toggling:

1. Dropping a fighter to 0 wounds sets `condition: 'down'` (the likeliest
   Injury dice result), only on the transition to zero — so a manual change to
   flesh wound or out of action is not clobbered by further wound edits.
2. Suppression recovery, which differs by edition and is selectable at runtime
   via `state.rules`:
   - `lrb` — classic Living Rulebook p.12. Pinned at the start of a turn means
     the fighter misses that turn and stands up at its end, *regardless of
     activation*. Implemented by stamping `suppressedSinceTurn` and clearing on
     the `newTurn` after that (`suppressedSinceTurn < turn`).
   - `n18` — pinned is Prone and cleared by a Stand Up action, so toggling
     `activated` on clears it immediately.

   Changing either rule means changing `toggleFlag` and `clearsThisTurn`
   together, plus the hint text in `FighterCard`.

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
