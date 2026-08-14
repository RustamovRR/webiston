#!/bin/sh
# Pre-push tests, scoped to WHAT THIS PUSH CHANGES.
#
# The full suite grew from 1.57s (2026-07-29, when lefthook.yml's budget was
# written) to ~38s at 1,842 tests — which is "gets bypassed with --no-verify"
# territory, and a bypassed hook is not a gate. CI runs the FULL suite on every
# push to dev/main (.github/workflows/ci.yml), so the local hook's job is the
# fast net, not the exhaustive one: `vitest related` walks the import graph
# from the files this push touches and runs only the tests that can see them.
set -e

branch=$(git branch --show-current)
base="origin/$branch"

# A branch with no upstream has no diff base — run everything once.
if ! git rev-parse --verify -q "$base" >/dev/null 2>&1; then
  exec pnpm vitest run
fi

# The harness itself changed: every test is suspect, scope would lie.
if git diff --name-only "$base"...HEAD | grep -qE '^vitest\.(config|setup)\.ts'; then
  exec pnpm vitest run
fi

# --diff-filter=d: a deleted file has no tests to relate; passing its path
# would only make vitest error on a file that no longer exists.
changed=$(git diff --name-only --diff-filter=d "$base"...HEAD -- \
  'src/**/*.ts' 'src/**/*.tsx' \
  'packages/**/*.ts' 'packages/**/*.tsx' \
  'apps/**/*.ts' 'apps/**/*.tsx' \
  'messages/**/*.json' | tr '\n' ' ')

if [ -z "$changed" ]; then
  echo "pre-push: bu pushda testlarga daxldor fayl yo'q — testlar CI'da to'liq yuguradi"
  exit 0
fi

# shellcheck disable=SC2086
exec pnpm vitest related --run $changed
