"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { ImageOff } from "lucide-react"
import { useTranslations } from "next-intl"

import { LARGE_CARD_MIN_WIDTH, PLATFORM_LIMITS, PLATFORMS } from "../constants"
import type { ImageProbe, MetaDraft, Platform } from "../types"

/**
 * The card, as the platform will draw it.
 *
 * One preview that SWITCHES, not five stacked at once. What this replaces
 * rendered a Facebook block, a Twitter block and a Telegram block one under
 * the other — and above them a row of five platform buttons that had no
 * `onClick` at all, so the control that looked like the way to choose was
 * decorative.
 *
 * Each platform gets its OWN truncation, which is the only reason a preview is
 * worth drawing: seeing the same title fit on Telegram and get cut on X is the
 * answer to "is my headline too long", and no character counter conveys it as
 * directly.
 *
 * The image is a plain `<img>`. `next/image` optimises images the site owns
 * through a server route; this URL belongs to the visitor, points anywhere on
 * the internet, and must be fetched exactly as the crawler will fetch it —
 * including failing the same way, which is what makes the failure state
 * meaningful.
 */

interface SocialPreviewProps {
  draft: MetaDraft
  platform: Platform
  onPlatformChange: (platform: Platform) => void
  probe: ImageProbe
}

const PLATFORM_LABEL: Record<Platform, string> = {
  telegram: "Telegram",
  x: "X",
  facebook: "Facebook",
  linkedin: "LinkedIn"
}

function truncate(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

export function SocialPreview({
  draft,
  platform,
  onPlatformChange,
  probe
}: SocialPreviewProps) {
  const t = useTranslations("OgMetaGeneratorPage.preview")
  const limits = PLATFORM_LIMITS[platform]

  const title = truncate(draft.title, limits.title)
  const description = truncate(draft.description, limits.description)
  const host = hostOf(draft.url)
  const showImage = probe.status === "ready" && draft.image.trim().length > 0

  /**
   * Whether the card is the tall kind, decided the way each platform decides.
   *
   * `twitter:card` is an X tag. The first version of this component used it
   * for all four previews, which drew a lie: setting it to `summary` shrank
   * the Telegram card, and Telegram has never read that tag. Everywhere else
   * the image's own WIDTH decides — a small picture gets a thumbnail beside
   * the text, a wide one gets the full-width card — so the preview now
   * answers the same question the platform will.
   */
  const isLarge =
    platform === "x"
      ? draft.twitterCard !== "summary"
      : probe.status === "ready" && probe.width >= LARGE_CARD_MIN_WIDTH

  return (
    <div className="space-y-4">
      <div className="min-w-0 overflow-x-auto">
        <SegmentedControl<Platform>
          label={t("platform")}
          value={platform}
          onChange={onPlatformChange}
          options={PLATFORMS.map((value) => ({
            value,
            label: PLATFORM_LABEL[value]
          }))}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border-strong bg-muted/30">
        <div
          className={
            isLarge ? "" : "flex items-stretch gap-0 divide-x divide-border"
          }
        >
          <div
            className={
              isLarge
                ? "relative aspect-[1.91/1] w-full bg-muted"
                : "relative size-28 shrink-0 bg-muted"
            }
          >
            {showImage ? (
              // biome-ignore lint/performance/noImgElement: the URL is the
              // visitor's and points anywhere; it has to be fetched exactly as
              // a crawler would, not through this site's image optimiser.
              <img
                src={draft.image.trim()}
                alt={draft.imageAlt || t("imageAlt")}
                className="size-full object-cover"
              />
            ) : probe.status === "loading" ? (
              /* A slow image used to read as "Rasm yo'q" — the tool reported
                 an absent picture while it was in the middle of fetching one.
                 A shimmer in the reserved box says "working", and there is no
                 progress BAR because there is no progress to report: an
                 `Image()` load has no events between start and finish, and a
                 bar that invents its own position is a lie about a wait. */
              <div
                className="flex size-full items-center justify-center overflow-hidden"
                aria-live="polite"
                aria-busy="true"
              >
                <span className="sr-only">{t("imageLoading")}</span>
                <span className="block size-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/10 to-transparent bg-[length:200%_100%]" />
              </div>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff size={20} aria-hidden="true" />
                <span className="px-3 text-center text-xs">
                  {probe.status === "error" ? t("imageFailed") : t("noImage")}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1 p-3">
            <p className="truncate text-muted-foreground text-xs uppercase tracking-wide">
              {host || t("noUrl")}
            </p>
            <p className="line-clamp-2 font-medium text-foreground text-sm">
              {title || t("noTitle")}
            </p>
            <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
              {description || t("noDescription")}
            </p>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        {t("truncation", {
          platform: PLATFORM_LABEL[platform],
          title: limits.title,
          description: limits.description
        })}
      </p>
    </div>
  )
}

/** The host is what a card shows, not the whole address. */
function hostOf(url: string): string {
  try {
    return new URL(url.trim()).host.replace(/^www\./, "")
  } catch {
    return ""
  }
}
