# Initiatives — execution plans for multi-session work

> **Why this folder exists.** `backlog.md` is a thin list of *items*. An
> initiative is not an item — it is a body of work with phases, an order, and a
> reason for that order. Pasting one into `backlog.md` buries the twenty small
> items that actually belong there.
>
> **The rule:** if a piece of work needs more than ~3 lines to describe, or has
> phases that must happen in sequence, it gets a file here and **one pointer
> line** in `backlog.md` or `active.md`.

---

## The convention

Each initiative file is the **execution plan** for one `reference/` spec.
The reference doc says *what good looks like*; the initiative says *how we get
there from here, and in what order*.

| Initiative                  | Executes the spec in                            |
| --------------------------- | ----------------------------------------------- |
| `design-system.md`          | `reference/design-system.md`                     |
| `seo-and-rendering.md`      | `reference/seo-performance.md`                   |
| `code-structure.md`         | `reference/architecture.md` + `code-rules.md`    |
| `content-and-i18n.md`       | `reference/content-i18n.md`                      |
| `tooling-ci-and-testing.md` | `reference/testing-strategy.md`                  |

## Lifecycle

```
backlog.md (pointer)  →  initiatives/<name>.md (the plan)
                              ↓ work starts
                         active.md (one line: "[~] <name> — Phase B")
                              ↓ all phases done
                         archive/YYYY-MM_<name>.md   (initiative file deleted)
```

## Rules for a file in here

- **Phases are ordered and the order is justified.** "Phase B before C" must say
  *why*, or it is not a plan, it is a list.
- **Every phase names its evidence** — a file:line or a measured number, and the
  command that produced it. No number, no phase.
- **Every phase names its exit condition.** How do we know it is done?
- **Status markers are the same as the roadmap:** `[ ] [~] [x] [!] [>]`.
- **Tick phases in place.** When every phase is `[x]`, move the file to
  `archive/` and delete the pointer line.
- **Do not restate the spec.** Link to the `reference/` doc instead.

## Index

| File                        | Status | Blocked by                          |
| --------------------------- | ------ | ----------------------------------- |
| `design-system.md`          | `[!]`  | brand-colour decision (`backlog.md`) |
| `seo-and-rendering.md`      | `[ ]`  | —                                   |
| `code-structure.md`         | `[~]`  | —                                   |
| `content-and-i18n.md`       | `[ ]`  | `/books` i18n decision (`backlog.md`) |
| `tooling-ci-and-testing.md` | `[ ]`  | —                                   |
