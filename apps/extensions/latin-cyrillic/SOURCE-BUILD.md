# Building the Firefox add-on from this source archive

For addons.mozilla.org reviewers. The archive is a slice of a pnpm monorepo:
the add-on (`apps/extensions/latin-cyrillic`) plus the two workspace packages
it imports (`packages/transliteration`, `packages/ui`).

Requirements: Node.js 22 or newer, and pnpm 11 (pinned in the root
`package.json` as `packageManager`; `corepack enable` provides it).

Run from the archive root:

```sh
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
pnpm --filter @webiston/transliteration build
pnpm --filter latin-cyrillic-extension build:firefox
```

`--ignore-scripts` skips the root `prepare` script, which installs git hooks
for the full repository and is not part of the add-on build.

The add-on is written to
`apps/extensions/latin-cyrillic/.output/firefox-mv2/` — the same files as the
uploaded package. Bundler: Vite via WXT (`wxt.config.ts`).

The add-on makes no network requests: conversion runs locally in
`packages/transliteration`, and `storage` holds only the theme, the
quick-convert toggle and the chosen alphabet.
