/**
 * The one-page report `alifbo-check.mjs` screenshots — sized for a Telegram
 * photo (4:5). Plain HTML opened from disk by Chrome, never served, so it
 * carries its own styles instead of the site's tokens.
 *
 * Every sentence here is a measurement or the law's date. No promises: the
 * offer belongs in the message the report is attached to, in his own words.
 */

import { normalizeApostrophes } from "@webiston/transliteration"

export const REPORT_WIDTH = 900
export const REPORT_HEIGHT = 1125

/** A word as the report counts it: letters plus the Uzbek apostrophes. */
export const WORD = /[\p{L}\p{M}'ʻʼ‘’`]+/gu
const WORD_SPLIT = new RegExp(`(${WORD.source})`, "u")

/**
 * The law's tutuq is ʼ, so `San’at` → `Sanʼat` is a real edit — but one no
 * reader can see. A word only "changes" when its letters do.
 */
export const sameWord = (a, b) =>
  a !== undefined &&
  b !== undefined &&
  normalizeApostrophes(a) === normalizeApostrophes(b)

const LAW = "O'RQ-1184-son qonun 2027-yil 22-aprelda kuchga kiradi."

const esc = (s) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
  )

const num = (n) => n.toLocaleString("ru-RU")

/** Mark every word of `text` that differs from the same position in `other`. */
function highlight(text, other) {
  const otherWords = other.match(WORD) ?? []
  let i = 0
  return text
    .split(WORD_SPLIT)
    .map((part, k) => {
      if (k % 2 === 0) return esc(part)
      return sameWord(part, otherWords[i++])
        ? esc(part)
        : `<mark>${esc(part)}</mark>`
    })
    .join("")
}

function headline({ words, changed, source }) {
  if (changed === 0) {
    return `<p class="big">Bosh sahifa to'liq yangi alifboda</p>`
  }
  if (source === "latin-2027") {
    return `
    <p class="big">${num(changed)} <span>so'z hali eski yozuvda</span></p>
    <p class="muted">bosh sahifaning qolgan qismi allaqachon yangi alifboda</p>`
  }
  const share = Math.round((changed / words) * 100)
  const note =
    source === "cyrillic"
      ? "sahifa kirill yozuvida — barcha so'zlar yangi lotinga o'tadi"
      : `bosh sahifadagi so'zlarning ${share}%`
  return `
    <p class="big">${num(changed)} <span>/ ${num(words)} so'z o'zgaradi</span></p>
    <p class="muted">${note}</p>`
}

export function renderReport(report) {
  const { host, letters, changed, pages, samples } = report
  const date = new Date().toLocaleDateString("ru-RU")

  const letterCards = letters
    .map(
      ({ letter, from, count }) => `
      <div class="card"><p class="muted">${esc(from)} → ${letter}</p>
      <p class="count">${num(count)}</p></div>`
    )
    .join("")

  const pageLine = pages
    ? `Saytda <b>~${num(pages)} sahifa</b> (sitemap.xml bo'yicha).`
    : "sitemap.xml topilmadi — sahifalar sonini aniqlab bo'lmadi."

  const sampleRows = samples
    .map(
      ({ before, after }) => `
      <div class="sample">
        <p class="before">${highlight(before, after)}</p>
        <p class="after">${highlight(after, before)}</p>
      </div>`
    )
    .join("")

  return `<!doctype html>
<html lang="uz"><head><meta charset="utf-8">
<title>${esc(host)} — yangi alifbo</title>
<style>
  :root { --fg: #111827; --muted: #6b7280; --line: #e5e7eb; --accent: #0f766e; --tint: #ccfbf1; }
  * { box-sizing: border-box; margin: 0; }
  body { width: ${REPORT_WIDTH}px; height: ${REPORT_HEIGHT}px; padding: 56px;
    font: 18px/1.45 system-ui, -apple-system, sans-serif; color: var(--fg);
    background: #fff; display: flex; flex-direction: column; gap: 32px; overflow: hidden; }
  h1 { font-size: 30px; }
  .muted { color: var(--muted); }
  .big { font-size: 64px; font-weight: 700; line-height: 1.1; color: var(--accent); }
  .big span { font-size: 26px; font-weight: 500; color: var(--fg); }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .card { border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
  .count { font-size: 30px; font-weight: 700; }
  h2 { font-size: 20px; margin-bottom: 12px; }
  .sample { border-top: 1px solid var(--line); padding: 12px 0; }
  .sample p { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .before { color: var(--muted); font-size: 16px; }
  .before mark { background: none; color: inherit; text-decoration: line-through; }
  .after mark { background: var(--tint); color: inherit; border-radius: 3px; padding: 0 2px; }
  footer { margin-top: auto; font-size: 15px; color: var(--muted); }
</style></head>
<body>
  <header><h1>${esc(host)}</h1>
    <p class="muted">Yangi alifboga o'tish: bosh sahifa tekshiruvi · ${date}</p></header>
  <section>${headline(report)}</section>
  ${changed === 0 ? "" : `<section class="grid">${letterCards}</section>`}
  <p>${pageLine}</p>
  ${samples.length ? `<section><h2>Hozir → yangi alifboda</h2>${sampleRows}</section>` : ""}
  <footer>${LAW} Faqat bosh sahifa tekshirildi, raqamlar taxminiy.</footer>
</body></html>
`
}
