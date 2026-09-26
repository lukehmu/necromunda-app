# Necromunda Gang Tracker

**→ [lukehmu.github.io/necromunda-app](https://lukehmu.github.io/necromunda-app/)**

Offline-first table-side tracker for a Necromunda gang: wounds, activation,
injuries and status flags per fighter, plus a round counter.

Installable as a PWA — open the link on a phone and use "Add to Home Screen"
to get a full-screen app that works with no signal.

## What it tracks

- **Fighters**: name and total wounds, added on the fly. Most fighters have
  1 wound; leaders and veterans may have 2 or more, so the total is editable
  per fighter.
- **Wounds**: `-` / `+` buttons, with pips alongside the number.
- **Flags**: Activated, Suppressed, No ammo, Injured.
- **Round**: "New turn" bumps the counter and clears every activation.

Everything lives in `localStorage` on the device. No accounts, no sync.

## Live games

One player runs the game; everyone else can watch it live on their own phone.

- **Host:** Live game → *Share this game*. You get a 4-letter code, a QR code
  and a share link. Only your phone can change anything.
- **Watch:** scan the QR code, open the link, or type the code under *Watch a
  game*. Everything updates as the host plays. Your own gang is kept on your
  phone and comes back when you leave.
- **Stop sharing** disconnects everyone. Idle games are deleted after 7 days.

It runs on a small Cloudflare Worker in `worker/` (see Deploying).

## The automatic rules

Written against the Necromunda (2026) rules:

1. **Injured** means being on 0 wounds. Dropping to 0 sets it; getting a
   wound back (a Medicae, say) clears it. Being knocked down or seriously
   injured is shown by the model on the table, so the app does not track it.
2. **Suppressed** fighters only get 1 action when they activate, and recover
   at the end of that activation. So marking a suppressed fighter Activated
   clears it. A suppressed fighter who has not activated yet stays suppressed
   through a new turn.

Anything else (being charged also clears suppression, reloading, and so on)
is a manual toggle.

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

### The sync Worker

`worker/` deploys separately to Cloudflare, via `.github/workflows/worker.yml`
on pushes that touch `worker/` or `shared/`. It needs:

- repository **secret** `CLOUDFLARE_API_TOKEN` (an API token with *Workers
  Scripts: Edit*),
- repository **variable** `CLOUDFLARE_ACCOUNT_ID`,
- repository **variable** `SYNC_URL`, the Worker's URL, so the Pages build
  turns live games on.

Without them the Worker job is skipped and the app simply hides live games.
Locally: `npm run worker:dev`, then `SYNC_URL=http://localhost:8787 npm run dev`.

## Stack

Vite · React 19 · Tailwind CSS 4 · Biome · lefthook · vite-plugin-pwa ·
Cloudflare Workers + Durable Objects (PartyServer)
