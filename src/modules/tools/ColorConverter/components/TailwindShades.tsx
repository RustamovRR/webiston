import React from "react"
import { useTranslations } from "next-intl"
import { Copy, Check } from "lucide-react"
import { TerminalInput } from "@/components/shared/TerminalInput"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"

interface TailwindShadesProps {
  baseColor: string
  shades: Array<{
    shade: number
    hex: string
    rgb: string
    hsl: string
  }>
  isValid: boolean
}

const TailwindShades: React.FC<TailwindShadesProps> = ({
  baseColor,
  shades,
  isValid
}) => {
  const t = useTranslations("ColorConverterPage.TailwindShades")
  const [copiedShade, setCopiedShade] = React.useState<number | null>(null)
  const [copiedExport, setCopiedExport] = React.useState<string | null>(null)

  const copyToClipboard = async (text: string, shade: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedShade(shade)
      setTimeout(() => setCopiedShade(null), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const copyExportToClipboard = async (text: string, exportType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedExport(exportType)
      setTimeout(() => setCopiedExport(null), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const customContent = (
    <div className="p-4">
      {isValid && shades.length > 0 ? (
        <div className="space-y-4">
          {/* Tailwind-style shade grid */}
          <div className="grid grid-cols-11 gap-2">
            {shades.map(({ shade, hex }) => (
              <div
                key={shade}
                className="group relative cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => copyToClipboard(hex, shade)}
              >
                {/* Color square */}
                <div
                  className="aspect-square w-full rounded-lg border-2 border-zinc-200 shadow-sm transition-all duration-200 group-hover:border-zinc-400 group-hover:shadow-lg dark:border-zinc-700 dark:group-hover:border-zinc-500"
                  style={{ backgroundColor: hex }}
                  title={`Copy ${hex}`}
                />

                {/* Copy feedback overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  {copiedShade === shade ? (
                    <div className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
                      <Check size={12} />
                      Copied!
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white shadow-lg">
                      <Copy size={12} />
                      Copy
                    </div>
                  )}
                </div>

                {/* Shade number */}
                <div className="mt-2 text-center">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {shade}
                  </span>
                </div>

                {/* Hex code */}
                <div className="mt-1 text-center">
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {hex}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Export options */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("exportOptions") || "Export variantlari:"}
            </h4>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {/* CSS Custom Properties */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cssVars = shades
                    .map(
                      ({ shade, hex }) => `  --color-primary-${shade}: ${hex};`
                    )
                    .join("\n")
                  copyExportToClipboard(`:root {\n${cssVars}\n}`, "css")
                }}
                className="cursor-pointer justify-start text-left"
              >
                {copiedExport === "css" ? (
                  <Check size={14} className="mr-2 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-2" />
                )}
                CSS Variables
              </Button>

              {/* Tailwind Config */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tailwindConfig = shades
                    .map(({ shade, hex }) => `        '${shade}': '${hex}',`)
                    .join("\n")
                  copyExportToClipboard(
                    `      primary: {\n${tailwindConfig}\n      },`,
                    "tailwind"
                  )
                }}
                className="cursor-pointer justify-start text-left"
              >
                {copiedExport === "tailwind" ? (
                  <Check size={14} className="mr-2 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-2" />
                )}
                Tailwind Config
              </Button>

              {/* SCSS Variables */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const scssVars = shades
                    .map(({ shade, hex }) => `$primary-${shade}: ${hex};`)
                    .join("\n")
                  copyExportToClipboard(scssVars, "scss")
                }}
                className="cursor-pointer justify-start text-left"
              >
                {copiedExport === "scss" ? (
                  <Check size={14} className="mr-2 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-2" />
                )}
                SCSS Variables
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-zinc-500 dark:text-zinc-400">
          <p className="text-sm">
            {t("noValidColor") || "To'g'ri rang kiriting"}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <TerminalInput
      title={t("title") || "Tailwind Shades"}
      subtitle={isValid ? `Base: ${baseColor}` : undefined}
      customContent={customContent}
      variant={isValid ? "success" : "error"}
      showShadow={true}
      animate={true}
    />
  )
}

export default TailwindShades
