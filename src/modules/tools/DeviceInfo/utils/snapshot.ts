import type { InfoGroup, InfoRow, NavigatorLike } from "../types"
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

/**
 * The safe-area insets, in CSS pixels.
 *
 * The rows that save a mobile developer an afternoon. `env(safe-area-inset-*)`
 * is the space taken by a notch, a home indicator or a rounded corner — a
 * layout that ignores it puts a button under the iPhone home bar, and there is
 * no way to read the values from JavaScript except the way this does it:
 * apply them as padding to an element nobody sees and ask what the browser
 * computed. Zero on a desktop, which is a real answer rather than a missing
 * one.
 */
function readSafeArea(): string {
  const probe = document.createElement("div")
  probe.style.cssText =
    "position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)"
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe)
  const sides = [
    computed.paddingTop,
    computed.paddingRight,
    computed.paddingBottom,
    computed.paddingLeft
  ].map((side) => Math.round(Number.parseFloat(side) || 0))
  probe.remove()

  return sides.join(" / ")
}

/** `portrait` or `landscape`, or `null` where the API is absent. */
function orientationAxis(): string | null {
  const type = screen.orientation?.type
  if (!type) return null
  return type.startsWith("portrait") ? "portrait" : "landscape"
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
        {
          key: "visualViewport",
          // On a phone `innerHeight` includes the strip under the address bar
          // that the browser is currently covering; the visual viewport is
          // what the visitor can actually see, and it shrinks when the
          // on-screen keyboard opens.
          value: window.visualViewport
            ? `${Math.round(window.visualViewport.width)} × ${Math.round(window.visualViewport.height)}`
            : null
        },
        { key: "safeArea", value: readSafeArea() },
        { key: "pixelRatio", value: window.devicePixelRatio },
        { key: "colorDepth", value: `${screen.colorDepth} bit` },
        {
          key: "orientation",
          // `screen.orientation.type` is the real answer; comparing width to
          // height calls a narrow desktop window "portrait". The `-primary` /
          // `-secondary` half says which way up the device is, which nobody
          // asked, so the row keeps the axis and the JSON keeps neither more
          // nor less than what is shown.
          value: orientationAxis()
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
        },
        // Two signals that belong on this page more than anywhere else: they
        // are the visitor ASKING not to be tracked, and both are widely
        // ignored — which is the point the privacy note makes.
        { key: "doNotTrack", value: navigator.doNotTrack === "1" },
        {
          key: "globalPrivacyControl",
          value:
            (navigator as Navigator & { globalPrivacyControl?: boolean })
              .globalPrivacyControl ?? null
        }
      ]
    }
  ]
}

/**
 * The same data as a Markdown table.
 *
 * The reason anyone copies this page is to paste it into a bug report, and a
 * 40-line JSON blob in a GitHub issue is worse than a table. Labels are passed
 * in rather than looked up here: the words live in the message bundles.
 */
export function groupsToMarkdown(
  groups: InfoGroup[],
  label: (group: string, row?: string) => string,
  format: (value: InfoRow["value"]) => string
): string {
  return groups
    .map((group) => {
      const rows = group.rows
        .map((row) => `| ${label(group.key, row.key)} | ${format(row.value)} |`)
        .join("\n")
      return `### ${label(group.key)}\n\n| | |\n| --- | --- |\n${rows}`
    })
    .join("\n\n")
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
