"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Download, Trash2 } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"
import type { Recording } from "@/hooks/useMediaRecording"
import { formatDuration, formatFileSize } from "@/lib/utils"

import { MAX_CAPTURES } from "../constants"
import type { Snapshot } from "../types"

/**
 * What you captured, playable and viewable where it sits.
 *
 * The gallery this replaces opened a modal to look at anything — a 163-line
 * `MediaPreviewModal` whose entire job was showing an image the page could have
 * shown in place. A modal is right for something that needs the whole screen;
 * comparing two takes is the opposite of that, and behind a dialog it took a
 * close and an open per comparison.
 *
 * Photos and recordings are separate lists because they are separate things:
 * one has dimensions, the other has a duration, and a single list printing
 * "00:00" under every screenshot was how the old shared type showed through.
 *
 * The list scrolls in its own box, so a long session never sets the height of
 * the page.
 */

interface CaptureGalleryProps {
  snapshots: readonly Snapshot[]
  recordings: readonly Recording[]
  onRemoveSnapshot: (id: string) => void
  onRemoveRecording: (id: string) => void
  onClear: () => void
}

export function CaptureGallery({
  snapshots,
  recordings,
  onRemoveSnapshot,
  onRemoveRecording,
  onClear
}: CaptureGalleryProps) {
  const t = useTranslations("CameraRecorderPage.gallery")
  const format = useFormatter()

  const isEmpty = snapshots.length === 0 && recordings.length === 0

  return (
    <ToolCard
      title={t("title")}
      tone="muted"
      actions={
        isEmpty ? null : (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t("clearAll")}
          </Button>
        )
      }
      bodyClassName="p-0"
    >
      {isEmpty ? (
        <p className="px-5 py-8 text-center text-muted-foreground text-sm">
          {t("empty")}
        </p>
      ) : (
        <div className="max-h-[30rem] divide-y divide-border overflow-y-auto">
          {recordings.map((recording) => (
            <div key={recording.id} className="space-y-2 px-5 py-3">
              <Meta
                filename={recording.filename}
                detail={`${formatDuration(recording.duration)} · ${formatFileSize(recording.size)} · ${format.dateTime(recording.at, { timeStyle: "medium" })}`}
                url={recording.url}
                downloadLabel={t("download")}
                deleteLabel={t("delete")}
                onDelete={() => {
                  onRemoveRecording(recording.id)
                }}
              />
              {/* biome-ignore lint/a11y/useMediaCaption: a clip the visitor
                  recorded of themselves, seconds ago, on this device — there is
                  no caption track to supply and nobody who has not seen it. */}
              <video
                controls
                preload="metadata"
                src={recording.url}
                className="max-h-64 w-full rounded-lg bg-muted"
              />
            </div>
          ))}

          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="space-y-2 px-5 py-3">
              <Meta
                filename={snapshot.filename}
                detail={`${snapshot.width} × ${snapshot.height} · ${formatFileSize(snapshot.size)} · ${format.dateTime(snapshot.at, { timeStyle: "medium" })}`}
                url={snapshot.url}
                downloadLabel={t("download")}
                deleteLabel={t("delete")}
                onDelete={() => {
                  onRemoveSnapshot(snapshot.id)
                }}
              />
              {/* Not `next/image`: the source is a `blob:` URL created in this
                  tab a moment ago, so there is nothing for the optimiser to
                  fetch, resize or cache — it would only add a proxy hop to a
                  file that never leaves the browser. */}
              {/* biome-ignore lint/performance/noImgElement: a blob: URL from
                  this session; next/image cannot optimise what it cannot
                  fetch. */}
              <img
                src={snapshot.url}
                alt={t("snapshotAlt", {
                  time: format.dateTime(snapshot.at, { timeStyle: "medium" })
                })}
                className="max-h-64 w-full rounded-lg bg-muted object-contain"
              />
            </div>
          ))}
        </div>
      )}

      <p className="border-border border-t px-5 py-3 text-muted-foreground text-xs">
        {t("limit", { count: MAX_CAPTURES })}
      </p>
    </ToolCard>
  )
}

interface MetaProps {
  filename: string
  detail: string
  url: string
  downloadLabel: string
  deleteLabel: string
  onDelete: () => void
}

function Meta({
  filename,
  detail,
  url,
  downloadLabel,
  deleteLabel,
  onDelete
}: MetaProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-mono text-foreground text-sm">{filename}</p>
        <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
          {detail}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {/* A real anchor, so the browser's own download handling applies. The
            version this replaces built an `<a>` in JavaScript, appended it to
            the body, clicked it and removed it again, per download. */}
        <Button asChild variant="ghost" size="icon">
          <a href={url} download={filename} aria-label={downloadLabel}>
            <Download aria-hidden="true" className="size-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label={deleteLabel}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  )
}
