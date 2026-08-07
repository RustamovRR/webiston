"use client"

import { TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"

import type { MediaFailure } from "@/lib/utils/media"

/**
 * A failure that did NOT cost you the session.
 *
 * `MediaAccessPanel` is the whole page when there is no device. This is the
 * other case, and the one that is easy to get wrong: switching to a camera
 * another application already has open fails *while the one you were using is
 * still running*. Treating that as "blocked" would replace the toolbar — stop
 * button included — with a gate panel, over a device that is still recording
 * you. So the stream stays, and the reason appears here instead.
 */

interface MediaFailureNoticeProps {
  failure: MediaFailure
  kind: "camera" | "microphone"
}

export function MediaFailureNotice({ failure, kind }: MediaFailureNoticeProps) {
  const t = useTranslations("Common.media")

  return (
    <p
      // `alert`, unlike the hints elsewhere in these tools: the visitor pressed
      // something and it did not do what they asked, which is the case the
      // assertive role exists for.
      role="alert"
      className="flex w-full items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-foreground text-sm leading-relaxed"
    >
      <TriangleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-warning"
      />
      <span>
        {t(`failure.${failure}.title`, { kind: t(`kind.${kind}`) })} —{" "}
        {t(`failure.${failure}.advice`, { kind: t(`kind.${kind}`) })}{" "}
        <span className="text-muted-foreground">{t("stayedOnPrevious")}</span>
      </span>
    </p>
  )
}
