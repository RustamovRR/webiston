/**
 * Google Search Console — the 87% of our search traffic Metrica cannot see.
 *
 * Metrica hands back Yandex's search phrases, but Yandex is 94 of 698 search
 * visits; Google is 592 and strips its queries at the referrer ("not
 * provided"). They exist in exactly one place — Search Console — and this is
 * how they reach a report instead of a browser tab.
 *
 *   pnpm gsc          # last 28 days
 *   pnpm gsc 90       # last 90 days
 *
 * Auth is a Google service account, signed here with Node's own crypto: the
 * official client is ~40 MB of transitive dependencies for one signed JWT and
 * two GETs, which this repo does not pay for. Setup:
 *
 *   1. console.cloud.google.com → project → enable "Google Search Console API"
 *   2. IAM → Service Accounts → create → Keys → Add key → JSON
 *   3. Save the file as .secrets/gsc.json  (gitignored)
 *   4. search.google.com/search-console/users → add the service account's
 *      client_email as a user with FULL permission
 *
 * Env: GOOGLE_SERVICE_ACCOUNT_FILE=.secrets/gsc.json
 */

import { createSign } from "node:crypto"
import { readFileSync } from "node:fs"

const KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE
const ARGS = process.argv.slice(2)

/**
 * `--diff` compares this window with the one immediately before it.
 *
 * The standing tables answer "what is happening"; only a period-over-period
 * diff answers "what CHANGED", which is the question actually asked each time
 * this is run. It lives here rather than in a second script because the JWT
 * dance above is the only expensive part and there is no reason to have two
 * copies of it.
 */
const DIFF = ARGS.includes("--diff")
const DAYS = Number(ARGS.find((a) => !a.startsWith("--")) ?? 28)
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"

if (!KEY_FILE) {
  console.error(
    "Kerak: GOOGLE_SERVICE_ACCOUNT_FILE=.secrets/gsc.json (.env faylida).\n" +
      "Ishga tushirish: pnpm gsc [kun]"
  )
  process.exit(1)
}

let key
try {
  key = JSON.parse(readFileSync(KEY_FILE, "utf8"))
} catch {
  console.error(`Kalit fayli o'qilmadi: ${KEY_FILE}`)
  process.exit(1)
}

/** A service-account access token: sign a JWT, trade it for a bearer token. */
async function accessToken() {
  const b64 = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url")
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })}`
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(key.private_key, "base64url")

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`
    })
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`Token: ${body.error_description ?? res.status}`)
  return body.access_token
}

const token = await accessToken()
const auth = { Authorization: `Bearer ${token}` }

/** Which property this key can actually see — "sc-domain:" or a URL prefix. */
const siteList = await (
  await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
    headers: auth
  })
).json()

const site = (siteList.siteEntry ?? []).find((entry) =>
  entry.siteUrl.includes("webiston.uz")
)

if (!site) {
  console.error(
    "Bu service account hech qaysi webiston.uz property'sini ko'rmayapti.\n" +
      `→ search.google.com/search-console/users da ${key.client_email} ni ` +
      "FULL huquq bilan qo'shing."
  )
  process.exit(1)
}

const day = (offset) =>
  new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10)

/** One Search Analytics query. GSC data lags ~2 days, hence the end offset. */
async function query({
  dimensions = [],
  rowLimit = 25,
  startDate = day(DAYS),
  endDate = day(2)
} = {}) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`
  const res = await fetch(url, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit
    })
  })
  const body = await res.json()
  if (!res.ok) {
    const hint =
      res.status === 403
        ? `\n→ ${key.client_email} ga Search Console'da FULL huquq berilmagan.`
        : ""
    throw new Error(`${res.status} ${body.error?.message ?? ""}${hint}`)
  }
  return body.rows ?? []
}

const pad = (s, n) => String(s).slice(0, n).padEnd(n)
const pct = (n) => `${(n * 100).toFixed(1)}%`

function table(title, rows, { showPosition = true } = {}) {
  console.log(`\n── ${title} ───────────────────────────────`)
  if (!rows.length) {
    console.log("   (ma'lumot yo'q)")
    return
  }
  console.log(
    `   ${pad("", 46)} ${"bosish".padStart(7)} ${"ko'rsat".padStart(8)} ${"CTR".padStart(6)}${showPosition ? "  poz" : ""}`
  )
  for (const row of rows) {
    const name = (row.keys ?? []).join(" · ").replace("https://webiston.uz", "")
    console.log(
      `   ${pad(name, 46)} ${String(row.clicks).padStart(7)} ${String(row.impressions).padStart(8)} ${pct(row.ctr).padStart(6)}${
        showPosition ? `  ${row.position.toFixed(1)}` : ""
      }`
    )
  }
}

console.log(
  `\n🔍 Google Search Console · ${site.siteUrl} · ${day(DAYS)} → ${day(2)}`
)

const [totals] = await query()
if (totals) {
  console.log(`\n── Umumiy ───────────────────────────────`)
  console.log(`   Bosish        ${totals.clicks}`)
  console.log(`   Ko'rsatilish  ${totals.impressions}`)
  console.log(`   CTR           ${pct(totals.ctr)}`)
  console.log(`   O'rtacha poz. ${totals.position.toFixed(1)}`)
}

table(
  "So'rovlar (bosish bo'yicha)",
  await query({ dimensions: ["query"], rowLimit: 40 })
)
table("Sahifalar", await query({ dimensions: ["page"], rowLimit: 25 }))
table("Davlatlar", await query({ dimensions: ["country"], rowLimit: 10 }))

/**
 * The actionable report: queries Google ALREADY shows us for, on page 1-2,
 * that nobody clicks. A bad title or description, not a ranking problem —
 * the cheapest SEO win there is, and invisible without this data.
 */
const near = (await query({ dimensions: ["query"], rowLimit: 200 }))
  .filter(
    (row) => row.impressions >= 20 && row.position <= 20 && row.ctr < 0.02
  )
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 20)

table("⚠ Ko'rsatiladi, lekin bosilmaydi — sarlavha muammosi", near)

console.log("")

if (DIFF) {
  const CUR = { startDate: day(DAYS + 2), endDate: day(2) }
  const PREV = { startDate: day(DAYS * 2 + 2), endDate: day(DAYS + 3) }

  const totalsFor = async (window) =>
    (await query({ ...window, rowLimit: 1 }))[0] ?? {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0
    }
  const [now, before] = [await totalsFor(CUR), await totalsFor(PREV)]

  const delta = (a, b) => {
    const sign = a - b >= 0 ? "+" : ""
    const rel = b ? `, ${(((a - b) / b) * 100).toFixed(0)}%` : ""
    return `${b} → ${a}  (${sign}${a - b}${rel})`
  }

  console.log(
    `\n── Oldingi davr bilan solishtirish ───────────────────────────────`
  )
  console.log(
    `   ${PREV.startDate}..${PREV.endDate}  →  ${CUR.startDate}..${CUR.endDate}\n`
  )
  console.log(`   Bosish        ${delta(now.clicks, before.clicks)}`)
  console.log(`   Ko'rsatilish  ${delta(now.impressions, before.impressions)}`)
  console.log(`   CTR           ${pct(before.ctr)} → ${pct(now.ctr)}`)
  console.log(
    `   Pozitsiya     ${before.position.toFixed(1)} → ${now.position.toFixed(1)}`
  )

  /** Movers, by clicks gained or lost. A page or query that did not exist in
   *  the earlier window shows as 0 → n, which is how a newly indexed page
   *  announces itself. */
  for (const dimension of ["page", "query"]) {
    const [a, b] = await Promise.all([
      query({ ...CUR, dimensions: [dimension], rowLimit: 500 }),
      query({ ...PREV, dimensions: [dimension], rowLimit: 500 })
    ])
    const prev = new Map(b.map((row) => [row.keys[0], row]))
    const rows = [...new Set([...a.map((r) => r.keys[0]), ...prev.keys()])].map(
      (key) => {
        const cur = a.find((r) => r.keys[0] === key) ?? {
          clicks: 0,
          impressions: 0
        }
        const old = prev.get(key) ?? { clicks: 0, impressions: 0 }
        return {
          key: key.replace("https://webiston.uz", ""),
          gained: cur.clicks - old.clicks,
          line: `${String(old.clicks).padStart(4)}→${String(cur.clicks).padStart(4)} bosish · ${String(old.impressions).padStart(6)}→${String(cur.impressions).padStart(6)} ko'rsat`
        }
      }
    )
    const show = (title, list) => {
      console.log(`\n   ${title}`)
      for (const row of list)
        console.log(`     ${pad(row.key, 42)} ${row.line}`)
    }
    const sorted = [...rows].sort((x, y) => y.gained - x.gained)
    show(`${dimension} — o'sish`, sorted.slice(0, 8))
    show(`${dimension} — pasayish`, sorted.slice(-5).reverse())
  }
  console.log("")
}
