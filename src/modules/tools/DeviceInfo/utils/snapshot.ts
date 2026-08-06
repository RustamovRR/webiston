import type { InfoGroup, NavigatorLike } from "../types"
import {
  describeBrowser,
  describeDeviceKind,
  describeEngine,
  describeOs
} from "./detect"

/**
 * Everything this page can learn about the visit, read once.
 *
 * Two APIs here are Chromium-only and both are read defensively rather than
 * feature-detected by name: `navigator.connection` (Network Information) and
 * `navigator.deviceMemory`. Where they are absent the row stays and its value
 * is `null`, so the page says "your browser does not report this" instead of
 * quietly showing a shorter list on Firefox.
 */

/** The Client Hints values worth asking for, and what they cost. */
export interface HighEntropyHints {
  platformVersion?: string
  architecture?: string
  model?: string
}

interface NavigatorWithHints extends Navigator {
  userAgentData?: {
    brands: { brand: string; version: string }[]
    platform: string
    mobile: boolean
    getHighEntropyValues: (hints: string[]) => Promise<HighEntropyHints>
  }
  deviceMemory?: number
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }
}

/**
 * `navigator` narrowed to what the pure functions read.
 *
 * The assertion is here and nowhere else: `userAgentData` is still absent from
 * TypeScript's DOM library, so one cast at the boundary is cheaper than
 * `any` at every call site — and everything past this point is typed.
 */
export function readNavigator(): NavigatorLike {
  const nav = navigator as NavigatorWithHints
  return {
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
    platform: nav.platform,
    brands: nav.userAgentData?.brands,
    uaPlatform: nav.userAgentData?.platform,
    mobile: nav.userAgentData?.mobile
  }
}

/**
 * The high-entropy hints, which are async and permission-free but not free of
 * consequence: asking for them is exactly what a fingerprinting script does,
 * which is why the page says so out loud.
 */
export async function readHints(): Promise<HighEntropyHints> {
  const nav = navigator as NavigatorWithHints
  if (!nav.userAgentData?.getHighEntropyValues) return {}
  try {
    return await nav.userAgentData.getHighEntropyValues([
      "platformVersion",
      "architecture",
      "model"
    ])
  } catch {
    // The call rejects rather than resolving empty when the browser declines.
    return {}
  }
}

/** `matchMedia` as a plain string, or `null` where the query is unsupported. */
function media(query: string, whenTrue: string, whenFalse: string): string {
  return window.matchMedia(query).matches ? whenTrue : whenFalse
}

export function readGroups(hints: HighEntropyHints): InfoGroup[] {
  const nav = navigator as NavigatorWithHints
  const like = readNavigator()
  const browser = describeBrowser(like)
  const connection = nav.connection

  return [
    {
      key: "browser",
      rows: [
        {
          key: "name",
          value: [browser.name, browser.version].filter(Boolean).join(" ")
        },
        { key: "engine", value: describeEngine(like.userAgent) },
        // Which SOURCE answered is itself information: it tells you whether
        // the version above is the real one or the frozen user-agent value.
        { key: "source", value: browser.source },
        { key: "userAgent", value: like.userAgent, wide: true }
      ]
    },
    {
      key: "system",
      rows: [
        { key: "os", value: describeOs(like, hints.platformVersion) },
        { key: "architecture", value: hints.architecture ?? null },
        { key: "model", value: hints.model || null },
        {
          key: "timezone",
          value: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        { key: "language", value: navigator.language },
        { key: "languages", value: Array.from(navigator.languages).join(", ") },
        { key: "cookies", value: navigator.cookieEnabled }
      ]
    },
    {
      key: "display",
      rows: [
        { key: "screen", value: `${screen.width} × ${screen.height}` },
        {
          key: "viewport",
          value: `${window.innerWidth} × ${window.innerHeight}`
        },
        { key: "pixelRatio", value: window.devicePixelRatio },
        { key: "colorDepth", value: `${screen.colorDepth} bit` },
        {
          key: "orientation",
          // `screen.orientation.type` is the real answer; comparing width to
          // height calls a narrow desktop window "portrait".
          value: screen.orientation?.type ?? null
        }
      ]
    },
    {
      key: "device",
      rows: [
        { key: "kind", value: describeDeviceKind(like) },
        { key: "touchPoints", value: navigator.maxTouchPoints },
        { key: "cores", value: navigator.hardwareConcurrency ?? null },
        {
          key: "memory",
          // Chromium rounds this to 0.25/0.5/1/2/4/8 deliberately, so it is a
          // floor rather than the installed amount.
          value: nav.deviceMemory ? `≥ ${nav.deviceMemory} GB` : null
        }
      ]
    },
    {
      key: "network",
      rows: [
        { key: "online", value: navigator.onLine },
        { key: "effectiveType", value: connection?.effectiveType ?? null },
        {
          key: "downlink",
          value: connection?.downlink ? `${connection.downlink} Mbit/s` : null
        },
        {
          key: "rtt",
          value: connection?.rtt != null ? `${connection.rtt} ms` : null
        },
        { key: "saveData", value: connection?.saveData ?? null }
      ]
    },
    {
      key: "preferences",
      rows: [
        {
          key: "colorScheme",
          value: media("(prefers-color-scheme: dark)", "dark", "light")
        },
        {
          key: "reducedMotion",
          value: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        },
        {
          key: "contrast",
          value: media("(prefers-contrast: more)", "more", "no-preference")
        },
        {
          key: "forcedColors",
          value: window.matchMedia("(forced-colors: active)").matches
        }
      ]
    }
  ]
}

/**
 * The same data as JSON, built FROM the groups.
 *
 * One source, so the file cannot describe a different device than the page.
 * What this replaces serialised a separate object and wrapped it in a
 * `generated_by` banner and the page's own URL.
 */
export function groupsToJson(groups: InfoGroup[]): string {
  const output: Record<string, Record<string, unknown>> = {}
  for (const group of groups) {
    output[group.key] = Object.fromEntries(
      group.rows.map((row) => [row.key, row.value])
    )
  }
  return JSON.stringify(output, null, 2)
}
