/**
 * Tool-scoped constants.
 */

import type { Breakpoint, DevicePreset } from "../types"

/**
 * Tailwind v4's default breakpoints, which are this site's breakpoints.
 *
 * Verified, not remembered: `src/styles/tokens.css` has two `@theme` blocks and
 * neither declares a `--breakpoint-*` token, so the framework defaults stand.
 * If that ever changes, this list has to change with it — which is why the rem
 * value is carried alongside the pixel one.
 */
export const TAILWIND_BREAKPOINTS: readonly Breakpoint[] = [
  { name: "sm", min: 640 },
  { name: "md", min: 768 },
  { name: "lg", min: 1024 },
  { name: "xl", min: 1280 },
  { name: "2xl", min: 1536 }
] as const

/** Below the first breakpoint there is no prefix — that is the base layer. */
export const BASE_BREAKPOINT = "base"

/**
 * Aspect ratios worth naming.
 *
 * Ordered widest to narrowest so the nearest-match search is stable, and kept
 * as exact fractions rather than decimals so the comparison stays honest.
 */
export const NAMED_RATIOS: readonly { label: string; value: number }[] = [
  { label: "32:9", value: 32 / 9 },
  { label: "21:9", value: 21 / 9 },
  { label: "2:1", value: 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "16:10", value: 16 / 10 },
  { label: "3:2", value: 3 / 2 },
  { label: "4:3", value: 4 / 3 },
  { label: "5:4", value: 5 / 4 },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "2:3", value: 2 / 3 },
  { label: "10:16", value: 10 / 16 },
  { label: "9:16", value: 9 / 16 },
  { label: "9:19.5", value: 9 / 19.5 },
  { label: "9:20", value: 9 / 20 }
] as const

/**
 * How close a measured ratio has to be to earn a standard name.
 *
 * 1.5% — wide enough that a browser window one pixel off still reads "16:9",
 * narrow enough that 16:9 and 16:10 (11% apart) can never be confused.
 */
export const RATIO_TOLERANCE = 0.015

/**
 * Devices to compare against, in CSS pixels and portrait orientation.
 *
 * These are VIEWPORT sizes, not marketing resolutions. An iPhone 15 Pro Max is
 * sold as 1290×2796; its viewport is 430×932 because `devicePixelRatio` is 3.
 * The number a media query sees is the one in this table, and getting that
 * wrong is the single most common mistake in device-size cheat sheets.
 */
export const DEVICE_PRESETS: readonly DevicePreset[] = [
  { name: "iPhone SE", width: 375, height: 667, pixelRatio: 2, kind: "phone" },
  { name: "iPhone 15", width: 393, height: 852, pixelRatio: 3, kind: "phone" },
  {
    name: "iPhone 15 Pro Max",
    width: 430,
    height: 932,
    pixelRatio: 3,
    kind: "phone"
  },
  {
    name: "Galaxy S24",
    width: 360,
    height: 780,
    pixelRatio: 3,
    kind: "phone"
  },
  {
    name: "Pixel 8",
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    kind: "phone"
  },
  {
    name: "iPad mini",
    width: 744,
    height: 1133,
    pixelRatio: 2,
    kind: "tablet"
  },
  {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    pixelRatio: 2,
    kind: "tablet"
  },
  {
    name: 'iPad Pro 13"',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    kind: "tablet"
  },
  {
    name: 'MacBook Air 13"',
    width: 1280,
    height: 800,
    pixelRatio: 2,
    kind: "laptop"
  },
  {
    name: 'MacBook Pro 14"',
    width: 1512,
    height: 982,
    pixelRatio: 2,
    kind: "laptop"
  },
  {
    name: "Laptop (HD)",
    width: 1366,
    height: 768,
    pixelRatio: 1,
    kind: "laptop"
  },
  {
    name: "Desktop (FHD)",
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    kind: "desktop"
  },
  {
    name: "Desktop (QHD)",
    width: 2560,
    height: 1440,
    pixelRatio: 1,
    kind: "desktop"
  },
  {
    name: "Desktop (4K)",
    width: 3840,
    height: 2160,
    pixelRatio: 1,
    kind: "desktop"
  }
] as const

/**
 * How far a viewport may sit from a preset and still be called a match.
 *
 * 8 CSS pixels absorbs a scrollbar, which is the difference between "this is
 * an iPad" and "this is an iPad with a scrollbar" — a distinction nobody
 * opening this page cares about.
 */
export const PRESET_TOLERANCE = 8

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = [
  "screenVsViewport",
  "whyNotMarketing",
  "breakpoints",
  "pixelRatio",
  "aspectRatio"
] as const
