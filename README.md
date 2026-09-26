# Necromunda Gang Tracker

Offline-first table-side tracker for a Necromunda gang: wounds, activation,
and status flags for each fighter, plus a round counter.

Installable as a PWA — open it on a phone and use "Add to Home Screen" to get
a full-screen app that works with no signal in the basement of a hive.

## What it tracks

- **Fighters** — name and total wounds, added on the fly.
- **Wounds** — `−` / `+` buttons, with an editable total.
- **Flags** — Activated, Suppressed, No ammo, Injured.
- **Round** — "New turn" bumps the round counter.

Everything lives in `localStorage` on the device. No accounts, no sync.

## The two automatic rules

1. A fighter dropped to **0 wounds** is flagged **Injured** automatically.
   Healing them back up leaves the flag set — clear it by hand when they
   recover.
2. **Suppression** clears at the start of the next turn, but only for fighters
   that actually **activated** while suppressed. A suppressed fighter who never
   activated stays suppressed. The card shows "Suppression lifts at the start of
   the next turn" once that is locked in.

Nothing else is enforced: the app does not know the rulebook, so it will happily
let you do whatever the table agrees on.

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

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` on every push to
`main`. Enable it once in **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

The build is served from a subpath, so `vite.config.ts` sets `base` from the
`BASE_PATH` env var (the workflow passes `/<repo-name>/`, and the local default
is `/necromunda-app/`). If the repository is renamed, nothing needs changing —
the workflow derives the path from the repository name.

## Stack

Vite · React 19 · Tailwind CSS 4 · Biome · lefthook · vite-plugin-pwa
