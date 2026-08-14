/**
 * Submit URLs to IndexNow — the instant-indexing protocol Yandex and Bing
 * honour. Google does not participate (see seo-strategy.md §Refuted), but
 * Yandex is this site's proven second traffic source, and a new document
 * page should not wait weeks for its crawl.
 *
 * Deliberately MANUAL, not a postbuild hook: IndexNow is for URLs that
 * CHANGED, and re-submitting the whole sitemap on every deploy is the abuse
 * pattern the protocol's rate guidance exists for. Run it when a page is new
 * or meaningfully changed:
 *
 *   pnpm indexnow /tools/tushuntirish-xati /tools/tilxat
 *   pnpm indexnow https://webiston.uz/tools/tilxat
 *
 * The key is not a secret — the protocol REQUIRES it to be publicly served
 * (that is how the endpoint verifies we own the host), which is why it can
 * live in the repo.
 */

const HOST = "webiston.uz"
const KEY = "20005ae975984d0a01a94ce62af7abcf"

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error("Usage: pnpm indexnow <path-or-url> [...]")
  process.exit(1)
}

const urlList = args.map((arg) =>
  arg.startsWith("http") ? arg : `https://${HOST}${arg}`
)

const bad = urlList.filter((url) => !url.startsWith(`https://${HOST}/`))
if (bad.length > 0) {
  console.error(`Not on ${HOST}: ${bad.join(", ")}`)
  process.exit(1)
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList
  })
})

// 200 and 202 both mean "accepted"; anything else names the reason.
console.log(`IndexNow: ${response.status} ${response.statusText}`)
for (const url of urlList) console.log(`  → ${url}`)
if (!(response.status === 200 || response.status === 202)) {
  console.error(await response.text())
  process.exit(1)
}
