/**
 * New-alphabet report for an organisation's website — a sales tool, run
 * locally, never deployed.
 *
 * Why local: webiston is on Vercel Hobby, which forbids commercial use, and a
 * public "check any URL" endpoint is a quota anyone can burn. Here it is one
 * GET per site (plus its sitemap) from this machine.
 *
 *   pnpm alifbo-check https://example.uz [https://…]
 *   pnpm alifbo-check --file saytlar.txt     # one URL per line, # comments
 *
 * For each site: fetch the home page (Chrome renders it when the HTML is a
 * JavaScript shell), drop the Russian lines, convert the rest with
 * `@webiston/transliteration`, count what changes, read the sitemap for a page
 * count, and write `reports/alifbo/<host>.html` + `.png` (gitignored) — the
 * PNG is what goes into the Telegram message.
 */

import { execFile } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { promisify } from "node:util"

import { convertToScript } from "@webiston/transliteration"

import {
  REPORT_HEIGHT,
  REPORT_WIDTH,
  renderReport,
  sameWord,
  WORD
} from "./alifbo-report.mjs"

const run = promisify(execFile)

const OUT_DIR = resolve("reports/alifbo")
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
// A desktop browser's — plenty of .uz hosts answer a bare `node` UA with 403.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
const FETCH_TIMEOUT_MS = 15_000
/** Fewer words than this in the raw HTML means a client-rendered shell. */
const MIN_WORDS = 80
/** A sitemap index can fan out to hundreds of files; an estimate needs a few. */
const MAX_SITEMAPS = 20
/** How many before/after lines fit on the 4:5 report. */
const MAX_SAMPLES = 3
/** The four letters the law brings in, and what each replaces. */
const NEW_LETTERS = [
  { letter: "ş", latin: "sh", cyrillic: "ш" },
  { letter: "ç", latin: "ch", cyrillic: "ч" },
  { letter: "ö", latin: "o'", cyrillic: "ў" },
  { letter: "ğ", latin: "g'", cyrillic: "ғ" }
]

const HAS_LETTER = /\p{L}/u
const CYRILLIC = /\p{Script=Cyrillic}/u
// Uzbek Cyrillic has ў қ ғ ҳ; Russian has ы and щ, which Uzbek all but never uses.
const UZ_CYRILLIC = /[ўқғҳЎҚҒҲ]/
const RU_CYRILLIC = /[ыщЫЩ]/

const NAMED = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  laquo: "«",
  raquo: "»",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”"
}

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "uz,ru;q=0.8,en;q=0.5" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  // Old Uzbek sites still serve windows-1251: the header first, then <meta>.
  const head = new TextDecoder("latin1").decode(bytes.slice(0, 4096))
  const charset =
    /charset=["']?([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1] ??
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    "utf-8"
  let decoder
  try {
    decoder = new TextDecoder(charset)
  } catch {
    decoder = new TextDecoder()
  }
  return { url: res.url, body: decoder.decode(bytes) }
}

async function render(url) {
  const { stdout } = await run(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--dump-dom",
      "--virtual-time-budget=10000",
      `--user-agent=${UA}`,
      url
    ],
    { maxBuffer: 64 * 1024 * 1024, timeout: 90_000 }
  )
  return stdout
}

function decodeEntity(match, name) {
  if (name[0] !== "#") return NAMED[name.toLowerCase()] ?? match
  const hex = name[1] === "x" || name[1] === "X"
  const code = hex ? Number.parseInt(name.slice(2), 16) : Number(name.slice(1))
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : match
}

/** Visible text, one entry per block; a menu repeated for mobile counts once. */
function htmlToLines(html) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      /<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1\s*>/gi,
      " "
    )
    .replace(
      /<\/?(p|div|li|ul|ol|h[1-6]|tr|td|th|table|section|article|header|footer|nav|main|aside|form|button|option|title|br)\b[^>]*>/gi,
      "\n"
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, decodeEntity)
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => HAS_LETTER.test(l))
  return [...new Set(lines)]
}

const wordCount = (lines) =>
  lines.reduce((n, l) => n + (l.match(WORD)?.length ?? 0), 0)

/**
 * Keep the Uzbek. A Cyrillic line stays when it shows an Uzbek-only letter,
 * or when the page is mostly Uzbek Cyrillic and the line shows no Russian-only
 * one — "Главная" on a Latin page is the language switcher, not content.
 */
function keepUzbek(lines) {
  const count = (re) => lines.filter((l) => re.test(l)).length
  const uzCyrillicPage =
    count(UZ_CYRILLIC) > count(RU_CYRILLIC) &&
    count(CYRILLIC) > lines.length / 2
  const kept = lines.filter(
    (l) =>
      !CYRILLIC.test(l) ||
      UZ_CYRILLIC.test(l) ||
      (uzCyrillicPage && !RU_CYRILLIC.test(l))
  )
  return { lines: kept, dropped: lines.length - kept.length }
}

const occurrences = (s, ch) => s.toLowerCase().split(ch).length - 1

/**
 * Words with a capital inside — TechJobs, YouTube — are brand names the
 * engine's own list cannot know. Converting a prospect's brand ("TeçJobs") in
 * the report that pitches the conversion would sink the pitch.
 */
function brandNames(lines) {
  const words = lines.flatMap((l) => l.match(WORD) ?? [])
  return [...new Set(words.filter((w) => /\p{Ll}\p{Lu}/u.test(w)))]
}

function analyse(lines) {
  let words = 0
  let changed = 0
  const sources = { latin: 0, cyrillic: 0, "latin-2027": 0 }
  const added = Object.fromEntries(NEW_LETTERS.map((l) => [l.letter, 0]))
  const samples = []
  const preserve = brandNames(lines)

  for (const line of lines) {
    const { text, source } = convertToScript(line, "latin-2027", { preserve })
    const before = line.match(WORD) ?? []
    const after = text.match(WORD) ?? []
    const diff =
      before.length === after.length
        ? before.filter((w, i) => !sameWord(w, after[i])).length
        : Math.min(
            before.length,
            after.filter((w) => !before.some((b) => sameWord(b, w))).length
          )

    sources[source] += before.length
    words += before.length
    changed += diff
    for (const { letter } of NEW_LETTERS) {
      added[letter] += occurrences(text, letter) - occurrences(line, letter)
    }
    if (diff && line.length >= 40 && line.length <= 220) {
      samples.push({ before: line, after: text, diff })
    }
  }

  const source = Object.entries(sources).sort((a, b) => b[1] - a[1])[0][0]
  const from = source === "cyrillic" ? "cyrillic" : "latin"
  return {
    words,
    changed,
    source,
    letters: NEW_LETTERS.map((l) => ({
      letter: l.letter,
      from: l[from],
      count: added[l.letter]
    })),
    samples: samples.sort((a, b) => b.diff - a.diff).slice(0, MAX_SAMPLES)
  }
}

async function countPages(origin) {
  const robots = await get(`${origin}/robots.txt`).catch(() => ({ body: "" }))
  const listed = [...robots.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)]
  const queue = listed.length
    ? listed.map((m) => m[1])
    : [`${origin}/sitemap.xml`]
  const pages = new Set()

  for (let fetched = 0; queue.length && fetched < MAX_SITEMAPS; fetched++) {
    const { body } = await get(queue.shift()).catch(() => ({ body: "" }))
    const locs = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)]
    if (/<sitemapindex/i.test(body)) queue.push(...locs.map((m) => m[1]))
    else for (const m of locs) pages.add(m[1])
  }
  return pages.size || null
}

async function screenshot(htmlPath, pngPath) {
  await run(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      `--window-size=${REPORT_WIDTH},${REPORT_HEIGHT}`,
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath).href
    ],
    { timeout: 60_000 }
  )
}

async function check(input) {
  const page = await get(
    /^https?:\/\//i.test(input) ? input : `https://${input}`
  )
  let lines = htmlToLines(page.body)
  const rendered = wordCount(lines) < MIN_WORDS
  if (rendered) lines = htmlToLines(await render(page.url))

  const { lines: uzbek, dropped } = keepUzbek(lines)
  if (wordCount(uzbek) === 0) {
    throw new Error(
      "o'zbekcha matn topilmadi — sahifa rus yoki ingliz tilidami?"
    )
  }
  const { origin, hostname } = new URL(page.url)
  const host = hostname.replace(/^www\./, "")
  const report = { host, ...analyse(uzbek), pages: await countPages(origin) }

  const htmlPath = join(OUT_DIR, `${host}.html`)
  const pngPath = join(OUT_DIR, `${host}.png`)
  await writeFile(htmlPath, renderReport(report))
  await screenshot(htmlPath, pngPath)
  return { ...report, rendered, dropped, pngPath }
}

async function readTargets(argv) {
  const at = argv.indexOf("--file")
  if (at === -1) return argv
  const path = argv[at + 1]
  const list = await readFile(path ?? "", "utf8").catch(() => {
    console.error(
      `Fayl topilmadi: ${path ?? "(yo'l berilmagan)"} — har qatorida bitta sayt manzili yozilgan .txt fayl kerak.`
    )
    process.exit(1)
  })
  const fromFile = list
    .split("\n")
    .map((l) => l.replace(/#.*/, "").trim())
    .filter(Boolean)
  return [...argv.slice(0, at), ...argv.slice(at + 2), ...fromFile]
}

const targets = await readTargets(process.argv.slice(2))
if (!targets.length) {
  console.error(
    "Ishlatish: pnpm alifbo-check https://sayt.uz [...]  yoki  --file saytlar.txt"
  )
  process.exit(1)
}

await mkdir(OUT_DIR, { recursive: true })
let failed = 0
for (const target of targets) {
  try {
    const r = await check(target)
    const share = r.words ? Math.round((r.changed / r.words) * 100) : 0
    const notes = [
      r.rendered && "Chrome orqali",
      r.dropped && `${r.dropped} ta ruscha qator tashlandi`
    ].filter(Boolean)
    console.log(
      `✓ ${r.host} — ${r.words} so'z, ${r.changed} o'zgaradi (${share}%), ` +
        `${r.pages ? `~${r.pages} sahifa` : "sitemap yo'q"} [${r.source}]` +
        `${notes.length ? ` · ${notes.join(", ")}` : ""}\n  → ${relative(process.cwd(), r.pngPath)}`
    )
  } catch (err) {
    failed++
    console.log(`✗ ${target} — ${err.message}`)
  }
}
process.exitCode = failed ? 1 : 0
