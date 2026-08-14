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
const DAYS = Number(process.argv[2] ?? 28)
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
async function query({ dimensions = [], rowLimit = 25 } = {}) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`
  const res = await fetch(url, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      startDate: day(DAYS),
      endDate: day(2),
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
