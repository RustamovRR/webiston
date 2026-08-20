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
- [x] **P2** — **done 2026-08-14.** „Zamonaviy" (34% tinted sidebar carrying
  contact/skills/languages, main column for summary/experience/education, one
  accent from `ACCENTS`), the `SegmentedControl` switcher, the 5-colour accent
  picker (shown only for Zamonaviy — a control that paints nothing teaches
  distrust), and photo upload. `DesignFields` sits FIRST in the form: the
  choice reframes everything under it, and one click proves the tool does
  something. The sheet now owns padding only for Klassik — Zamonaviy's sidebar
  has to reach the paper edge — and switches font family with the template.
  **Photo compression is load-bearing, not polish:** the draft lives in
  `localStorage` (~5 MB for the whole origin) and a phone photo is 3–8 MB
  before base64 adds a third, so storing the original would make every save
  throw and silently cost the visitor their afternoon. Downscaled to 480px /
  JPEG 0.82 (~40 kB) — and the canvas work was PROMOTED to
  `src/lib/utils/image.ts` (`downscaleImage`) at its second consumer, with
  QrGenerator's `prepareLogo` reduced to the two options that make it a logo
  rather than a photo (PNG for transparency, pass-through when already small).
  **One a11y bug caught in the same pass:** the template and accent controls
  were wrapped in `Field`, whose `<label htmlFor>` pointed at an id neither
  control accepts — a label labelling nothing. Both now name themselves
  (`SegmentedControl`'s legend, `role="group"`), with a plain caption span.
- [x] **P3** — **done 2026-08-14.** Three things, and the middle one is the
  moat. **(1) `.docx`** — double dynamic import like the document family
  (verified: the library is in no chunk the page loads initially). Deliberately
  ONE single-column layout for both templates: a Word two-column table fights
  every reflow the recipient's Word does, and the `.docx` exists to be edited
  and re-uploaded, while Zamonaviy's colour is a screen/print concern served by
  the PDF path. **(2) Document LANGUAGE, independent of the site locale** — a
  Russian-reading visitor in Tashkent writing an Uzbek CV is a real person that
  `useTranslations` cannot serve, since it only knows the request locale. So
  the sheet's headings moved OUT of `messages/` into `constants/labels.ts`:
  they are document content, exactly like the document family's prose in
  `compose.ts`. Both templates now take `labels` as a prop and no longer touch
  next-intl. **(3) Lotin↔kirill** — `toCyrillicResume` applied as a LENS at
  render, never to the stored draft, so toggling cannot corrupt anything. The
  passport lesson in a new costume: emails, URLs, phones and Telegram handles
  are SHIELDED — «нилуфар.каримова@еxампле.cом» is not a harder-to-read
  address, it is one that does not exist, on a document whose whole purpose is
  being contacted. Uzbek-only, and the control hides itself for ru/en.
  **Two bugs caught in the pass:** the token ratchet flagged a literal
  `#ffffff` in the sidebar's `color-mix` — fixed by mixing against
  `RESUME_PAPER.background` rather than forced; and a message-key COLLISION,
  where the new document-language control reused `form.language`, already
  taken by the languages-row field label — renamed to `docLanguage`, and the
  original restored after an over-eager cleanup dropped it.
- [x] **P3b** Owner UX review — **done 2026-08-14.** Five reports, one of them
  a real data-loss-shaped bug. **(1) The preview silently CUT a long summary**
  while the printout showed two pages: `overflow-hidden`, added in P2 to clip
  Zamonaviy's sidebar to the rounded corner, was clipping the DOCUMENT.
  Removed — the sheet grows and the card scrolls, so what you see is what
  prints. **(2) Page-break guides**: a hairline every 297mm behind the text,
  hidden in print (on paper the page genuinely ends there). Every competitor
  hides the second-page decision until the print dialog. **(3) Chevrons meant
  the wrong thing** — the owner clicked them expecting collapse and got a row
  swap. Reordering is now ARROWS; the chevron means only collapse. **(4) Rows
  are collapsible**, and collapsed they still say WHICH job they are (role ·
  company) — four open jobs was ~1,600px of scrolling. The whole caption is
  the target, not the 16px icon. Answering the owner's question directly: no
  modal. The live preview IS the product, and a modal would hide the thing the
  form exists to change. **(5) Phone mask** — `maskPhone` added to the mask
  module, which was PROMOTED to `src/lib/utils/mask.ts` (consumer outside
  Documents). No `@react-input/mask` dependency: the module's own docblock
  already recorded why, and the rule holds at four formats. The mask formats
  but never INVENTS a country code — that restraint is what makes it
  backspaceable, the classic trap; the `+998 ` prefill lives in the component,
  where one backspace removes it. **13 new component tests + 7 mask tests**,
  each locking a reported behaviour: collapse-not-reorder, arrows reorder the
  SHEET, delete removes the row asked for (the stable-id bug), Cyrillic
  converts the name but never the email, headings follow the DOCUMENT
  language, the draft survives a remount, a long summary is not clipped.
  **1,862 tests / 101 files**; gate all 0.
- [x] **P3c** Owner UX review, round two — **done 2026-08-14.** Four reports,
  and the first was the SAME bug in a second costume. **(1) The sheet was still
  being cut**, now on both templates. Removing `overflow-hidden` in P3b fixed
  the clipping; it did not fix the SHRINKING. The sheet is a flex item in the
  preview's scrolling column, and an explicit `min-height` REPLACES the
  automatic `min-height: auto` that normally stops a flex item collapsing below
  its content — so `lg:min-h-[297mm]` was not a floor, it was a licence to
  shrink to exactly one page. Measured in the browser: sheet 1,123px, content
  1,401px, and the 278px difference rendered outside the white paper as dark
  text on the dark card. `shrink-0` fixes it (re-measured: 1,401px, no
  overflow). Zamonaviy got the matching fix — the sheet is a flex column and
  the template `grow`s, so the sidebar tint reaches the foot of a half-empty
  page instead of stopping where its own content ends. **(2) The figures were
  Georgia's OLDSTYLE set** — 3/4/5/7/9 hang below the baseline, 0/1/2 sit at
  x-height — which is why a phone number and a row of dates read as broken
  type. `font-variant-numeric: lining-nums` does NOT fix it: rendered side by
  side at 4×, the default, the `lining-nums` and the `'lnum' 1` lines are
  pixel-identical, because plain Georgia carries no lining set to switch to.
  The face changed instead: Charter (macOS) → Cambria (Windows system font) →
  Times New Roman, all lining, no webfont byte. The .docx now follows the
  template too — Cambria for Klassik, Calibri for Zamonaviy — so the download
  looks like the preview it came from. **(3) The accent is a free colour now.**
  `data.accent` holds a hex rather than a preset id (one field, not an id plus
  a "custom" value that can disagree), the five curated swatches seed it, and
  the native `<input type="color">` sits after them — the same call the QR tool
  made about not shipping a colour wheel. The guard against an unreadable
  heading is a stated CONTRAST verdict (WCAG AA against the paper, reusing
  `contrastRatio`), not a locked palette. Old drafts holding `"kok"` fall back
  at render: `color: kok` is not an error the browser reports, it silently
  inherits. **(4) The phone mask, twice wrong.** The `+998` vanished on
  select-all-delete and never came back — now the field re-offers it whenever
  it is emptied while focused, and `settlePhone` takes a lone `+998` back off
  on blur so a skipped field prints nothing. Blur also completes a bare
  nine-digit number, which is the one moment guessing cannot fight the caret.
  And the answer to "UZ only or any country": strict for +998, HANDS-OFF for
  everything else — the old code imposed the Uzbek 2-3-2-2 grouping on foreign
  numbers, turning `+1 555 123 4567` into `+15 551 23 45 67`, which a test of
  mine had locked in as correct. **13 new tests** (8 component, 5 mask);
  **1,875 / 101 files**; gate all 0.
- [x] **P3d** Pre-ship audit — **done 2026-08-14.** Asked "what is still wrong,
  and do we need template #3?". Three bugs found and fixed, three gaps recorded
  rather than guessed at. **Fixed: (1) the `.docx` ignored the script toggle.**
  `ResumeBuilder.tsx` passed `sheetLabels(data)` — which converts — alongside
  raw `data`, so a Cyrillic CV downloaded as Cyrillic headings over Latin
  content. Half-converted is worse than either, on the one feature no
  competitor has. Now `viewOf(data)`, locked by a test that also checks the
  email is still shielded. **(2) The print CSS had no break rules at all** —
  grep returned nothing — so a two-page CV could strand a job title at the foot
  of page one with its bullets on page two. `break-inside: avoid` on articles
  and list items, `break-after: avoid` on headings, outside the `@supports`
  blocks so both paths get them; verified the browser PARSED both rules rather
  than dropping them, which is the failure mode this file has hit before.
  **(3) Two identical bullet lines were a duplicate React key** (`key={line}`)
  — now the row id plus position, which needed no `noArrayIndexKey`
  suppression. **Also: the PDF path was invisible.** It exists and is the best
  one available — the print dialog's "Save as PDF" is written by the same
  engine that painted the preview, so the text is real and ATS-parseable, where
  a bundled jsPDF/html2canvas would rasterise it and pdf-lib would mean a THIRD
  renderer to keep in sync. The problem was only that the button said "Chop
  etish" and nothing on the page said the word PDF; renamed "PDF / Chop etish"
  in all three locales. **1,877 tests / 101 files; gate all 0.**
- [x] **P3e-1** Mobile pane switch — **done 2026-08-14.** Measured at 375px
  before: form card 3,372px, paper starting at 3,723px — ~2,635px of scrolling
  before a millimetre of it was visible, i.e. on a phone the tool had no
  preview. P3b's "no modal, the live preview IS the product" was true on a
  desktop and false on a phone. A `SegmentedControl` (Ma'lumotlar / Rezyume),
  sticky under the site header at `top-(--header-height)` — reading the same
  token the header uses, since two hardcoded 4rems in two files is the pair
  that drifts — and `lg:hidden`, because above `lg` both panes are already on
  screen. A switch and not a modal: a modal hides the form the moment you look
  at the result. Document height on the form pane 5,271px → 2,729px.
  **Panes are hidden, never unmounted** — the sheet keeps its state and, the
  part that would have been a silent bug, the print stylesheet can still reach
  `#resume-sheet`, since `:has(#resume-sheet)` sets `display: block !important`
  on every ancestor and `!important` beats the `hidden` class.
  **`scrollIntoView` on the strip was the first attempt and was a no-op** — a
  stuck element is by definition already in view, and switching at 1,540px left
  the paper's top 1,132px above the viewport. `window.scrollTo({top: 0})`
  instead; re-measured, the paper now lands 408px into the viewport.
  **Verified by PRINTING, not by reasoning** — this module has produced six
  identical pages once already by trusting print CSS. Driven over CDP at a
  375px mobile viewport with the FORM pane active (sheet `display: none` on
  screen): **1 page, A4 594.96×841.92pt, full CV, no form controls leaked** —
  and `pdftotext` reads every word, which is also the proof that this PDF path
  is ATS-parseable where a rasterising jsPDF would not be. A second run with a
  long summary: **2 pages, and page 2 OPENS with the job title** rather than
  stranding it at the foot of page 1 — the new `break-inside` rules doing
  exactly their job. All five sections present across both pages.
- [ ] **P3e-2** The two gaps that remain:
  - **No density control.** P3b drew the page-break guide and so raised the
    "this is two pages" question without giving any lever to answer it.
    Three steps (Keng / Odatiy / Ixcham) over font size and leading, applied
    to both templates and the docx.
  - **ATS guidance.** Zamonaviy's two-column PDF is the classic parser
    failure; the `.docx` is already single-column by design, so the safe path
    exists and nothing tells the visitor which file to send where. Belongs in
    the P4 FAQ, with hh.uz checked rather than assumed.
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
