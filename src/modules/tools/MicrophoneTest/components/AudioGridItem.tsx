"use client"

import { motion } from "framer-motion"
import { Download, Play, Trash2, Volume2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { formatDuration, formatFileSize } from "@/lib/utils/format"
import type { RecordedAudio } from "../hooks/useMicrophoneTest"

interface AudioGridItemProps {
  audio: RecordedAudio
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

export function AudioGridItem({
  audio,
  onPreview,
  onDownload,
  onDelete
}: AudioGridItemProps) {
  const t = useTranslations("MicrophoneTestPage.RecordedAudioPanel")
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-card"
    >
      {/* Audio Info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15">
            <Volume2 className="h-5 w-5 text-info" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {audio.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(audio.duration)} • {formatFileSize(audio.size)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreview}
            className="flex-1 border-border hover:bg-muted"
          >
            <Play className="mr-1 h-3 w-3" />
            {t("actions.preview")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
            className="border-border hover:bg-muted"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Format badge */}
      <div className="absolute top-2 right-2">
        <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {audio.format}
        </span>
      </div>
    </motion.div>
  )
}
