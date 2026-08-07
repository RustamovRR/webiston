#!/usr/bin/env node
/**
 * Message key parity across every served locale.
 *
 * A key present in one locale and missing in the other is a RUNTIME defect, not
 * a TODO: next-intl throws / renders the raw key path where the string should be.
 * Nothing else in the toolchain catches it — typecheck cannot see inside JSON,
 * and the build succeeds regardless.
 *
 * Found for real on 2026-07-29: the code called tErrors("decodeError"), uz had
 * it, en had the same string under `urlDecodeError` — so every English user hit
 * a broken error message in the URL encoder.
 *
 *   pnpm i18n        exit 1 if any namespace is out of parity
 *   pnpm i18n --dead also list keys that exist in both but are unused in code
 */

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const MESSAGES = join(ROOT, "messages")

/**
 * The served locales, read from `src/i18n/locales.ts`.
 *
 * Parsed rather than hardcoded, because a hardcoded copy here was the FIFTH
 * one in the repo and the most dangerous: a gate that checks the wrong list
 * passes while ignoring the thing it exists to check. This is a `.mjs` script
 * and that file is TypeScript, so a regex is the honest option — and it fails
 * loudly rather than guessing if the shape ever changes.
 */
function servedLocales() {
  const source = readFileSync(join(ROOT, "src/i18n/locales.ts"), "utf8")
  const match = source.match(/export const LOCALES = \[([^\]]+)\]/)
  if (!match) {
    console.error("✗ Could not read LOCALES from src/i18n/locales.ts.")
    console.error("  This gate cannot verify a list it cannot find.")
    process.exit(1)
  }
  return match[1]
    .split(",")
    .map((part) => part.trim().replace(/["']/g, ""))
    .filter(Boolean)
}

const LOCALES = servedLocales()

/** Flatten a nested message object to dotted key paths. */
function flatten(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

/**
 * Every directory that holds per-locale message files.
 *
 * A directory with SOME locale files is a bundle with a hole in it, not a
 * non-bundle. The version this replaces required every locale to be present
 * before it would look at a directory at all — so adding a locale and
 * forgetting one bundle made that bundle **silently unchecked**, which is the
 * precise failure this gate exists to prevent.
 */
function bundleDirs(dir, acc = []) {
  const present = LOCALES.filter((l) => existsSync(join(dir, `${l}.json`)))
  if (present.length > 0) acc.push({ dir, present })
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) bundleDirs(join(dir, e.name), acc)
  }
  return acc
}

/** Same reasoning as MIN_SCANNED in token-guardrail.mjs: with zero bundles this
 *  script reports "✓ parity across 0 message bundles" and exits 0. There
 *  are 19 today; a collapse means discovery broke, not that the strings did. */
const MIN_BUNDLES = 10

let failures = 0
const bundles = bundleDirs(MESSAGES)

if (bundles.length < MIN_BUNDLES) {
  console.error(
    `✗ Only ${bundles.length} message bundle(s) found under ${MESSAGES} — expected at least ${MIN_BUNDLES}.`
  )
  console.error(
    "  Bundle discovery is broken, so this gate would pass without checking anything."
  )
  process.exit(1)
}

for (const { dir, present } of bundles) {
  const rel = dir.replace(`${ROOT}/`, "")

  // A locale with no file at all in a bundle that has others. Reported as its
  // own failure rather than folded into the key diff, because "you have not
  // translated this namespace yet" and "you renamed one key" are different
  // problems with different fixes.
  const absent = LOCALES.filter((l) => !present.includes(l))
  if (absent.length > 0) {
    failures++
    console.error(`✗ ${rel} — no message file for: ${absent.join(", ")}`)
    console.error(
      `  Every served locale needs a bundle; a missing one is a broken page, not a TODO.`
    )
    continue
  }

  const sets = Object.fromEntries(
    LOCALES.map((l) => [
      l,
      new Set(flatten(JSON.parse(readFileSync(join(dir, `${l}.json`), "utf8"))))
    ])
  )

  // Missing in a locale that another locale has = a broken string at runtime.
  for (const locale of LOCALES) {
    const others = LOCALES.filter((l) => l !== locale)
    for (const other of others) {
      const missing = [...sets[other]].filter((k) => !sets[locale].has(k))
      if (!missing.length) continue
      // Only report one direction per pair to avoid duplicate noise.
      if (LOCALES.indexOf(locale) > LOCALES.indexOf(other)) continue
      failures += missing.length
      console.error(
        `\n✗ ${rel}: ${missing.length} key(s) in ${other} but not ${locale}`
      )
      for (const k of missing.slice(0, 12)) console.error(`    ${k}`)
      if (missing.length > 12)
        console.error(`    … and ${missing.length - 12} more`)
    }
  }
}

/* ------------------------------------------------------------------------- *
 * Check 2 — every namespace a CLIENT component needs is provided by some
 * `NextIntlClientProvider`.
 *
 * This exists because of a real regression on 2026-07-29. Scoping the localised
 * layout's provider to the chrome namespaces broke `/tools`: `ToolsMainPage` is
 * a Client Component calling `Tools`, `ToolsPage`, `ToolCategories` and
 * `Filters`, and nothing provided them any more. The page still returned
 * **HTTP 200** and still rendered — next-intl prints the key path instead of
 * throwing — so a status-code sweep over all 34 tool URLs passed. Only the
 * browser console showed it.
 *
 * Deliberate limitation: this proves each namespace is provided SOMEWHERE, not
 * that it is provided on the right route. That is still weaker than a
 * per-route check, but it is exactly the signal that was missing.
 * ------------------------------------------------------------------------- */

/** Never `glob()` inside src/app — `[locale]` is a glob character class, so the
 *  pattern silently matches nothing. Walk the tree instead. */
function walkFiles(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (!e.name.startsWith("__")) walkFiles(p, acc)
    } else if (/\.tsx?$/.test(e.name)) {
      acc.push(p)
    }
  }
  return acc
}

const NS_CALL = /useTranslations\("([^".]+)/g
const NS_LIST = /(?:CHROME|CLIENT|INDEX)_NAMESPACES = \[(.*?)\]/gs
const NS_SINGLE = /TOOL_NAMESPACE = "([^"]+)"/g

const required = new Set()
const provided = new Set()

for (const file of walkFiles(join(ROOT, "src"))) {
  const src = readFileSync(file, "utf8")

  // Only CLIENT components need a provider; Server Components read the request
  // config directly.
  if (src.split("\n")[0].includes('"use client"')) {
    for (const m of src.matchAll(NS_CALL)) required.add(m[1])
  }

  for (const m of src.matchAll(NS_LIST)) {
    for (const q of m[1].matchAll(/"([^"]+)"/g)) provided.add(q[1])
  }
  for (const m of src.matchAll(NS_SINGLE)) provided.add(m[1])
}

const unprovided = [...required].filter((ns) => !provided.has(ns)).sort()

if (unprovided.length) {
  console.error(
    `\n✗ ${unprovided.length} namespace(s) are used by a Client Component but provided by no provider:`
  )
  for (const ns of unprovided) console.error(`    ${ns}`)
  console.error(
    "\n  A page missing its namespace still returns 200 and still renders — next-intl"
  )
  console.error(
    "  prints the key path. Add it to the route's <LocaleMessages namespaces={...}>."
  )
  failures += unprovided.length
}

if (failures) {
  console.error(
    `\n✗ ${failures} i18n problem(s). Every user-facing string ships in uz AND en, in the same commit.`
  )
  process.exit(1)
}

console.log(
  `✓ ${LOCALES.join("/")} parity across ${bundles.length} message bundles — no missing keys.`
)
console.log(
  `✓ all ${required.size} client namespaces are provided (${provided.size} provided in total).`
)
