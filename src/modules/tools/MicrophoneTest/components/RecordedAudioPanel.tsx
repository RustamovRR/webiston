"use client"

import { Volume2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { AudioGridItem } from "./AudioGridItem"
import { RecordedAudio } from "../hooks/useMicrophoneTest"

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
    <div className="flex h-[600px] max-h-[600px] flex-col rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              {recordedAudios.length} {t("fileCount")}
            </span>
          </div>
          {recordedAudios.length > 0 && (
            <Button
              onClick={onClearAll}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
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
                className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400"
              >
                <div className="text-center">
                  <Volume2 className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p className="text-lg font-medium">{t("empty.title")}</p>
                  <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
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
          className="mt-4 rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/50"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">
                {t("stats.totalAudios")}:
              </span>
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                {recordedAudios.length}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">
                {t("stats.totalSize")}:
              </span>
              <span className="ml-2 text-green-600 dark:text-green-400">
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
