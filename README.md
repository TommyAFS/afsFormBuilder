# afsFormBuilder

Local dev sandbox for the reusable in-house form builder. The component
(`BookingFormNew`) lives here as an editable copy; everything it depends on is
**symlinked from the real `website-front-end` repo**, so it runs against real
code with zero stubbing and stays in sync.

## How it's wired

```
afsFormBuilder/
  app/                              ← Next.js dev harness (not part of the component)
    layout.tsx  page.tsx
  components/
    atoms      -> REPO/components/atoms       (symlink, gitignored)
    molecules  -> REPO/components/molecules   (symlink, gitignored)
    organisms/
      BookingFormNew/               ← THE COMPONENT — your editable copy, imports untouched
  api types constants hooks utils contexts logging models svgs test
                                    ← symlinks to REPO/* (gitignored)
  _shims/sentry.js                  ← no-op Sentry stub for local dev
  next.config.js tsconfig.json .svgrrc.js package.json
```

The component's relative imports (`../../molecules/X`, `../../../types/Y`, …)
resolve through the symlinks into the real repo. Because the repo uses no path
aliases, the depths line up exactly — so **the component files are never
edited**, and pasting back is just copying `components/organisms/BookingFormNew`
into the repo.

## Prerequisites

Private `@afs/*` packages need an npm token via env var (the committed `.npmrc`
reads `${NPM_TOKEN}` — no secret is stored in the file):

```bash
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx   # add to ~/.zshrc to persist
```

The sibling repo must exist at `../../website-front-end` (or pass its path to
the link script). Its `node_modules` must be installed — the symlinked real code
resolves its own dependencies (moment, downshift, …) from there.

## Setup

```bash
export NPM_TOKEN=npm_...
npm install
./scripts/link-repo.sh                      # or: ./scripts/link-repo.sh /path/to/website-front-end
```

## Run

```bash
npm run dev        # http://localhost:3000  (hot reload)
```

`app/page.tsx` mounts `BookingFormNew` with stub props. It's rendered
client-only (`ssr: false`) on purpose — see notes.

## Scripts

| Script | Does |
|--------|------|
| `npm run dev` | Next.js dev server with HMR |
| `npm run build` | Production build |
| `./scripts/link-repo.sh [repoPath]` | (Re)create the repo symlinks + copy `.svgrrc.js` |
| `npm run storybook` | Storybook (parked — preview build needs a fix) |

## Notes / gotchas (why the config looks the way it does)

- **Single React (`next.config.js`)**: symlinked real code resolves React from
  the repo's `node_modules` — a second copy. React is aliased to this sandbox's
  copy **on the client bundle only**; aliasing it on the server breaks Next's
  RSC React (`React.cache`). `@afs/*` is deliberately *not* aliased (that breaks
  its `exports` subpaths like `@afs/components/Field`).
- **Client-only render**: the form is `dynamic(..., { ssr: false })` to avoid a
  second React copy during SSR across the symlink boundary.
- **Sentry stubbed**: the real `softBookingApi` imports `@sentry/nextjs`, which
  drags the full server SDK into the bundle. `_shims/sentry.js` no-ops it.
- **SVGs**: imported as React components via `@svgr/webpack` + `.svgrrc.js`,
  matching the repo.
- **Extra npm deps**: `dompurify`, `zod`, `@sentry/nextjs` (stubbed at build),
  `@testing-library/react` are direct deps of the component, installed here at
  the repo's pinned versions.
- **Symlinks are machine-specific** and gitignored; re-run `link-repo.sh` after
  a clone or if the repo moves. Paste-back ignores them entirely.
- **Rotate the old npm token** that was previously committed in `.npmrc`.
```
