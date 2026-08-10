/**
 * Chrome Web Store / Edge / AMO listing assets, captured rather than drawn.
 *
 * Every store asks for 1280x800 screenshots and rejects a listing without one.
 * The tempting shortcut is to mock the UI up in SVG — and it is the wrong one:
 * a drawing drifts from the code the moment either changes, and "screenshots
 * must accurately represent the extension" is a review criterion, not a
 * suggestion. So this drives a real headless Chrome with the real built
 * extension side-loaded, makes a real selection on a real page, and
 * photographs what happens.
 *
 * Two Chrome passes per shot:
 *   1. the capture — the extension doing its job, at deviceScaleFactor 2
 *   2. the frame   — that capture placed under a caption band, also at 2x
 * The raw capture is embedded at its natural size so it renders 1:1 inside the
 * frame; the downscale at the end is the only resample the pixels ever see.
 *
 *   node scripts/store-screenshots.mjs             # Uzbek — the default listing
 *   node scripts/store-screenshots.mjs --locale en
 *   node scripts/store-screenshots.mjs --locale ru
 *
 * Output: apps/extensions/latin-cyrillic/.output/store/<locale>/
 */

import { spawn } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/**
 * `sharp` is NOT a dependency of this repo and must not become one — it is a
 * large native binary that arrives transitively and nothing that ships needs
 * it. Reached through the pnpm store exactly as `scannability.test.ts` does,
 * so the missing-transitive-dep failure reads the same in both places.
 *
 * Three jobs here, all of them store requirements: the 2x downscale, removing
 * the alpha channel, and forcing truecolor rather than a palette.
 */
const require = createRequire(import.meta.url)
const pnpmStore = path.join(ROOT, "node_modules/.pnpm")
const sharpDir = fs
  .readdirSync(pnpmStore)
  .find((name) => name.startsWith("sharp@"))
if (!sharpDir) {
  console.error("sharp is not in the pnpm store; run `pnpm install`")
  process.exit(1)
}
const sharp = require(path.join(pnpmStore, sharpDir, "node_modules", "sharp"))

const EXT_DIR = path.join(
  ROOT,
  "apps/extensions/latin-cyrillic/.output/chrome-mv3"
)
const OUT_ROOT = path.join(ROOT, "apps/extensions/latin-cyrillic/.output/store")

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

/** The store's required frame. Every asset below is derived from it. */
const SHOT = { width: 1280, height: 800 }
/** Height of the caption band; the capture fills what is left. */
const BAND = 96
const VIEWPORT = { width: SHOT.width, height: SHOT.height - BAND }
const SCALE = 2
const PORT = 9333

/**
 * A page of the owner's own site, in Uzbek prose.
 *
 * Deliberately not a third-party site: a store screenshot showing someone
 * else's product borrows their trademark to sell yours, and reviewers do
 * reject it. It is also the honest demo — long-form Latin Uzbek is exactly
 * what the extension is for.
 */
const DEMO_PAGE =
  "https://webiston.uz/books/ai-engineering/1-introduction-to-building-ai-applications-with-foundation-models/the-rise-of-ai-engineering"

/** Chrome's UI locale decides which `_locales` bundle the extension speaks. */
const CHROME_LANG = { uz: "uz", en: "en-US", ru: "ru" }

/**
 * Captions, in the language of the listing they belong to.
 *
 * One line each, and each names a BEHAVIOUR rather than a feature — "select
 * text and a button appears" is something a reader can picture before
 * installing; "supports transliteration" is not.
 */
const CAPTIONS = {
  uz: {
    trigger: "Matnni tanlang — yonida kichik tugma paydo bo'ladi",
    panel: "Lotin ↔ Kirill, sahifadan chiqmasdan",
    dark: "Qorong'i rejim — sahifangiz bilan bir xil",
    popup: "Brauzer panelidan: yozing yoki qo'ying, darhol o'giriladi",
    privacy: "Matn qurilmangizdan chiqmaydi — server ham, hisob ham yo'q"
  },
  en: {
    trigger: "Select any text — a small button appears beside it",
    panel: "Latin ↔ Cyrillic, without leaving the page",
    dark: "Dark mode, matching the page you are reading",
    popup: "From the toolbar: type or paste, converted as you go",
    privacy: "Your text never leaves the device — no server, no account"
  },
  ru: {
    trigger: "Выделите текст — рядом появится кнопка",
    panel: "Латиница ↔ кириллица, не покидая страницу",
    dark: "Тёмная тема — как на самой странице",
    popup: "Из панели браузера: введите или вставьте — сразу перевод",
    privacy: "Текст не покидает устройство — ни сервера, ни аккаунта"
  }
}

const NAME = {
  uz: "Lotin-Kirill O'giruvchi",
  en: "Latin-Cyrillic Converter",
  ru: "Латиница-Кириллица"
}

/** The sample is Latin Uzbek in every listing — it is what gets converted. */
const SAMPLE = "Sun'iy intellekt muhandisligi tez rivojlanmoqda."

/** Light/dark values lifted from `src/styles/tokens.css`, not re-invented. */
const THEME = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.205 0.012 217)",
    muted: "oklch(0.505 0.012 217)",
    border: "oklch(0.905 0.008 217)",
    card: "oklch(0.985 0.004 217)",
    brand: "oklch(0.49 0.085 217)"
  },
  dark: {
    background: "oklch(0.145 0.008 217)",
    foreground: "oklch(0.985 0 0)",
    muted: "oklch(0.72 0.02 217)",
    border: "oklch(0.28 0.008 217)",
    card: "oklch(0.205 0.006 217)",
    brand: "oklch(0.745 0.115 217)"
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Minimal CDP client. Node 24 ships `WebSocket`, so there is no dependency. */
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    const pending = new Map()
    let nextId = 0

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data)
      const entry = pending.get(message.id)
      if (!entry) return
      pending.delete(message.id)
      if (message.error) entry.reject(new Error(message.error.message))
      else entry.resolve(message.result)
    })
    ws.addEventListener("error", reject)
    ws.addEventListener("open", () =>
      resolve({
        send: (method, params = {}) =>
          new Promise((res, rej) => {
            const id = ++nextId
            pending.set(id, { resolve: res, reject: rej })
            ws.send(JSON.stringify({ id, method, params }))
          }),
        close: () => ws.close()
      })
    )
  })
}

/**
 * A throwaway copy of the build that can only speak ONE language.
 *
 * `--lang=uz` does not produce an Uzbek panel: Uzbek is not a Chrome UI
 * locale, so Chrome resolves to en-US, finds `_locales/en`, and uses it — the
 * first Uzbek screenshots came back captioned in Uzbek with an English panel
 * inside them. `default_locale` is consulted only when NO bundle matches, so
 * the reliable lever is to leave exactly one bundle in place.
 *
 * Always a copy, never `.output` itself — the artefact that gets zipped and
 * uploaded has to keep all three.
 */
function stageExtension(locale) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `wc-ext-${locale}-`))
  fs.cpSync(EXT_DIR, dir, { recursive: true })

  const locales = path.join(dir, "_locales")
  for (const name of fs.readdirSync(locales)) {
    if (name !== locale) {
      fs.rmSync(path.join(locales, name), { recursive: true, force: true })
    }
  }

  const manifestFile = path.join(dir, "manifest.json")
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"))
  manifest.default_locale = locale
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2))
  return dir
}

/**
 * Boot Chrome and side-load the staged extension.
 *
 * NOT via `--load-extension`: Chrome 137 disabled that switch, and the failure
 * is silent — the browser starts, pages load, and the extension simply is not
 * there, so the first symptom is a screenshot of a page with no panel on it.
 * `Extensions.loadUnpacked` is the sanctioned replacement, needs
 * `--enable-unsafe-extension-debugging`, and hands back the real extension ID
 * instead of one recomputed from a path hash.
 */
async function launchChrome(lang, extDir) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "wc-store-"))
  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--enable-unsafe-extension-debugging",
    `--lang=${lang}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--disable-features=Translate,MediaRouter",
    `--force-device-scale-factor=${SCALE}`,
    "about:blank"
  ])
  chrome.stderr.on("data", () => {})

  let endpoint
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(
        (r) => r.json()
      )
      endpoint = version.webSocketDebuggerUrl
      break
    } catch {
      await sleep(250)
    }
  }
  if (!endpoint) throw new Error("Chrome never opened a debugging endpoint")

  const browser = await connect(endpoint)
  const { id } = await browser.send("Extensions.loadUnpacked", { path: extDir })
  browser.close()

  return {
    id,
    // The profile is deleted on a best effort. Chrome keeps writing to it for
    // a moment after SIGTERM, so an eager `rmSync` throws ENOTEMPTY — and that
    // throw lands in a `finally`, where it REPLACES whatever real failure sent
    // us there. Losing the actual error to temp-dir cleanup is a bad trade.
    stop: () => {
      chrome.kill()
      try {
        fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 })
      } catch {
        /* the OS reaps it */
      }
    }
  }
}

/** Open a fresh tab and attach to it, with the viewport already emulated. */
async function openTab({ dark = false, width, height } = {}) {
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
    method: "PUT"
  }).then((r) => r.json())

  const page = await connect(target.webSocketDebuggerUrl)
  await page.send("Page.enable")
  await page.send("Runtime.enable")
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: width ?? VIEWPORT.width,
    height: height ?? VIEWPORT.height,
    deviceScaleFactor: SCALE,
    mobile: false
  })
  await page.send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: dark ? "dark" : "light" },
      // A store screenshot is a still. Motion the reader will never see only
      // risks catching the panel mid-transition.
      { name: "prefers-reduced-motion", value: "reduce" }
    ]
  })
  /**
   * Without this the selection paints in the INACTIVE colour — the flat grey
   * every browser uses when its window loses focus. A headless tab is never
   * focused, so the one thing these screenshots exist to show would have
   * shipped looking disabled.
   */
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true })
  return { page, id: target.id }
}

async function closeTab(tab) {
  tab.page.close()
  await fetch(`http://127.0.0.1:${PORT}/json/close/${tab.id}`)
}

async function settle(page) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const { result } = await page.send("Runtime.evaluate", {
      expression: "document.readyState"
    })
    if (result.value === "complete") break
    await sleep(250)
  }
  // The content script runs at document_idle; give it room, plus the fonts.
  await sleep(2500)
}

/**
 * `siteTheme` is a different knob from the emulated colour scheme.
 *
 * webiston.uz runs next-themes with `defaultTheme="dark"` and
 * `storageKey="theme"` (`src/app/layout.tsx`), so a fresh profile renders the
 * page DARK whatever `prefers-color-scheme` says — which is why the light
 * shots came back dark the first time. The key has to be written and the page
 * reloaded, so the blocking theme script reads it before first paint.
 */
async function goto(page, url, siteTheme) {
  await page.send("Page.navigate", { url })
  await settle(page)
  if (siteTheme) {
    await page.send("Runtime.evaluate", {
      expression: `localStorage.setItem("theme", "${siteTheme}")`
    })
    await page.send("Page.reload")
    await settle(page)
  }
}

async function evaluate(page, expression) {
  const { result, exceptionDetails } = await page.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  })
  if (exceptionDetails) throw new Error(exceptionDetails.text)
  return result.value
}

async function capture(page) {
  const { data } = await page.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false
  })
  return Buffer.from(data, "base64")
}

async function click(page, x, y) {
  const shared = { x, y, button: "left", clickCount: 1 }
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    ...shared
  })
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    ...shared
  })
}

/**
 * Make a selection the way the extension expects to find one.
 *
 * A real `Input` drag would be more faithful still, but a synthetic Range plus
 * a bubbled `mouseup` enters `handleMouseUp` through the identical door and is
 * reproducible to the character — which matters when the same shot has to be
 * retaken for three locales.
 *
 * The extra `scrollBy` parks the selection near the top of the viewport. At
 * dead centre the panel has no room beneath it, flips above, and lands on the
 * page's own heading; from up here it opens downwards into empty column.
 */
const SELECT_IN_PAGE = (chars) => `(() => {
  const paragraph = [...document.querySelectorAll("main p, article p, p")]
    .find((p) => p.textContent.trim().length > 220 && p.offsetParent)
  if (!paragraph) return null
  paragraph.scrollIntoView({ block: "center" })
  window.scrollBy(0, paragraph.getBoundingClientRect().top - 140)

  const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT)
  const node = walker.nextNode()
  const range = document.createRange()
  range.setStart(node, 0)
  range.setEnd(node, Math.min(node.length, ${chars}))
  const selection = getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }))

  const rect = range.getBoundingClientRect()
  return {
    badgeX: Math.min(rect.right + 8, innerWidth - 44) + 16,
    badgeY: Math.max(rect.top + rect.height / 2 - 16, 8) + 16
  }
})()`

// ============================================
// FRAMING
// ============================================

/** Shared chrome for every framed asset, so the five read as one set. */
function frameShell({ caption, theme, iconDataUri, body }) {
  const t = THEME[theme]
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box }
  body {
    width: ${SHOT.width}px; height: ${SHOT.height}px;
    background: ${t.background}; color: ${t.foreground};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
      sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .band {
    height: ${BAND}px; display: flex; align-items: center; gap: 14px;
    padding: 0 32px; border-bottom: 1px solid ${t.border};
    background: ${t.card};
  }
  .band > img { width: 34px; height: 34px; display: block }
  .caption {
    font-size: 21px; font-weight: 600; letter-spacing: -0.012em;
    line-height: 1.3;
  }
  .wordmark {
    margin-left: auto; font-size: 13px; font-weight: 500; letter-spacing: .02em;
    color: ${t.muted};
  }
  .shot { width: ${SHOT.width}px; height: ${VIEWPORT.height}px; display: block }
  .stage {
    height: ${VIEWPORT.height}px; display: flex; align-items: center;
    justify-content: center; background: ${t.card};
  }
  .popup {
    display: block; border: 1px solid ${t.border}; border-radius: 14px;
    box-shadow: 0 24px 60px -18px rgb(0 0 0 / 28%);
  }
</style></head>
<body>
  <div class="band">
    <img src="${iconDataUri}" alt="">
    <div class="caption">${caption}</div>
    <div class="wordmark">webiston.uz</div>
  </div>
  ${body}
</body></html>`
}

/**
 * A popup capture is 380px wide; the frame it has to fill is 1280. Centring it
 * at 1:1 — rather than stretching it — keeps the UI honest and lets the
 * surrounding tone carry the theme.
 */
function popupBody(imageDataUri, size) {
  return `<div class="stage">
    <img class="popup" src="${imageDataUri}"
         style="width:${size.width}px;height:${size.height}px" alt="">
  </div>`
}

/** Render arbitrary HTML at 2x and hand back the raw buffer. */
async function renderHtml(html, width, height) {
  const tab = await openTab({ width, height })
  await tab.page.send("Page.navigate", {
    url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
  })
  await sleep(900)
  const buffer = await capture(tab.page)
  await closeTab(tab)
  return buffer
}

/** Exact size, no alpha — both are hard requirements on all three stores. */
async function writeAsset(buffer, width, height, file) {
  await sharp(buffer)
    .resize(width, height, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .png({ palette: false, compressionLevel: 9 })
    .toFile(file)
  return file
}

// ============================================
// SHOTS
// ============================================

async function shotSelection({ dark, openPanel }) {
  const tab = await openTab({ dark })
  await goto(tab.page, DEMO_PAGE, dark ? "dark" : "light")

  const anchor = await evaluate(tab.page, SELECT_IN_PAGE(96))
  if (!anchor) throw new Error("no paragraph long enough on the demo page")
  await sleep(400)

  if (openPanel) {
    await click(tab.page, anchor.badgeX, anchor.badgeY)
    await sleep(900)
  }
  const buffer = await capture(tab.page)
  await closeTab(tab)
  return buffer
}

async function shotPopup({ dark, extensionUrl }) {
  const tab = await openTab({ dark, width: 380, height: 620 })
  await goto(tab.page, extensionUrl)

  const box = await evaluate(
    tab.page,
    `(() => {
      const rect = document.querySelector("textarea").getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })()`
  )
  await click(tab.page, box.x, box.y)
  await tab.page.send("Input.insertText", { text: SAMPLE })
  await sleep(500)
  // Typing leaves a focus ring on the input, which photographs as a defect
  // rather than as state. Blur it, keep the text.
  await evaluate(tab.page, "document.activeElement.blur()")

  // The popup sizes itself; measure it rather than guessing a height.
  const size = await evaluate(
    tab.page,
    `(() => {
      const root = document.getElementById("root").firstElementChild
      const rect = root.getBoundingClientRect()
      return { width: Math.round(rect.width), height: Math.round(rect.height) }
    })()`
  )
  await tab.page.send("Emulation.setDeviceMetricsOverride", {
    width: size.width,
    height: size.height,
    deviceScaleFactor: SCALE,
    mobile: false
  })
  await sleep(300)
  const buffer = await capture(tab.page)
  await closeTab(tab)
  return { buffer, size }
}

// ============================================
// PROMO TILES
// ============================================

function tileHtml({ locale, width, height, iconDataUri, marquee }) {
  const t = THEME.light
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box }
  body {
    width: ${width}px; height: ${height}px; background: ${t.card};
    color: ${t.foreground}; display: flex; align-items: center;
    justify-content: center; gap: ${marquee ? 40 : 22}px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
      sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  img { width: ${marquee ? 132 : 84}px; height: ${marquee ? 132 : 84}px }
  h1 {
    font-size: ${marquee ? 46 : 27}px; font-weight: 700;
    letter-spacing: -0.028em; line-height: 1.2;
  }
  p {
    margin-top: ${marquee ? 12 : 7}px; font-size: ${marquee ? 21 : 14}px;
    color: ${t.muted}; line-height: 1.4;
  }
  .rule {
    margin-top: ${marquee ? 16 : 10}px; width: ${marquee ? 72 : 44}px;
    height: 3px; border-radius: 2px; background: ${t.brand};
  }
</style></head>
<body>
  <img src="${iconDataUri}" alt="">
  <div>
    <h1>${NAME[locale]}</h1>
    <p>${CAPTIONS[locale].panel}</p>
    <div class="rule"></div>
  </div>
</body></html>`
}

// ============================================
// MAIN
// ============================================

const localeArg = process.argv.indexOf("--locale")
const locale = localeArg === -1 ? "uz" : process.argv[localeArg + 1]
if (!CAPTIONS[locale]) {
  console.error(`unknown locale "${locale}" — expected uz | en | ru`)
  process.exit(1)
}

if (!fs.existsSync(path.join(EXT_DIR, "manifest.json"))) {
  console.error("no build at .output/chrome-mv3 — run `pnpm ext:build` first")
  process.exit(1)
}

const outDir = path.join(OUT_ROOT, locale)
fs.mkdirSync(outDir, { recursive: true })

const iconDataUri = `data:image/png;base64,${fs
  .readFileSync(path.join(EXT_DIR, "icon/128.png"))
  .toString("base64")}`

const stagedExt = stageExtension(locale)
const chrome = await launchChrome(CHROME_LANG[locale], stagedExt)
const written = []

try {
  const captions = CAPTIONS[locale]
  const uri = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`

  /** [file, caption, theme, take] — the order the store shows them in. */
  const inPage = [
    [
      "01-selection",
      captions.trigger,
      "light",
      () => shotSelection({ dark: false, openPanel: false })
    ],
    [
      "02-panel",
      captions.panel,
      "light",
      () => shotSelection({ dark: false, openPanel: true })
    ],
    [
      "03-dark",
      captions.dark,
      "dark",
      () => shotSelection({ dark: true, openPanel: true })
    ]
  ]

  for (const [name, caption, theme, take] of inPage) {
    process.stdout.write(`  ${name} … `)
    const raw = await take()
    const framed = await renderHtml(
      frameShell({
        caption,
        theme,
        iconDataUri,
        body: `<img class="shot" src="${uri(raw)}" alt="">`
      }),
      SHOT.width,
      SHOT.height
    )
    const file = path.join(outDir, `${name}.png`)
    await writeAsset(framed, SHOT.width, SHOT.height, file)
    written.push(file)
    console.log("ok")
  }

  const popups = [
    ["04-popup", captions.popup, "light", false],
    ["05-privacy", captions.privacy, "dark", true]
  ]
  for (const [name, caption, theme, dark] of popups) {
    process.stdout.write(`  ${name} … `)
    const { buffer, size } = await shotPopup({
      dark,
      extensionUrl: `chrome-extension://${chrome.id}/popup.html`
    })
    const framed = await renderHtml(
      frameShell({
        caption,
        theme,
        iconDataUri,
        body: popupBody(uri(buffer), size)
      }),
      SHOT.width,
      SHOT.height
    )
    const file = path.join(outDir, `${name}.png`)
    await writeAsset(framed, SHOT.width, SHOT.height, file)
    written.push(file)
    console.log("ok")
  }

  const tiles = [
    ["promo-small-440x280", 440, 280, false],
    ["promo-marquee-1400x560", 1400, 560, true]
  ]
  for (const [name, width, height, marquee] of tiles) {
    process.stdout.write(`  ${name} … `)
    const raw = await renderHtml(
      tileHtml({ locale, width, height, iconDataUri, marquee }),
      width,
      height
    )
    const file = path.join(outDir, `${name}.png`)
    await writeAsset(raw, width, height, file)
    written.push(file)
    console.log("ok")
  }
} finally {
  chrome.stop()
  fs.rmSync(stagedExt, { recursive: true, force: true })
}

console.log(`\n${written.length} assets → ${outDir}`)
for (const file of written) {
  const { width, height, channels } = await sharp(file).metadata()
  console.log(`  ${path.basename(file)}  ${width}x${height}  ${channels}ch`)
}
