"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Trash2, Volume2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { RecordedAudio } from "../hooks/useMicrophoneTest"
import { AudioGridItem } from "./AudioGridItem"

interface RecordedAudioPanelProps {
  recordedAudios: RecordedAudio[]
  onPreview: (audio: RecordedAudio) => void
  onDownload: (audio: RecordedAudio) => void
  onDelete: (audioId: string) => void
  onClearAll: () => void
}

export function RecordedAudioPanel({
  recordedAudios,
  onPreview,
  onDownload,
  onDelete,
  onClearAll
}: RecordedAudioPanelProps) {
  const t = useTranslations("MicrophoneTestPage.RecordedAudioPanel")

  return (
    <div className="flex h-[600px] max-h-[600px] flex-col rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-foreground">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-muted-foreground">
              {recordedAudios.length} {t("fileCount")}
            </span>
          </div>
          {recordedAudios.length > 0 && (
            <Button
              onClick={onClearAll}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {t("buttons.clearAll")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <div className="flex-1 overflow-y-auto pr-2">
          <AnimatePresence>
            {recordedAudios.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-64 items-center justify-center text-muted-foreground"
              >
                <div className="text-center">
                  <Volume2 className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p className="text-lg font-medium">{t("empty.title")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("empty.subtitle")}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {recordedAudios.map((audio) => (
                  <AudioGridItem
                    key={audio.id}
                    audio={audio}
                    onPreview={() => onPreview(audio)}
                    onDownload={() => onDownload(audio)}
                    onDelete={() => onDelete(audio.id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats - Always at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg bg-muted/50 p-3"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">
                {t("stats.totalAudios")}:
              </span>
              <span className="ml-2 text-info">{recordedAudios.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("stats.totalSize")}:
              </span>
              <span className="ml-2 text-success">
                {Math.round(
                  recordedAudios.reduce((acc, audio) => acc + audio.size, 0) /
                    1024
                )}{" "}
                KB
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
