# Necromunda Gang Tracker

**→ [lukehmu.github.io/necromunda-app](https://lukehmu.github.io/necromunda-app/)**

Offline-first table-side tracker for a Necromunda gang: wounds, activation,
injuries and status flags per fighter, plus a round counter.

Installable as a PWA — open the link on a phone and use "Add to Home Screen"
to get a full-screen app that works with no signal.

## What it tracks

- **Fighters** — name and total wounds, added on the fly. Most fighters have
  1 wound; leaders and veterans may have 2 or more, so the total is editable
  per fighter.
- **Wounds** — `−` / `+` buttons. In a game wounds only ever go *down*; the
  `+` is for undoing a mistap, not healing.
- **Flags** — Activated, Suppressed, No ammo.
- **Injury** — Flesh wounds (stacking, each `-1` WS/BS), Down, Out of action.
- **Round** — "New turn" bumps the counter and clears every activation.

Everything lives in `localStorage` on the device. No accounts, no sync.

## The automatic rules

1. A fighter dropped to **0 wounds** is marked **Down** — the likeliest Injury
   dice result. Switch it to a flesh wound or out of action once the dice is
   read.
2. **Out of action** fighters are dimmed and drop out of the "still to
   activate" count.
3. **Suppression** clears on its own, by whichever edition's rule is selected
   in Settings (see below).

Nothing else is enforced. The app does not know the rulebook, so it will
happily let you do whatever the table agrees on.

### Suppression recovery, per edition

Settings has a toggle, because the two rulesets genuinely differ:

- **Classic LRB** (rulebook p.12) — a fighter pinned at the start of a turn
  *misses that turn* and stands up automatically at the end of it. Recovery
  has nothing to do with activating. So suppression applied during turn N is
  still in play throughout turn N+1, and lifts as turn N+1 ends.
- **N18** — a pinned fighter is Prone, and clears the condition by spending an
  activation on a Stand Up action. So marking them Activated lifts it
  immediately.

The LRB's early escapes (auto-recovery when engaged in melee, or an Initiative
check with a friendly within 2") are left manual — untoggle by hand.

## Development

```bash
npm install     # also installs the lefthook git hooks
npm run dev     # vite dev server
npm run build   # typecheck + production build into dist/
npm run preview # serve the production build
npm run lint    # biome check
npm run format  # biome check --write
```

Git hooks (lefthook):

- **pre-commit** — biome check/format on staged files, plus a typecheck.
- **pre-push** — full production build.

## Deploying

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on
every push to `main`. Pages is set to the "GitHub Actions" source.

The site is served from a subpath, so `vite.config.ts` sets `base` from the
`BASE_PATH` env var, and the canonical/social-card URLs from `SITE_URL`. The
workflow derives both from the repository, so renaming it needs no code change.

## Stack

Vite · React 19 · Tailwind CSS 4 · Biome · lefthook · vite-plugin-pwa
