# Summani so'z bilan yozish — `[x]` shipped 2026-08-12

`/tools/number-to-words` — a number, written out in Uzbek words, in **both
scripts at once**.

## Why this one, out of everything on the list

Chosen against four filters, all four of which had to hold:

1. a real, recurring need for Uzbek speakers
2. Uzbek-language search demand with a weak or absent incumbent
3. 100% client-side — no backend, and the "nothing is uploaded" promise intact
4. **an advantage nobody else has**

**The gap is verified, not assumed.** Two independent searches for "raqamni
so'z bilan yozish", "summani so'z bilan" and "sonlarni so'zga aylantirish"
return: a code tutorial on UzbekDevs, an algorithm article on Texnoman, and a
2010s **Excel macro** (`sumprop.xla`) on a forum. There is no modern web tool
ranking for any of them.

**The need is legal, not convenient.** An invoice, a contract and a payment
order carry the amount twice — in digits and in words — because the written
form cannot be altered afterwards.

**The advantage is `@webiston/transliteration`.** One import turns the Latin
sum into Cyrillic. Any competitor would have to write and maintain a
transliteration engine to offer the second column; here it is a function call
that this repo already ships and already tests.

## The decisions worth writing down

### `bir ming` AND `bir yuz` — settled 2026-08-12, evidence on file

The first draft shipped the conversational form ("ming so'm") behind a
`STANDALONE_SCALE_INDEX` constant and asked the owner to confirm. The owner
overruled it with the document convention — 1 560 is "**bir ming** besh yuz
oltmish so'm" — and lex.uz settles the hundred the same way: Uzbek law writes
"bazaviy hisoblash miqdorining **bir yuz ellik** baravari". Written style
counts EVERY unit; only speech drops the leading "bir".

The constant is gone: "count everything" leaves `integerToWords` with zero
branches on the value being one, which is the shape a settled decision should
have.

**Proof, not spot checks.** The test file carries an independent evaluator
that reads the words BACK into a number — different code shape, so a bug
cannot cancel out — and the two agree on every value below 100 000 plus a set
of giants up to 10^18−1. Three mutations (old bare-ming rule, phantom "nol"
for empty groups, dropped "bir" before yuz) fail 8/4/6 tests respectively.

### bigint, not number

`Number` stops being exact above 2^53 ≈ 9×10^15, which is *inside* the range
this tool names. A sum that reads back as a different sum is the worst possible
failure for a document, so the parser produces a `bigint` and the grouping loop
never leaves it. Tested at 2^53+1.

`0n` literals are unavailable — `tsconfig.json` targets ES2017 and TS rejects
bigint literals below ES2020. Raising the target for one tool would change the
emit for all 269 routes, so the constants are hoisted instead.

### Decimal or thousands? The rule, and the one case it decides by fiat

`1.250.000` is grouping, `1250000,50` is tiyin, `1,250,000.50` is both — the
last separator wins. The genuinely ambiguous input is a lone separator before
exactly three digits: `1.500` is either one and a half or fifteen hundred.
It is read as **thousands**, because this is a money tool and so'm has two
decimal places, not three.

### `plain` mode names whole numbers only

Uzbek reads a decimal as a fraction whose denominator changes with the number
of places ("o'n ikki butun besh o'ndan"). Getting that subtly wrong on a
document is worse than declining it, so the fractional part is dropped in
plain mode **and the UI says so** rather than dropping it in silence.

### Refuses rather than guesses

`12ab` is an error, not 12. A value past 18 digits is an error, not a
half-named sum. Both are stated in the field's own error line.

## What shipped

| | |
| --- | --- |
| Route | `/tools/number-to-words`, prerendered in uz/en/ru |
| Module | 10 files, `utils` → `hooks` → `components` → composition root |
| Tests | **46** — 20 numerals, 15 parser, 11 driving the real component |
| SEO | title ≤60 and description ≤160 in all three locales (measured on the built HTML), canonical, 4 hreflang, og:image, 10 JSON-LD blocks, 3 sitemap entries |
| Search | indexed with 22 tags — uz, ru and en queries all resolve to it |

## Caught while building

- **The token ratchet fired** on `TOOLS_LIST[].color`. Investigating it showed
  the field **has no consumer at all** — the card reads
  `accentFor(tool.category)` — so all 22 existing values are dead data the
  ratchet still counts. The new entry uses a token (`bg-chart-1/12`, the colour
  the card actually paints) rather than adding a 23rd raw palette class.
  **The dead field is flagged for the owner, not deleted.**
- **Invisible characters in a regex.** The thousands-separator class contains
  U+00A0, U+202F and U+2009, which are indistinguishable from a space in an
  editor. Rewritten as escapes after a test failed on a literal nobody could
  see.
- One test asserted the wrong convention (`10.567` as tiyin). The
  implementation was right and the test was wrong — corrected, and the
  ambiguous case now has its own named test.

## Still open

1. **Russian output** ("сумма прописью" in Russian words) is NOT built. Russian
   numerals carry gender and case agreement ("одна тысяча"), and half-right
   grammar on a legal document is worse than none. A separate piece of work.

## Follow-up pass (2026-08-12, same day)

### UI pass (owner's screenshots)

- **Equal card heights by construction**: `items-start` removed from the grid
  so both cells stretch, `h-full flex flex-col` on both cards. Measured before:
  empty 249/178, short 275/306, 18-digit 275/358 — never equal. After: 285/285,
  311/311, 358/358. Sticky was considered and rejected — the tool fits one
  viewport, a sticky card has nowhere to travel.
- **Empty state teaches instead of apologising**: a worked example
  (`1 250 000,50 → Bir million …`) computed by the REAL pipeline at module
  scope, so it can never drift from the algorithm. Full-strength
  `text-muted-foreground` — the `/70` slash-opacity failed AA once already.
- **Reading measure**: words capped at `max-w-[70ch]`; the card keeps its
  size, the text stops chasing the edge of a ~1050px panel.
- **Document form added** — the actual deliverable: `1 250 000,50 (Bir
  million ikki yuz ellik ming so'm ellik tiyin)`, both scripts, one checkbox.
  The digits inside it use ORDINARY spaces and an ASCII minus, not the display
  echo's U+202F/U+2212 — pasted amounts with invisible non-ASCII spaces are
  what 1C-style validators reject unexplainably. Mutation-proven: the first
  test matched through `getByText`, whose default normalizer collapses every
  `\s` INCLUDING U+202F, so it passed with the replace deleted; rewritten
  against raw `textContent`.


- **`bir ming` / `bir yuz` convention settled** — see the decision above.
  55 tool tests → the evaluator battery; FAQ rewritten in all three locales to
  explain the DOCUMENT form instead of the conversational one.
- **`-0` normalised at the parser**: "minus nol so'm" can no longer be
  produced; a fraction-only negative (−0,50) still keeps its minus.
- **Keywords widened where the gap actually is**: the "harf bilan" phrasing
  (the Excel macro this tool replaces was named that way), and a
  Cyrillic-script Uzbek block ("суммани сўз билан ёзиш") that no competitor
  targets at all. Verified in the built search index: "summa", "прописью",
  "суммани сўз" and "harf bilan" all resolve to this tool.
- **Two transliteration bugs found by this tool's own round-trip test idea**,
  fixed in `@webiston/transliteration` (336 → 340 package tests):
  1. Latin `e` after a vowel now yields `э` — aeroport → аэропорт, poema →
     поэма; the word-start-only rule produced аеропорт and broke the round
     trip.
  2. `<code>`/`<pre>` CONTENTS are now protected, not just the tags — a
     variable `x` was coming back as the Cyrillic homoglyph `х`, identical on
     screen and broken at runtime. Bounded pattern, per the file's own
     documented quadratic-backtracking discipline.
