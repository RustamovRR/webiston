import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

// Every book page's `openGraph.images` pointed here (`/api/og?title=…&path=…`)
// while no such route existed — so every share card was a 404. This renders it.
//
// Satori (the engine behind ImageResponse) resolves no CSS variables and does
// not understand `oklch()`, so the design tokens cannot be referenced here.
// These are the sRGB values of the brand ramp in globals.css (see the per-key
// comments below): the documented "brand illustration" exception to the token
// rule, kept in one named constant rather than sprinkled inline.
const OG_BRAND = {
  backdropFrom: "#022831", // --brand-950
  backdropTo: "#03414d", // --brand-900
  accent: "#40bedc", // --brand-400
  muted: "#b1e7f6" // --brand-200
} as const

// The image is a pure function of its query string, so a given URL never
// changes. Without this Next serves `max-age=0, must-revalidate` and every
// crawler hit re-runs the Satori layout + PNG encode for all 229 book pages.
const SIZE = {
  width: 1200,
  height: 630,
  headers: {
    "cache-control": "public, immutable, no-transform, max-age=31536000"
  }
}

/** Long chapter titles must not overflow the card. */
const MAX_TITLE = 90

/**
 * The breadcrumb line, or nothing.
 *
 * `path` arrives from the query string, so it is untrusted: only a
 * slash-and-word-characters shape is echoed into the image.
 *
 * The length bound is `{1,120}` and the empty string is rejected FIRST, which
 * is the whole fix for a defect visible on the card: `{0,120}` matches an
 * empty string, and `"".replace(/^\/?/, "/")` is `"/"` — a truthy value, so
 * the caption fell through to a lone slash instead of the tagline. Every
 * request without a `path` — which is every one this site makes outside the
 * book chapters — rendered a bare `/` in the corner.
 */
export function normaliseBreadcrumb(raw: string | null): string {
  const value = raw?.trim() ?? ""
  if (!value) return ""
  return /^\/?[\w\-/]{1,120}$/.test(value) ? value.replace(/^\/?/, "/") : ""
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const rawTitle = searchParams.get("title")?.trim() || "Webiston"
  const title =
    rawTitle.length > MAX_TITLE ? `${rawTitle.slice(0, MAX_TITLE)}…` : rawTitle

  const path = normaliseBreadcrumb(searchParams.get("path"))

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundImage: `linear-gradient(135deg, ${OG_BRAND.backdropFrom} 0%, ${OG_BRAND.backdropTo} 100%)`,
        fontFamily: "sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "16px",
            height: "56px",
            borderRadius: "8px",
            background: OG_BRAND.accent
          }}
        />
        <div
          style={{
            fontSize: "34px",
            fontWeight: 700,
            color: OG_BRAND.accent,
            letterSpacing: "-0.02em"
          }}
        >
          webiston.uz
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: title.length > 50 ? "62px" : "78px",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.15,
          letterSpacing: "-0.03em"
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", fontSize: "28px", color: OG_BRAND.muted }}>
        {path || "O'zbek dasturchilari uchun bepul platforma"}
      </div>
    </div>,
    SIZE
  )
}
