# Rezyume Builder — `/tools/rezyume`

> Execution plan. Positioning decided 2026-08-14 from Metrica+GSC data and
> market research (see active.md): the audience is the MASS Uzbek jobseeker,
> not IT specialists — IT has FlowCV/Canva/LinkedIn and English; our data
> shows ordinary users, many typing Cyrillic, in Tashkent and the regions.

## The three weapons no competitor copies cheaply

1. **Lotin ↔ kirill toggle over the whole document** — `@webiston/transliteration`,
   proven in the Documents family. «лотин кирилл» GSC queries show the
   Cyrillic audience is real. No resume tool anywhere has this.
2. **100% in-browser, no signup** — the "musor" competitors all gate behind
   accounts. Privacy is our established brand claim.
3. **The Documents-family pipeline** — A4 sheet, print, `.docx`, sample
   button, uz/en/ru: already built, already debugged.

## Layout: the Documents shell IDEA, but its own module

Form on the left, live A4 sheet on the right, sticky with internal scroll,
actions in the card header — the proven UX. But a SEPARATE module
(`src/modules/tools/ResumeBuilder/`): the data is repeating sections
(experience[], education[]) with add/remove, a photo, and a template
switcher — the Documents segments/blocks prose model is the wrong shape.
Reused pieces: `DatePicker`, the `Field`/`FieldSet` pattern, `saveBlob`,
the print approach (`@supports :has()` lesson included), `docx` (dynamic).

**One deliberate difference from Documents: localStorage persistence.**
A tilxat is 10 fields; a resume is an afternoon. Losing it to a refresh is
unacceptable, and localStorage keeps the privacy story (device-only).
The privacy copy says "saqlanadi — faqat shu qurilmada".

## Templates: TWO at launch, each actually finished

The trash competitors have 50 ugly templates; the answer is not 10 of ours —
it is two that are genuinely premium, covering the two real local use cases.
Architecture keeps a template registry so #3 is cheap if data ever asks.

### 1. „Klassik" — an'anaviy bir ustun
- For: state orgs, traditional employers, older reviewers
- Georgia/serif, reverse-chronological, thin rules between sections
- Local conventions ON: photo top-right (optional), tug'ilgan sana,
  oilaviy holat (optional) — the research says employers expect them
- Docx-safe font: Georgia

### 2. „Zamonaviy" — ikki ustunli sidebar
- For: hh.uz office roles, sales/marketing, junior IT
- Left sidebar (~32%): photo, contact, skills, languages; right: summary,
  experience, education
- System sans on screen, Calibri in docx; ONE restrained accent colour from
  a fixed palette (named constants — the §11 chart exception)
- Docx via a 2-cell borderless table (docx lib supports; if it fights us,
  v1 ships print/PDF for Zamonaviy and docx lands in phase 3 — honestly)

## Data model (sketch)

```ts
interface ResumeData {
  template: "klassik" | "zamonaviy"
  accent: AccentId              // zamonaviy only
  photo: string                 // dataURL, device-only, optional
  fullName: string
  role: string                  // desired position
  contact: { phone; email; city; telegram; linkedin; website }
  personal: { birthDate; maritalStatus }   // optional, local convention
  summary: string
  experience: Array<{ company; role; from; to; current; description }>
  education: Array<{ institution; field; from; to }>
  skills: string[]
  languages: Array<{ name; level }>       // critical locally
}
```

Document language: uz / ru / en select (headings ship in all three);
the lotin↔kirill toggle applies on uz. Emails/URLs/phones are shielded
from transliteration (the passport lesson).

## SEO

Route `/tools/rezyume` — keyword-exact flat slug (family policy).
Queries: «rezyume yozish», «rezyume namunasi», «rezyume tuzish»,
«резюме образец узбекистан», «резюме тузиш», cyrillic-uzbek block.
Own card in TOOLS_LIST (not part of the documents switcher — different
family). FAQ carries the local-format guidance (photo? language? length?)
with the research sources.

## Phases

- [x] **P1** Skeleton + vertical slice — **done 2026-08-14.** types,
  constants, `useResume` (localStorage, restore-merge, row add/remove/**move**),
  `IdentityFields` + `HistoryFields` (repeating sections, TagInput chips for
  skills), `KlassikTemplate`, `ResumeSheet` (A4, print CSS carrying the
  `:has()`/`@supports` lesson), composition root with print + title swap.
  Route, metadata/keywords/schemas, TOOLS_LIST card and uz/en/ru messages
  landed here too rather than in P4 — a live route with no metadata would
  ship broken on the next push, and that risk is not worth deferring.
  **Two promotions on the way** (§14, at the consumer that justified them):
  `Field`/`FieldSet` → `src/components/shared/Field` (4th consumer),
  `UZBEK_MONTHS` → `src/constants/uzbek.ts` (2nd tool).
- [x] **P1b** Owner review pass — **done 2026-08-14.** The native
  `<input type="month">` was a straight regression of a settled rule ("every
  control is the suite's"), caught by the owner. Fixed properly rather than
  patched: **`MonthPicker`** now lives in `@webiston/ui/composites` — Popover +
  Button + a 12-cell grid + `Intl` month names, same API shape as `DatePicker`
  (ISO in/out, `format`, bounds). A separate component, not a mode on
  `DatePicker`: answering "which month did you start?" by clicking the 1st of
  a month on a day grid is a click nobody should make. Measured after: the
  resume page pulls **no `react-day-picker` chunk** (17 chunks vs base64's 16).
  **Rows now animate** — `framer-motion` `AnimatePresence` + `layout`, the
  repo's existing pattern, with the timing in one `ROW_MOTION` constant so all
  four sections move identically. That only became correct after rows gained a
  stable `id`: keyed by array index, `AnimatePresence` fades out whichever row
  lands on that index, not the deleted one — so the id fixed the animation AND
  removed every `noArrayIndexKey` suppression from the module. Also swept out,
  in the same pass: the dead `restored` flag on the hook's public interface,
  the `contact.website` field no input ever rendered, a module-scope
  `new Date()` (the SSR clock trap the document family already recorded), and
  the print logic duplicated from `useDocument` → promoted to
  `src/lib/utils/print.ts` (`printWithTitle`) at its second consumer.
- [ ] **P2** Zamonaviy template + switcher + photo upload + accent palette
- [ ] **P3** `.docx` export (Klassik first), lotin↔kirill toggle, ru/en
  document headings
- [ ] **P4** FAQ with the local-format research + tests
- [ ] **P5** Review pass: design-system-reviewer + code-reviewer agents,
  measure bundle, gate, ship

## Known gaps at the end of P1 (deliberate, not forgotten)

- No `.docx` yet — print/PDF only. The button says nothing it cannot do.
- No template switcher in the UI; `data.template` exists and Klassik is
  hard-rendered until Zamonaviy lands.
- No photo upload; `data.photo` is wired through the sheet already.
- No tests yet. The vertical slice is what P4 tests against.

Estimate: 4–6 focused days. No AI writer, no accounts, no template zoo,
no hh.uz integration — decided and recorded in active.md.
