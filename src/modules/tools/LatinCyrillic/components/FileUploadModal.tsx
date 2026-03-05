"use client"

/**
 * File Upload Modal Component
 * Professional modal for file upload with smooth progress tracking
 * Uses Framer Motion for animations
 */

import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileType,
  Loader2,
  Upload
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"

import {
  BaseModal,
  BaseModalBody,
  BaseModalDescription,
  BaseModalFooter,
  BaseModalHeader,
  BaseModalTitle
} from "@/components/shared/BaseModal"
import { ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"

import type { FileProcessingStatus, ProcessingProgress } from "../types"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File) => void
  isDragging: boolean
  isProcessing: boolean
  status: FileProcessingStatus
  progress: ProcessingProgress
  error: string | null
  fileName: string | null
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

// Smooth linear progress bar with Framer Motion
function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{percentage}%</span>
        <motion.div
          className="flex items-center gap-1 text-blue-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing...</span>
        </motion.div>
      </div>
    </div>
  )
}

export function FileUploadModal({
  isOpen,
  onClose,
  onFileSelect,
  isDragging,
  isProcessing,
  status,
  progress,
  error,
  fileName,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}: FileUploadModalProps) {
  const t = useTranslations("LatinCyrillicPage.fileUpload")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    e.target.value = ""
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  // Get translated progress status
  const getProgressStatus = () => {
    if (!progress.statusKey) return ""

    if (progress.statusKey === "readingPage") {
      return t("progress.readingPage", {
        current: progress.current,
        total: progress.total
      })
    }

    return t(`progress.${progress.statusKey}`)
  }

  // Get translated error message
  const getErrorMessage = () => {
    if (!error) return ""
    return t(`errors.${error}`)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      closeOnOverlayClick={!isProcessing}
    >
      <BaseModalHeader>
        <BaseModalTitle>{t("modalTitle")}</BaseModalTitle>
        <BaseModalDescription>{t("modalDescription")}</BaseModalDescription>
      </BaseModalHeader>

      <BaseModalBody>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {/* Upload Zone */}
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed p-8 transition-all duration-200",
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600",
            status === "error" && "border-red-500 bg-red-500/10",
            status === "success" && "border-green-500 bg-green-500/10",
            isProcessing && "pointer-events-none"
          )}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {/* Icon based on status */}
            {status === "error" ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : status === "success" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-12 w-12 items-center justify-center"
              >
                <FileText className="h-10 w-10 text-blue-500" />
              </motion.div>
            ) : isDragging ? (
              <FileType className="h-12 w-12 text-blue-500" />
            ) : (
              <Upload className="h-12 w-12 text-zinc-400" />
            )}

            {/* Status content */}
            {error ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-500">{t("error")}</p>
                <p className="text-xs text-red-400">{getErrorMessage()}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  className="mt-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t("retry")}
                </Button>
              </div>
            ) : status === "success" && fileName ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t("success")}
                </p>
                <p className="max-w-xs truncate text-xs text-zinc-500">
                  {fileName}
                </p>
              </motion.div>
            ) : isProcessing ? (
              <div className="w-full max-w-xs space-y-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {getProgressStatus()}
                </p>
                <ProgressBar percentage={progress.percentage} />
                {progress.statusKey === "readingPage" && progress.total > 0 && (
                  <p className="text-xs text-zinc-500">
                    {t("progress.pageCount", {
                      current: progress.current,
                      total: progress.total
                    })}
                  </p>
                )}
              </div>
            ) : isDragging ? (
              <p className="text-sm font-medium text-blue-500">
                {t("dropzone")}
              </p>
            ) : (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("dropzone")}
                </p>
                <ShimmerButton onClick={handleClick} disabled={isProcessing}>
                  <FileText className="mr-2 h-4 w-4" />
                  {t("selectFile")}
                </ShimmerButton>
              </>
            )}
          </div>
        </div>

        {/* Supported formats */}
        {!isProcessing && status !== "success" && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
            <span>{t("supportedFormats")}:</span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono dark:bg-zinc-800">
                .txt
              </span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono dark:bg-zinc-800">
                .pdf
              </span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono dark:bg-zinc-800">
                .docx
              </span>
            </div>
            <span className="text-zinc-400">•</span>
            <span>{t("maxSize")} 200MB</span>
          </div>
        )}
      </BaseModalBody>

      <BaseModalFooter>
        {status === "success" ? (
          <ShimmerButton onClick={handleClose}>{t("close")}</ShimmerButton>
        ) : (
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {isProcessing ? t("cancel") : t("close")}
          </Button>
        )}
      </BaseModalFooter>
    </BaseModal>
  )
}
