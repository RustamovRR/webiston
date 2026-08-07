# Webiston — Search Strategy (2026)

> **What this file is:** the decisions. Where the traffic actually is, what we
> are betting on, and — just as load-bearing — what we have decided **not** to
> do and why. Execution lives in `../roadmap/initiatives/seo-2026.md`.
> Mechanics (metadata helpers, `use client` budget, Core Web Vitals) live in
> `seo-performance.md`; this file sits above it and says *where to point them*.
>
> Researched 2026-08-07 against live sources. Every claim below that could be
> checked was checked, and several popular ones did not survive — see
> **Refuted** at the end before re-proposing anything.

---

## The decision, in one paragraph

**The traffic is in Uzbek, on a `.uz` ccTLD, and 79% of the site is a
226-chapter Uzbek book library.** That is both the volume and the moat. `/ru`
is **not** a CIS play and cannot be turned into one: Google treats `.uz` as
country-specific, Search Console's country targeting was removed in 2022, and
hreflang does not rank. `/ru` is a **Russophone-Uzbekistan and Uzbek-diaspora**
surface, where the ccTLD is an advantage instead of a ceiling. The two flagship
tools are won differently from each other: `latin-cyrillic` by owning the 2026
alphabet reform, `qr-generator` by owning Uzbek-language intent — never by the
head term.

---

## 1. Where we can and cannot win

### The `.uz` ceiling — the single most important fact here

Google publishes an allowlist of ccTLDs it treats as generic: `.ad .ai .as .bz
.cc .cd .co .dj .fm .io .la .me .ms .nu .sc .sr .su .tv .tk .ws`. **`.uz` is not
on it.** Google's own wording is that a ccTLD "can only target a single
country."

There is no lever that undoes this:

| Lever | Status |
| ----- | ------ |
| Search Console country targeting | **Removed 2022-09-22.** No replacement. Google's stated reason: it "was determined to have little value for the ecosystem" |
| hreflang | Selects a variant for a page that *already* ranks. Does not rank it |
| Yandex "site region" | Needs a local address and phone we do not have; human-moderated; applies only to location-dependent queries |
| A gTLD + subdirectories | Means a different domain. Not worth it for a portfolio project |

**Consequence:** `/ru` performs best where it is not fighting geography —
Russian speakers *inside* Uzbekistan, where 47.3% of `.uz` sites are already
Russian-language, plus the Uzbek diaspora in Russia. It performs progressively
worse the further out you aim it. That is the opposite of a CIS expansion.

### Should Kazakh / Kyrgyz / Tajik / Turkmen searchers be routed to `/ru`?

**No.** Four reasons, in order of finality:

1. **The ccTLD, above.** Nothing overrides it.
2. **The content does not serve them.** A Kazakh or Tajik searcher has no use
   for *Uzbek* Latin↔Cyrillic transliteration. The commodity tools lose to
   saturated RuNet SERPs regardless.
3. **Kazakhstan is moving away from Russian, fast.** Yandex's own first-party
   numbers: Kazakh-language queries went from 15% of daily volume (Dec 2023) to
   "up to a third" (Sept 2025) — roughly doubled in under two years, on the
   platform whose audience is the *most* Russophone in that market.
4. **There is no query-language data at all** for Kyrgyzstan, Tajikistan or
   Turkmenistan. Anyone quoting some is extrapolating from website-supply
   figures. Turkmenistan is unaddressable outright: 46% internet penetration,
   heavy filtering, 5% social reach.

Also: `/ru/books` deliberately does not exist. A Russian visitor who clicks from
`/ru/tools/*` into the books lands on 226 chapters of Uzbek. That is an argument
for keeping `/ru` **at 18 tool pages**, not for widening it.

### Search engine share — why Yandex is on the list at all

| Country | Google | Yandex |
| ------- | -----: | -----: |
| **Uzbekistan** | 75.7% | **22.1%** |
| Kazakhstan | 71.3% | 26.7% |
| Russia | 25.5% | **72.9%** |

*StatCounter, July 2026.*

The reason to claim Yandex Webmaster is **Uzbekistan's own 22%**, where we have
no presence at all — not Russia. Say it that way; the Russia framing does not
survive contact with the `.uz` ceiling.

**Russia is also a reachability question, not just a ranking one.** Since
2025-06-09 Russian ISPs have throttled foreign infrastructure to "only the first
16 KB of any web asset" — Cloudflare, Hetzner, DigitalOcean and OVH are named.
Vercel is not named, so this is unknown rather than disproven. Check whether the
site loads from a Russian IP before spending an hour on Russia.

---

## 2. The two flagship tools

### `latin-cyrillic` — the 2026 alphabet reform is the whole opportunity

Measured position (US-localised SERPs, so directional): **absent from every head
term** — `lotin kirill`, `кирилл лотин`, `узбекский транслитератор`. The
incumbents (`lotin.uz`, `kiril-lotin.uz`, `lotincha.uz`, `uzlotin.uz`) win on
domain age with *less* on-page work than we already have. **A better title tag
will not take those.**

What is winnable: on **7 July 2026** the Legislative Chamber passed alphabet
reform — digraphs abolished, 28 letters plus an apostrophe. It has not been
signed. This creates a third script target (Cyrillic ↔ 1995 Latin ↔ 2026 Latin)
and a news cycle generating demand nobody is serving with a reference page.

Ship, in order:

1. **The correspondence table** — Cyrillic / 1995 Latin / 2026 Latin, three
   columns. Nothing like it exists. This is the linkable asset.
2. **A reform explainer** — what changed, when it takes effect, and what happens
   to documents formalised before it does.
3. **The tricky-letter rules** — `x` vs `h`, `ц`, `щ`, `ъ`, `ь`, `ў`, `қ`, `ғ`,
   `ҳ`, the apostrophe. Currently answered by news articles and forum threads,
   not by a purpose-built reference. Featured-snippet-winnable.

**A three-way converter is BLOCKED and must stay blocked.** Sources disagree on
the actual letters — gazeta.uz says `O'→Õ`, alfavit.uz says `oʻ→ö`; `Ch→Ç`
against the earlier draft's `Ch→C`. **Verify against the signed text on lex.uz
first.** The entire product claim of this tool is that it gets the letters
right; shipping a guess on the most-visited page is worse than shipping nothing.

Items 1–3 can ship now framed as *"passed the Legislative Chamber 7 July 2026,
not yet in force, letter forms not final."* That framing is accurate and is
itself the differentiator.

Also true of this page today: **316 words carrying 26 schema blocks**, 201 KB of
HTML at 1.41s, against `alfavit.uz` at 9 KB and 0.32s. That ratio should move
toward *fewer schema types and more real answers*, not the reverse.

### `qr-generator` — the head term is unwinnable. Say so.

**We cannot rank for "qr code generator."** That SERP is Adobe, Canva, Google
Play, the Chrome Web Store and Bitly's exact-match domain, over 15+ years of
links. It is also commercially mismatched: those searchers are being funnelled
toward paid dynamic/tracked codes and we have nothing to sell them. Ranking
would be a vanity metric.

Where we already win and should defend: `qr kod yaratish` (~#3), `qr kod yasash
bepul onlayn` (**#1**). The field there is three or four small `.uz` sites.

The plays, in order:

1. **Localised metadata** — the prerequisite for everything else.
2. **A UzQR explainer, uz + ru.** The mandate went live 2026-07-01; 265,000+
   merchants connected by 2026-07-29. The query wave is served today by news
   articles that will go stale. **We cannot generate a UzQR** — issuance is
   centralised through banks — and saying so plainly *is* the differentiator.
   Do not build a payment-QR feature.
3. **Per-intent URLs** — `/wifi`, `/vcard`, `/telegram`, `/menu`. This is the
   structure every competitor that outranks us has. Do it **only after 1 and 2
   show movement in Search Console**, or it triples a surface that does not work
   in two of three languages yet.

Do not claim "client-side privacy" as the wedge — `toolbase.uz` and
`qrcode-online.com/uz` already claim it. Our edge is that ours is **verifiable**
(open source, provable in devtools). That is a content argument, not a bullet.

---

## 3. Structured data — what still earns anything

| Type | 2026 status | Do we emit it? |
| ---- | ----------- | -------------- |
| `BreadcrumbList` | **Live rich result** | Yes, all 17 tools. **Missing on 226 book chapters** — the cheapest win left |
| `Organization`, `WebSite` | Used for the knowledge panel / site name | Yes |
| `TechArticle` / `Article` | Live | **No** — the entire book library has zero page-level schema |
| `SoftwareApplication` / `WebApplication` | **No rich result without `aggregateRating`.** A pure semantic hint | Yes, 14 tools, correctly without ratings |
| `FAQPage` | **DEAD.** Stopped rendering 7 May 2026; docs removed 15 June 2026 | Yes, ~18 pages. Harmless. **Add it nowhere new** |
| `HowTo` | **DEAD since Sept 2023** | Yes — one survivor on `latin-cyrillic` |
| `SearchAction` / sitelinks searchbox | **Retired Nov 2024** | Yes — and it points at `/search`, which does not exist |
| `AggregateRating` / `Review` | Fabricated ratings are the most common self-inflicted manual action on tool sites | **No.** Deleted 2026-07-29. Keep it that way |

**The rule that matters more than the list:** a schema with no visible
counterpart on the page is a guidelines violation, and a structured-data manual
action makes Google ignore **all** structured data on the page — including the
breadcrumbs that do still work. This is why `generateFAQSchema` takes the same
translator the page renders from: the markup and the visible section cannot
drift apart by construction.

---

## 4. AI search

- **`llms.txt` is not worth shipping.** Google, verbatim: "You don't need to
  create new machine readable files, AI text files, markup, or Markdown to
  appear in Google Search (including its generative AI capabilities), as Google
  Search itself doesn't use them." No provider gates citation on it. Claims that
  Anthropic or Perplexity "confirmed support" trace to SEO blogs with no primary
  source. (Google *did* ship an `llms.txt` audit in Lighthouse's Agentic
  Browsing category in May 2026 — explicitly not for search.)
- **What actually correlates with AI-answer citation is brand mention**, not
  markup: 0.664 for branded web mentions against 0.218 for backlinks, across
  75k brands. Correlational, and brand strength is a plausible common cause —
  but the direction is clear enough to act on.
- **Bing's index feeds Copilot, ChatGPT Search and Perplexity.** That is the
  real argument for Bing Webmaster Tools and IndexNow, which Google does not and
  will not participate in.
- With an AI Overview present, position 1 yields roughly **42%** of the clicks
  it did in 2023. Plan around a smaller ceiling.

**Translation for a solo operator:** the Chrome Web Store listing, GitHub, and
Uzbek dev communities mentioning "webiston" next to "lotin kirill" are worth
more hours than any remaining schema tag. That is not a task with a file path,
which is exactly why it keeps losing to tasks that have one.

---

## 5. Explicitly not doing

| Not doing | Why |
| --------- | --- |
| `ru-KZ` / `ru-KG` / `ru-TJ` / `ru-RU` hreflang | Legal, and a **no-op**. hreflang chooses among distinct URLs; we have one Russian URL per page, so the choice set has one member. Adds ~1,455 annotations to keep reciprocal forever, for nothing |
| Targeting KZ / KG / TJ / TM | See §1. No lever, wrong content, and KZ is drifting Kazakh |
| Anything for Kazakh-Latin script | Transition deadline moved 2025 → **2031**. Cyrillic is in universal use |
| Translating the books | 226 chapters. Multi-month, unproven return, on a domain that cannot geotarget. Revisit only if the kill criterion below passes |
| `llms.txt` | §4. Zero payoff, and it lies the moment it goes stale |
| Adding `FAQPage` anywhere new | Dead since 7 May 2026 |
| `AggregateRating` on tool pages | Manual-action risk that would also kill our working breadcrumbs |
| Sitemap `alternateRefs` | On-page `localeAlternates()` is already correct and complete; a second source of truth for one fact will drift. **And Yandex no longer supports sitemap-based language versions at all** |
| Splitting the sitemap | 286 URLs against a 50,000 limit |
| Crawl-budget optimisation | Google's own doc scopes this to 1M+ page sites. We have 291 static pages |
| "SEO text" blocks under the tools | The #1 temptation for a tool site and the #1 thing that caps it. Write **fewer** words that answer a real question |
| A footer linking all 17 tools on every page | Doorway pattern and diluted signal. 3–5 *related* tools per page instead |
| Ranking for "qr code generator" | §2 |
| Building a UzQR generator | Issuance is centralised through banks. Wrong at best, harmful at worst |
| `<meta keywords>` as anything but deletion | Ignored since 2009. 78 KB across 284 pages. Delete for the bytes; expect nothing |

---

## 6. How we will know

**Export the Search Console baseline BEFORE the first change lands.** Everything
here is worthless without it.

| Question | Instrument | Success signal | Window |
| -------- | ---------- | -------------- | ------ |
| Did the book-title fix work? | GSC → Pages, filter `/books/` | **CTR up at flat position.** Titles move CTR, not rank — if position moves too, something else changed | 4–8 wks |
| Is `/ru` alive at all? | GSC → Pages, filter `/ru/` | **Any** non-zero impressions | 8 wks |
| Did the near-orphan tools get discovered? | GSC → Pages, filter `/tools/` | The 10 single-inbound-link tools showing impressions | 8–12 wks |
| Structured data still valid? | GSC → Enhancements | Breadcrumb valid count rises to cover `/ru`; zero "Unparsable" | 2–4 wks |
| Page experience | **CrUX field data, not Lighthouse** | Inside 2.5s LCP / 200ms INP / 0.1 CLS at p75 | ongoing |

Two traps:

- **Do not use third-party rank trackers.** They are US/EU-localised and will
  not reflect google.co.uz. GSC impressions are the only honest instrument.
- **web-vitals v6 changed INP attribution**, and Chrome 151 (28 July 2026)
  shipped soft navigations unflagged, so App Router client navigations now emit
  their own metric lifecycles. Run v5 and v6 in parallel before believing either
  number — a graph can move when the application did not.

**Kill criterion, agreed in advance:** if `/ru/*` still shows ≈0 impressions
**12 weeks after** its metadata is correct, `/ru` does not work from a `.uz`
domain. Freeze it at 18 pages. Do not translate the books, do not add `ru-XX`,
do not add routes. Written down now so the sunk cost cannot argue later.

---

## Refuted — do not re-propose these

Checked and killed during the 2026-08-07 research. Several were the *headline*
recommendation of a source.

| Claim | Verdict |
| ----- | ------- |
| "Zero `/ru` URLs in the sitemap — one-line fix, highest impact" | **False.** `sitemap.xml` had **18** `/ru` URLs; next-sitemap auto-discovers them from the prerender manifest. The hardcoded list matters only for the unprefixed `uz` URLs |
| "`<html lang>` is the #2 SEO fix" | **False as SEO.** Google: "We don't use any code-level language information such as `lang` attributes, or the URL." It is an **accessibility** fix, and it needs multiple root layouts |
| "hreflang has no ranking effect, per Google's docs" | Overstated. `managing-multi-regional-sites` does say geotargeting "can improve your page rankings in the target country". The conclusion survives via the mechanism — no alternate to swap means no effect — but the absolutist sentence is wrong and easy to disprove |
| "One bad hreflang discards the entire cluster" | Overstated. Google: "you can omit some languages on some pages; Google will still process the ones that point to each other" |
| "Fabricated `AggregateRating` is live — urgent" | Stale. Removed 2026-07-29; `grep` confirms zero |
| "`BreadcrumbList` is the schema we're missing" | Already on all 17 tools. True only for the **book chapters** |
| "Titles double as `\| Webiston \| Webiston`" | Measured: one suffix. Nested templates do not compound |
| "`/api/og` breaks on Cyrillic" | No. Next 16.3 bundles `Geist-Regular.ttf` with 134 Cyrillic codepoints including `Ў Қ Ғ Ҳ` |
| "21 tools" | **17 routed.** Four are parked behind `__` prefixes — not built, not linked, not in the sitemap |
| "IndexNow: 5 minutes between resubmissions" | **10 minutes.** Participants: Bing, Yandex, Seznam, Naver, Yep, Amazon. **Not Google** |
| "Yandex site region is the highest-ROI unclaimed item" | Overstated. Yandex says region is "only one of the factors" and applies to location-dependent queries. `json formatter онлайн` is not one |
| Vendor stats — "317% citation lift", "2.7× more likely cited with schema" | No sample, no control, recycled across sites. Excluded |
