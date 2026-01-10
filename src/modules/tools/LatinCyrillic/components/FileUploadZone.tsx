"use client"

/**
 * File Upload Zone Component
 * Drag & drop or click to upload TXT, PDF, DOCX files
 */

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileType,
  Upload
} from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib"

import type { FileProcessingStatus, ProcessingProgress } from "../types"

interface FileUploadZoneProps {
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
  className?: string
}

export function FileUploadZone({
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
  onDrop,
  className
}: FileUploadZoneProps) {
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

  // Circular progress component
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const circumference = 2 * Math.PI * 18
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-zinc-200 dark:text-zinc-700"
          />
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-300"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {percentage}%
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-all duration-200",
        isDragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600",
        status === "error" && "border-red-500 bg-red-500/10",
        status === "success" && "border-green-500 bg-green-500/10",
        isProcessing && "pointer-events-none",
        className
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />

      <div className="flex flex-col items-center justify-center gap-3 text-center">
        {/* Icon based on status */}
        {status === "error" ? (
          <AlertCircle className="h-12 w-12 text-red-500" />
        ) : status === "success" ? (
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        ) : isProcessing ? (
          <CircularProgress percentage={progress.percentage} />
        ) : isDragging ? (
          <FileType className="h-12 w-12 text-blue-500" />
        ) : (
          <Upload className="h-12 w-12 text-zinc-400" />
        )}

        {/* Status text */}
        {error ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-500">Xatolik!</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : status === "success" && fileName ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Muvaffaqiyatli yuklandi!
            </p>
            <p className="text-xs text-zinc-500">{fileName}</p>
          </div>
        ) : isProcessing ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {progress.statusKey || "Yuklanmoqda..."}
            </p>
            {progress.total > 0 && progress.current > 0 && (
              <p className="text-xs text-zinc-500">
                {progress.current} / {progress.total}
              </p>
            )}
          </div>
        ) : isDragging ? (
          <p className="text-sm font-medium text-blue-500">
            Faylni shu yerga tashlang
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Faylni shu yerga tashlang yoki
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isProcessing}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Fayl tanlash
            </Button>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                .txt
              </span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                .pdf
              </span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                .docx
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span>max 10MB</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
