/**
 * Pull the last N days out of Yandex Metrica — the Reports API, read-only.
 *
 * This exists because the document family and the 38 rewritten descriptions
 * both shipped on reasoning, and the next decision (document #4, or a resume
 * builder, or neither) should ship on NUMBERS. Metrica is the site's proven
 * second traffic source and the only one of the three analytics that hands
 * back SEARCH PHRASES, which is the thing an SEO decision actually needs.
 *
 *   pnpm metrica            # last 30 days
 *   pnpm metrica 7          # last 7 days
 *
 * Reads `.env` (gitignored) via Node's own --env-file — no dotenv dependency:
 *   NEXT_PUBLIC_YM_ID      the counter, already there for the tracking script
 *   YANDEX_METRICA_TOKEN   an OAuth token with the `metrika:read` permission
 *
 * The token is a SECRET and the counter id is not: the counter is public in
 * the page source anyway, the token would let anyone read the whole account.
 */

const COUNTER = process.env.NEXT_PUBLIC_YM_ID
const TOKEN = process.env.YANDEX_METRICA_TOKEN
const DAYS = Number(process.argv[2] ?? 30)

if (!COUNTER || !TOKEN) {
  console.error(
    "Kerak: NEXT_PUBLIC_YM_ID va YANDEX_METRICA_TOKEN (.env faylida).\n" +
      "Ishga tushirish: pnpm metrica [kun]"
  )
  process.exit(1)
}

/** One Reports API call. Metrica answers 403 when the token lacks metrika:read. */
async function report({ metrics, dimensions, sort, limit = 10 }) {
  const url = new URL("https://api-metrika.yandex.net/stat/v1/data")
  url.searchParams.set("ids", COUNTER)
  url.searchParams.set("metrics", metrics)
  if (dimensions) url.searchParams.set("dimensions", dimensions)
  if (sort) url.searchParams.set("sort", sort)
  url.searchParams.set("date1", `${DAYS}daysAgo`)
  url.searchParams.set("date2", "today")
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("accuracy", "full")

  const res = await fetch(url, { headers: { Authorization: `OAuth ${TOKEN}` } })
  const body = await res.json()

  if (!res.ok) {
    const hint =
      res.status === 403
        ? "\n→ Token'da `metrika:read` ruxsati yo'q. OAuth ilovaga Yandex.Metrica ruxsatini qo'shib, tokenni qaytadan oling."
        : res.status === 401
          ? "\n→ Token yaroqsiz yoki muddati tugagan."
          : ""
    throw new Error(`${res.status} ${body?.message ?? res.statusText}${hint}`)
  }
  return body
}

const pad = (s, n) => String(s).slice(0, n).padEnd(n)
const num = (n) => Number(n).toLocaleString("en-US")

function table(title, data, { valueLabel = "tashrif" } = {}) {
  console.log(`\n── ${title} ───────────────────────────────`)
  if (!data.data?.length) {
    console.log("   (ma'lumot yo'q)")
    return
  }
  for (const row of data.data) {
    const name = row.dimensions.map((d) => d.name ?? "—").join(" · ")
    console.log(
      `   ${pad(name, 46)} ${String(num(row.metrics[0])).padStart(7)} ${valueLabel}`
    )
  }
}

console.log(`\n📊 Yandex Metrica · counter ${COUNTER} · oxirgi ${DAYS} kun`)

// 1. The shape of the traffic, before any breakdown of it.
const totals = await report({
  metrics:
    "ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds"
})
const [visits, users, pageviews, bounce, duration] = totals.totals
console.log(`\n── Umumiy ───────────────────────────────`)
console.log(`   Tashrif       ${num(visits)}`)
console.log(`   Foydalanuvchi ${num(users)}`)
console.log(`   Sahifa ko'rish ${num(pageviews)}`)
console.log(`   Bounce        ${Number(bounce).toFixed(1)}%`)
console.log(`   O'rtacha vaqt ${Math.round(duration)}s`)

// 2. Which pages people actually LAND on — the SEO surface.
table(
  "Eng ko'p kirilgan sahifalar",
  await report({
    metrics: "ym:s:visits",
    dimensions: "ym:s:startURLPathFull",
    sort: "-ym:s:visits",
    limit: 20
  })
)

// 3. Where they come from at all.
table(
  "Trafik manbalari",
  await report({
    metrics: "ym:s:visits",
    dimensions: "ym:s:lastTrafficSource",
    sort: "-ym:s:visits"
  })
)

table(
  "Qidiruv tizimlari",
  await report({
    metrics: "ym:s:visits",
    dimensions: "ym:s:lastSearchEngineRoot",
    sort: "-ym:s:visits"
  })
)

// 4. The reason this script exists: the actual queries. Yandex shows these;
//    Google hides them behind "not provided" and Search Console.
table(
  "Qidiruv iboralari  ← keyingi qaror shu yerdan chiqadi",
  await report({
    metrics: "ym:s:visits",
    dimensions: "ym:s:lastSearchPhrase",
    sort: "-ym:s:visits",
    limit: 40
  })
)

table(
  "Geografiya",
  await report({
    metrics: "ym:s:visits",
    dimensions: "ym:s:regionCity",
    sort: "-ym:s:visits"
  })
)

console.log("")
