"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Download, Trash2 } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"
import type { Recording } from "@/hooks/useMediaRecording"
import { formatDuration, formatFileSize } from "@/lib/utils"

import { MAX_RECORDINGS } from "../constants"

/**
 * What you recorded, playable where it sits.
 *
 * The panel this replaces opened a modal to play a clip. A modal is the right
 * shape for something that needs the whole screen; an audio player is not that
 * — it is a control bar, and putting it behind a dialog meant you could not
 * compare two takes without closing one to open the other. They all play in
 * place here, so listening to three recordings back to back is three clicks.
 *
 * The player is the browser's own `<audio controls>`, deliberately: it is
 * keyboard-accessible, it has a scrubber and a volume control we would
 * otherwise rebuild, and on a phone it hands off to the system media controls.
 *
 * The list scrolls in its own box, so a long session never sets the height of
 * the page.
 */

interface RecordingsCardProps {
  recordings: readonly Recording[]
  onRemove: (id: string) => void
  onClear: () => void
}

export function RecordingsCard({
  recordings,
  onRemove,
  onClear
}: RecordingsCardProps) {
  const t = useTranslations("MicrophoneTestPage.recordings")
  const format = useFormatter()

  return (
    <ToolCard
      title={t("title")}
      tone="muted"
      actions={
        recordings.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t("clearAll")}
          </Button>
        ) : null
      }
      bodyClassName="p-0"
    >
      {recordings.length === 0 ? (
        <p className="px-5 py-8 text-center text-muted-foreground text-sm">
          {t("empty")}
        </p>
      ) : (
        <ul className="max-h-[26rem] divide-y divide-border overflow-y-auto">
          {recordings.map((recording) => (
            <li key={recording.id} className="space-y-2 px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-foreground text-sm">
                    {recording.filename}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                    {formatDuration(recording.duration)} ·{" "}
                    {formatFileSize(recording.size)} ·{" "}
                    {format.dateTime(recording.at, { timeStyle: "medium" })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {/* A real anchor, so the browser's own download handling
                      applies — the version this replaces built an `<a>` in
                      JavaScript, appended it to the body, clicked it and
                      removed it again for every single download. */}
                  <Button asChild variant="ghost" size="icon">
                    <a
                      href={recording.url}
                      download={recording.filename}
                      aria-label={t("download")}
                    >
                      <Download aria-hidden="true" className="size-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onRemove(recording.id)
                    }}
                    aria-label={t("delete")}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>

              {/* biome-ignore lint/a11y/useMediaCaption: a recording the
                  visitor just made of their own microphone, seconds ago, on
                  this device — there is no caption track to supply and no
                  second party who has not heard it. */}
              <audio
                controls
                preload="metadata"
                src={recording.url}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      )}

      <p className="border-border border-t px-5 py-3 text-muted-foreground text-xs">
        {t("limit", { count: MAX_RECORDINGS })}
      </p>
    </ToolCard>
  )
}
