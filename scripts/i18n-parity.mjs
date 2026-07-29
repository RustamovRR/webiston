#!/usr/bin/env node
/**
 * uz/en message key parity.
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
const LOCALES = ["uz", "en"]

/** Flatten a nested message object to dotted key paths. */
function flatten(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

/** Every directory that holds a per-locale message file. */
function bundleDirs(dir, acc = []) {
  if (LOCALES.every((l) => existsSync(join(dir, `${l}.json`)))) acc.push(dir)
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) bundleDirs(join(dir, e.name), acc)
  }
  return acc
}

/** Same reasoning as MIN_SCANNED in token-guardrail.mjs: with zero bundles this
 *  script reports "✓ uz/en parity across 0 message bundles" and exits 0. There
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

for (const dir of bundles) {
  const sets = Object.fromEntries(
    LOCALES.map((l) => [
      l,
      new Set(flatten(JSON.parse(readFileSync(join(dir, `${l}.json`), "utf8"))))
    ])
  )
  const rel = dir.replace(`${ROOT}/`, "")

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

if (failures) {
  console.error(
    `\n✗ ${failures} key(s) out of parity. Every user-facing string ships in uz AND en, in the same commit.`
  )
  process.exit(1)
}

console.log(
  `✓ uz/en parity across ${bundles.length} message bundles — no missing keys.`
)
