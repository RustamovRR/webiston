"use client"

/**
 * File Upload Modal Component
 * Professional modal for file upload with progress tracking
 * Uses BaseModal for consistent animations
 */

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileType,
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

    // Handle page progress with interpolation
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

  // Circular progress component
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const circumference = 2 * Math.PI * 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" aria-hidden="true">
          <title>Progress</title>
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-200 dark:text-zinc-700"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-300"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {percentage}%
        </span>
      </div>
    )
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
            "relative rounded-lg border-2 border-dashed p-10 transition-all duration-200",
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
              <AlertCircle className="h-16 w-16 text-red-500" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : isProcessing ? (
              <CircularProgress percentage={progress.percentage} />
            ) : isDragging ? (
              <FileType className="h-16 w-16 text-blue-500" />
            ) : (
              <Upload className="h-16 w-16 text-zinc-400" />
            )}

            {/* Status text */}
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
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t("success")}
                </p>
                <p className="text-xs text-zinc-500">{fileName}</p>
              </div>
            ) : isProcessing ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {getProgressStatus()}
                </p>
                {progress.total > 0 && progress.statusKey === "readingPage" && (
                  <p className="text-xs text-zinc-500">
                    {progress.current} / {progress.total}
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
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-500">
            <span>{t("supportedFormats")}:</span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-zinc-100 px-2 py-1 font-mono dark:bg-zinc-800">
                .txt
              </span>
              <span className="rounded bg-zinc-100 px-2 py-1 font-mono dark:bg-zinc-800">
                .pdf
              </span>
              <span className="rounded bg-zinc-100 px-2 py-1 font-mono dark:bg-zinc-800">
                .docx
              </span>
            </div>
            <span className="text-zinc-400">|</span>
            <span>{t("maxSize")} 10MB</span>
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
