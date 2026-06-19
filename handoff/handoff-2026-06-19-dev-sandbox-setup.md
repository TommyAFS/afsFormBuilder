# Handoff — afsFormBuilder dev sandbox setup

**Date:** 2026-06-19
**Repo:** `git@github.com:TommyAFS/afsFormBuilder.git` (branch `main`, pushed)
**Working dir:** `/Users/tommy/Documents/work/experiments/afsFormBuilder`

## What this is

A local dev sandbox for an experimental, reusable, **config-driven** in-house
form builder. The seed is `BookingFormNew`, stripped from the main repo
`website-front-end` (Pages Router). The sandbox is a Next.js **App Router** app
that runs the component against the **real repo code via symlinks**, so the
component files stay byte-identical and paste-back is just copying the folder.

## Current status: ✅ WORKING

`npm run dev` → http://localhost:3000 renders the full form with correct styles
and fonts, against real symlinked dependencies. Everything is committed/pushed.

## Read these first (don't re-derive)

- **`README.md`** — full architecture, setup steps, scripts, and a "Notes /
  gotchas" section explaining every config decision. This is the source of truth.
- **`next.config.js`** — svgr rule, Sentry stub alias, `next/config`
  NormalModuleReplacement plugin. Comments explain why each exists.
- **`scripts/link-repo.sh`** — recreates the (gitignored) symlinks + `public/`.
- **`_shims/`** — `sentry.js` (no-op) and `next-config.js` (publicRuntimeConfig).

## Critical: after any fresh clone

Symlinks and `public/` are **gitignored** (machine-specific). They MUST be
recreated or nothing resolves:

```bash
export NPM_TOKEN=npm_...          # for private @afs/* installs
npm install
./scripts/link-repo.sh            # assumes repo at ../../website-front-end
npm run dev
```

The main repo must exist at `../../website-front-end` with its `node_modules`
installed (symlinked code resolves its deps from there).

## Problems already solved (history, so you don't repeat them)

Each was a Pages-Router-vs-App-Router or symlink-boundary quirk, fixed in config
— never by editing the component. In order: missing toolchain → broken relative
imports (symlinks) → SVG imports (`@svgr/webpack` + copied `.svgrrc.js`) →
missing npm deps (dompurify, zod, @sentry/nextjs, @testing-library/react) →
Sentry dragging server SDK (stubbed) → React.use/cache crash (do NOT alias
react; Next vendors its own) → `next/config` undefined (shim via plugin, not
alias — Next's own alias wins otherwise) → unstyled (missing
`@afs/components/styles/website.min.css` + `public/` symlink for fonts).

## Leftover / next steps

1. **Tidy `app/page.tsx`** — still has debug instrumentation from the
   white-screen hunt: a green "Sandbox page mounted ✓" heading and an inline
   `ErrorBoundary`. Suggested: drop the heading, keep the `ErrorBoundary`.
2. **Start the actual experiment** — adapt `BookingFormNew` into a config-driven
   `FormBuilder`. The injection seams already exist and map cleanly to a config:
   the `save` / `onSubmitSuccess` props, plus the stubbed `next/config` and
   Sentry boundaries.
3. **Optional fidelity** — if styling edge cases appear, the repo also applies a
   css-loader class-name template patch and loads `pages/app.scss` (mostly
   lazy-image styles); both were intentionally skipped as non-critical.
4. **Storybook is parked** — `.storybook/` config exists but its preview build
   fails with an unrelated webpack `'tap'` error. Fix or remove if needed.

## Housekeeping / security

- **Rotate the npm token** on npmjs.com — `npm_mpX5…` (now redacted) was once in
  `.npmrc` in plaintext. It is NOT in git history (verified), but it lived in the
  file before being replaced with `${NPM_TOKEN}`, so treat it as exposed.
- `.npmrc` is committed but contains only config + the `${NPM_TOKEN}` reference.

## Suggested skills for next session

- **`/pickup`** — to resume from this handoff.
- **`/run`** — to launch the app and confirm the form still renders.
- **`/simplify`** or **`/code-review`** — when tidying `app/page.tsx` or before
  committing the config-builder work.
