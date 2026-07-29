# Architecture Decision Records

> One immutable page per decision. An ADR records **why we chose X over Y**, not
> how X works — the "how" lives in `../reference/*`. The ADR links to the
> reference; it never duplicates it.

## Rules

- **Append-only.** Never edit an accepted ADR to reflect a new decision. Write a
  new one and mark the old `Superseded by ADR-NNNN`.
- **Numbering** is sequential and permanent: `NNNN-kebab-case-title.md`.
- **An ADR is warranted when** there was a real trade-off, a rejected
  alternative, or a decision someone will predictably want to re-open. A
  preference with no alternative is not an ADR — it is a line in `code-rules.md`.
- **Read `adr/` before re-litigating an architectural choice.** Decisions here
  were made with evidence.

## Template

```markdown
# ADR-NNNN — <Title>

- **Status:** Proposed | Accepted | Superseded by ADR-NNNN
- **Date:** YYYY-MM-DD
- **Context:** what forced a decision (with evidence — numbers, file:line)
- **Decision:** what we chose, stated in one sentence
- **Alternatives considered:** each with the reason it lost
- **Consequences:** what this makes easy, what it makes hard, what we accept
- **Revisit when:** the concrete condition that would reopen this
```

## Index

| ADR | Title | Status |
| --- | ----- | ------ |
| [0001](0001-hybrid-monorepo-src-at-root.md) | Hybrid monorepo — `src/` stays at the repo root | Accepted |
| [0002](0002-design-tokens-single-source.md) | One token block as the single source of colour | Accepted |
| [0003](0003-typescript-7-with-experimental-next-cli.md) | TypeScript 7 with Next's experimental TypeScript CLI | Accepted |
| [0004](0004-no-feature-sliced-design.md) | We do not adopt Feature-Sliced Design | Accepted |
