import type { NavigatorLike } from "../types"

/**
 * Working out what a visitor is running.
 *
 * Every rule here replaces one that was wrong, and they were wrong in the same
 * direction: written against the user-agent string as it looked around 2015.
 *
 * - **`ua.includes("Chrome") && !ua.includes("Edg")` called every
 *   Chromium browser Chrome.** Opera, Brave, Vivaldi and Arc all ship
 *   `Chrome/` in their user-agent; Opera also ships `OPR/`, which is the part
 *   that identifies it.
 * - **Chrome and Edge on iOS were reported as Safari.** They are `CriOS/` and
 *   `EdgiOS/` — neither string contains `Chrome`, and both contain `Safari`.
 * - **An iPad was reported as a desktop.** Since iPadOS 13 Safari sends a
 *   Macintosh user-agent by default; the tell is that a Mac has no touch
 *   screen, so `maxTouchPoints > 1` on a "Mac" means iPad.
 * - **The version was fabricated precision.** Chrome froze its user-agent
 *   version in 2022 — the minor parts read `0.0.0` for everyone — so
 *   `Chrome/120.0.6099.109` was a number the browser no longer publishes
 *   there. `navigator.userAgentData.brands` is the value that is still true.
 */

/** Brands every Chromium browser lists to defeat naive sniffing. */
const FILLER_BRANDS = /not.?a.?brand/i
const CHROMIUM_BRAND = /^chromium$/i

/**
 * The browser name and version.
 *
 * Client Hints first — that is where a Chromium browser publishes its real
 * identity — and the user-agent string only where Client Hints do not exist,
 * which today means Firefox and Safari.
 */
export function describeBrowser(navigatorLike: NavigatorLike): {
  name: string
  version: string
  source: "hints" | "ua"
} {
  const brands = navigatorLike.brands ?? []
  // The list always carries a deliberately absurd filler brand and often
  // "Chromium"; the remaining entry is the browser the visitor actually opened.
  const real = brands.find(
    (brand) =>
      !FILLER_BRANDS.test(brand.brand) && !CHROMIUM_BRAND.test(brand.brand)
  )
  if (real) {
    return { name: real.brand, version: real.version, source: "hints" }
  }

  const ua = navigatorLike.userAgent
  const match = (pattern: RegExp) => ua.match(pattern)?.[1] ?? ""

  // Order matters: every one of these also contains an earlier browser's name.
  if (/OPR\//.test(ua)) {
    return { name: "Opera", version: match(/OPR\/([\d.]+)/), source: "ua" }
  }
  if (/Edg(?:iOS|A|)\//.test(ua)) {
    return { name: "Edge", version: match(/Edg\w*\/([\d.]+)/), source: "ua" }
  }
  if (/CriOS\//.test(ua)) {
    return { name: "Chrome", version: match(/CriOS\/([\d.]+)/), source: "ua" }
  }
  if (/FxiOS\//.test(ua)) {
    return { name: "Firefox", version: match(/FxiOS\/([\d.]+)/), source: "ua" }
  }
  if (/Firefox\//.test(ua)) {
    return {
      name: "Firefox",
      version: match(/Firefox\/([\d.]+)/),
      source: "ua"
    }
  }
  if (/Chrome\//.test(ua)) {
    return { name: "Chrome", version: match(/Chrome\/([\d.]+)/), source: "ua" }
  }
  if (/Safari\//.test(ua)) {
    return { name: "Safari", version: match(/Version\/([\d.]+)/), source: "ua" }
  }

  return { name: "", version: "", source: "ua" }
}

/** The rendering engine, which is the fact that actually predicts behaviour. */
export function describeEngine(userAgent: string): string {
  if (/Gecko\/|Firefox\/|FxiOS\//.test(userAgent)) return "Gecko"
  // Every iOS browser is WebKit, whatever its name says.
  if (/CriOS\/|FxiOS\/|EdgiOS\/|iPhone|iPad/.test(userAgent)) return "WebKit"
  if (/Chrome\/|Chromium\/|OPR\/|Edg\//.test(userAgent)) return "Blink"
  if (/AppleWebKit\//.test(userAgent)) return "WebKit"
  return ""
}

export type DeviceKind = "mobile" | "tablet" | "desktop"

/**
 * Mobile, tablet or desktop.
 *
 * `navigator.userAgentData.mobile` is a boolean the browser states outright,
 * so it settles the phone/desktop question where it exists. The tablet case
 * still needs the touch-point check: an iPad claims to be a Mac.
 */
export function describeDeviceKind(navigatorLike: NavigatorLike): DeviceKind {
  const { userAgent, maxTouchPoints, platform, mobile } = navigatorLike

  if (/iPad/.test(userAgent)) return "tablet"
  // The iPadOS tell: a desktop Macintosh user-agent on a machine with a touch
  // screen. No Mac has one.
  if (
    /Macintosh/.test(userAgent) &&
    maxTouchPoints > 1 &&
    !/iPhone/.test(userAgent)
  ) {
    return "tablet"
  }
  if (/Tablet|PlayBook|Silk/.test(userAgent)) return "tablet"
  if (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) return "tablet"

  if (mobile === true) return "mobile"
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/.test(userAgent)) {
    return "mobile"
  }

  // `platform` is deprecated and frozen, so it is the last word rather than
  // the first — but it still separates a phone from a desktop when nothing
  // else has answered.
  if (platform && /iPhone|Android/.test(platform)) return "mobile"

  return "desktop"
}

/**
 * The operating system.
 *
 * `platformVersion` from Client Hints is the only way to tell Windows 11 from
 * Windows 10 — both send `Windows NT 10.0` in the user-agent — so the caller
 * passes it in when the browser provides it.
 */
export function describeOs(
  navigatorLike: NavigatorLike,
  platformVersion?: string
): string {
  const ua = navigatorLike.userAgent
  const hinted = navigatorLike.uaPlatform

  if (hinted === "Windows") {
    // Client Hints report Windows 11 as major version 13 or above; 10 and 11
    // are indistinguishable in the user-agent string.
    const major = Number.parseInt(platformVersion ?? "", 10)
    if (Number.isFinite(major) && major > 0) {
      return major >= 13 ? "Windows 11" : "Windows 10"
    }
    return "Windows"
  }

  if (/iPhone|iPod/.test(ua)) return `iOS ${version(ua, /OS ([\d_]+)/)}`.trim()
  if (/iPad/.test(ua)) return `iPadOS ${version(ua, /OS ([\d_]+)/)}`.trim()
  if (/Android/.test(ua))
    return `Android ${version(ua, /Android ([\d.]+)/)}`.trim()
  if (/Mac OS X/.test(ua)) {
    // Safari froze this at 10.15.7 years ago, so the number is not reported
    // as a macOS version unless Client Hints give a real one.
    return platformVersion ? `macOS ${platformVersion}` : "macOS"
  }
  if (/Windows NT 10/.test(ua)) return "Windows 10/11"
  if (/Windows/.test(ua)) return "Windows"
  if (/CrOS/.test(ua)) return "ChromeOS"
  if (/Linux/.test(ua)) return "Linux"

  return hinted ?? ""
}

function version(ua: string, pattern: RegExp): string {
  return (ua.match(pattern)?.[1] ?? "").replace(/_/g, ".")
}
