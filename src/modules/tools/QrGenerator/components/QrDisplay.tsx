import React, { useState } from "react"
import { Copy, Check, Download, Eye } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"
import { QrSize, QrErrorLevel } from "../hooks/useQrGenerator"

import type { QrCustomization } from "../hooks/useQrGenerator"
import Image from "next/image"

interface QrDisplayProps {
  qrUrl: string
  qrSize: QrSize
  errorLevel: QrErrorLevel
  inputType: string
  inputText: string
  customization?: QrCustomization
  stats: {
    characters: number
    words: number
    lines: number
  }
  onDownload: () => void
}

const QrDisplay: React.FC<QrDisplayProps> = ({
  qrUrl,
  qrSize,
  errorLevel,
  inputType,
  inputText,
  customization,
  stats,
  onDownload
}) => {
  const t = useTranslations("QrGeneratorPage.QrDisplay")
  const tDataTypes = useTranslations("QrGeneratorPage.DataTypes")

  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  if (!qrUrl) return null

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(inputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
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
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("status")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div
            className="rounded-lg border border-zinc-300 bg-zinc-100/30 p-4 dark:border-zinc-700 dark:bg-zinc-800/30"
            style={{
              backgroundColor: customization?.backgroundColor || "#ffffff",
              borderRadius: customization?.borderRadius
                ? `${customization.borderRadius}px`
                : "8px"
            }}
          >
            <div className="relative">
              <Image
                src={qrUrl}
                alt="Generated QR Code"
                width={300}
                height={300}
                className="mx-auto max-w-full"
                style={{
                  maxWidth: "300px",
                  height: "auto",
                  borderRadius: customization?.borderRadius
                    ? `${customization.borderRadius * 0.5}px`
                    : "4px"
                }}
              />

              {/* Logo Overlay */}
              {customization?.logo && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-1 shadow-lg"
                  style={{
                    width: `${customization.logoSize}%`,
                    height: `${customization.logoSize}%`
                  }}
                >
                  <Image
                    src={customization.logo}
                    alt="QR Logo"
                    width={100}
                    height={100}
                    className="h-full w-full rounded object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-3 text-center">
              <div className="text-xs text-zinc-600 dark:text-zinc-500">
                {qrSize}x{qrSize} pixels • {errorLevel} xato tuzatish •{" "}
                {inputType}
              </div>

              {/* Customization Info */}
              {customization && (
                <div className="mt-2 flex justify-center gap-2 text-xs">
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      backgroundColor: customization.foregroundColor + "20",
                      color: customization.foregroundColor
                    }}
                  >
                    {customization.gradientEnabled ? "Gradient" : "Solid"}
                  </span>
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      backgroundColor:
                        customization.backgroundColor === "#ffffff"
                          ? "#f3f4f6"
                          : customization.backgroundColor + "40",
                      color:
                        customization.backgroundColor === "#ffffff"
                          ? "#374151"
                          : customization.backgroundColor
                    }}
                  >
                    {customization.cornerStyle}
                  </span>
                  {customization.logo && (
                    <span
                      style={{
                        backgroundColor: customization.foregroundColor + "20",
                        color: customization.foregroundColor
                      }}
                      className="rounded px-2 py-1"
                    >
                      Logo
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2 flex justify-center gap-2 text-xs">
                <span className="rounded bg-zinc-300 px-2 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  {stats.characters} {t("stats.characters")}
                </span>
                <span className="rounded bg-zinc-300 px-2 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  {stats.words} {t("stats.words")}
                </span>
                <span className="rounded bg-zinc-300 px-2 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  {stats.lines} {t("stats.lines")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview & Actions */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-300 bg-zinc-100/30 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("contentTitle")}
              </h4>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="ghost"
                size="sm"
                className="h-6 px-2"
              >
                <Eye size={14} className="mr-1" />
                {showPreview ? t("hideContent") : t("showContent")}
              </Button>
            </div>

            {showPreview && (
              <div className="rounded bg-zinc-200/50 p-3 dark:bg-zinc-800/50">
                <pre className="text-xs break-all whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                  {inputText}
                </pre>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleCopyText}
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  copied &&
                    "border-green-500 bg-green-500/10 text-green-600 dark:border-green-400 dark:bg-green-400/10 dark:text-green-400"
                )}
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    {t("copyText")}
                  </>
                )}
              </Button>

              <Button
                onClick={onDownload}
                variant="default"
                size="sm"
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Download size={14} className="mr-1" />
                {t("downloadQr")}
              </Button>
            </div>
          </div>

          {/* QR Info */}
          <div className="rounded-lg border border-zinc-300 bg-zinc-100/30 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("technicalInfo")}
            </h4>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>{t("format")}</span>
                <span className="font-mono">PNG</span>
              </div>
              <div className="flex justify-between">
                <span>{t("size")}</span>
                <span className="font-mono">
                  {qrSize}x{qrSize}px
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("errorCorrection")}</span>
                <span className="font-mono">{errorLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("dataType")}</span>
                <span className="font-mono">
                  {tDataTypes(inputType.toLowerCase())}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("margin")}</span>
                <span className="font-mono">10px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrDisplay
