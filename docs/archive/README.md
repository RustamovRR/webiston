# Archive — completed-work logs

> **Read-only.** One file per **completed initiative**. This is where shipped
> detail goes so that `roadmap/active.md` stays a thin tracker instead of
> growing into a changelog.

## When to add a file here

When an *initiative* completes — not a task. A single ticked checkbox stays in
`active.md`. A whole phase set (e.g. "design-system migration") moves here:

1. Create `archive/YYYY-MM_<initiative>.md` from the template below.
2. Delete the initiative's block from `active.md`, leaving **one** snapshot line.
3. Add the file to the map in `docs/README.md` and to the index below.

## Naming

`YYYY-MM_<kebab-case-initiative>.md` — e.g. `2026-08_design-token-migration.md`.

## Template

```markdown
# <Initiative> — <month year>

**Status:** Complete · **Span:** YYYY-MM-DD → YYYY-MM-DD

## What was built
One paragraph. What is different now that was not before.

## Key decisions
Bullets. Link the ADR if one was written; do not restate it here.

## Measured results
Before → after, with the command that produced the numbers.
"Improved" is not a result.

## Files changed
The areas, not every path.

## What it left open
The honest list — what was descoped, deferred, or still not verified,
and where it now lives (backlog item, ADR, issue).
```

## Index

_(empty — nothing has shipped through this system yet)_
