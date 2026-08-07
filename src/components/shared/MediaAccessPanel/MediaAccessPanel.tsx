"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Camera, Mic, ShieldAlert, ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import type { MediaAccessStatus, PermissionState } from "@/hooks/useMediaAccess"
import type { MediaFailure } from "@/lib/utils/media"

/**
 * The panel a media tool shows before it has a device — and instead of one when
 * it cannot get one.
 *
 * Shared by the camera and microphone tools because the situation is identical
 * and the wording should be too. What it exists to fix:
 *
 * - **Nothing is requested until the button is pressed.** Both tools used to
 *   call `getUserMedia` from a mount effect, so the browser dialog appeared
 *   before the visitor had read anything. This panel says what will happen and
 *   waits.
 * - **Each failure gets its own advice.** A blocked permission needs the
 *   browser's site settings, a missing device needs a cable, and a busy device
 *   needs the other app closed. One "access error" covered all three before,
 *   and it was actionable for none of them.
 * - **What the browser already decided is shown up front.** Where the
 *   Permissions API answers, the panel says *already allowed* or *blocked in
 *   settings* before the click, so a press that will silently do nothing is
 *   never offered as if it might work.
 */

interface MediaAccessPanelProps {
  status: MediaAccessStatus
  failure: MediaFailure | null
  permission: PermissionState
  /** Selects the wording. The two tools differ only in this noun. */
  kind: "camera" | "microphone"
  onStart: () => void
}

export function MediaAccessPanel({
  status,
  failure,
  permission,
  kind,
  onStart
}: MediaAccessPanelProps) {
  const t = useTranslations("Common.media")

  const Icon = kind === "camera" ? Camera : Mic
  const isStarting = status === "starting"

  // A permission the browser has already refused is not a failure we caused,
  // but it is the same dead end — so it reads as one rather than offering a
  // button whose only outcome is nothing happening.
  const reason: MediaFailure | null =
    failure ?? (permission === "denied" ? "denied" : null)

  if (reason) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <ShieldAlert
          aria-hidden="true"
          className="size-8 shrink-0 text-warning"
        />
        <div className="max-w-prose space-y-2">
          <p className="font-medium text-base text-foreground">
            {t(`failure.${reason}.title`, { kind: t(`kind.${kind}`) })}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(`failure.${reason}.advice`, { kind: t(`kind.${kind}`) })}
          </p>
        </div>
        {/* Retry is offered for everything except the two that cannot change
            without the visitor leaving the page — pressing it there would be
            a button that is guaranteed to fail. */}
        {reason !== "unsupported" && reason !== "insecureContext" ? (
          <Button onClick={onStart} disabled={isStarting} variant="outline">
            {t("retry")}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <Icon aria-hidden="true" className="size-8 shrink-0 text-primary" />

      <div className="max-w-prose space-y-2">
        <p className="font-medium text-base text-foreground">
          {t(`prompt.${kind}.title`)}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(`prompt.${kind}.body`)}
        </p>
      </div>

      <Button onClick={onStart} disabled={isStarting}>
        {isStarting ? t("starting") : t(`prompt.${kind}.action`)}
      </Button>

      {permission === "granted" ? (
        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
          {t("alreadyAllowed")}
        </p>
      ) : (
        // Said before the click, not after: the dialog is the browser's, we
        // cannot style it, and a visitor who is not expecting it dismisses it.
        <p className="text-muted-foreground text-xs">{t("willAsk")}</p>
      )}
    </div>
  )
}
