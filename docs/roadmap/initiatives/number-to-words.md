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

### `ming`, not `bir ming` — and `bir million`, not `million`

The asymmetry is grammar, not style. `yuz` and `ming` are native Turkic
numerals and stand alone at one: 1000 is "ming so'm". `million` and `milliard`
are borrowed nouns that get counted: 1,000,000 is "bir million".

**This is the one call the owner should confirm** — the accounting convention
in some offices writes "bir ming". It is a single constant
(`STANDALONE_SCALE_INDEX`), so flipping it is one line and a test update.

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

1. **`bir ming` or `ming`** — the owner's call. One constant.
2. **Russian output** ("сумма прописью" in Russian words) is NOT built. Russian
   numerals carry gender and case agreement ("одна тысяча"), and half-right
   grammar on a legal document is worse than none. A separate piece of work.
