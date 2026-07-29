import { Circle, Download, Palette, RefreshCw, Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"
import { GradientTabs, ShimmerButton } from "@/components/ui"

interface ControlPanelProps {
  paletteType: "monochromatic" | "analogous" | "complementary"
  setPaletteType: (
    type: "monochromatic" | "analogous" | "complementary"
  ) => void
  onRandomColor: () => void
  onDownloadPalette: () => void
  isValid: boolean
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  paletteType,
  setPaletteType,
  onRandomColor,
  onDownloadPalette,
  isValid
}) => {
  const t = useTranslations("ColorConverterPage.ControlPanel")

  const paletteOptions = [
    {
      value: "monochromatic",
      label: t("monochromatic") || "Monoxromatik",
      icon: <Circle size={16} className="text-info" />
    },
    {
      value: "analogous",
      label: t("analogous") || "Analogik",
      icon: <Palette size={16} className="text-success" />
    },
    {
      value: "complementary",
      label: t("complementary") || "Komplementar",
      icon: <Zap size={16} className="text-purple-500 dark:text-purple-400" />
    }
  ]

  return (
    <div className="mb-6 rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("paletteType") || "Palette turi:"}
          </span>

          <GradientTabs
            options={paletteOptions}
            value={paletteType}
            onChange={(value) =>
              setPaletteType(
                value as "monochromatic" | "analogous" | "complementary"
              )
            }
          />

          <ShimmerButton
            onClick={onRandomColor}
            variant="outline"
            size="sm"
            className="border-input border !bg-white text-zinc-700 hover:bg-muted hover:text-foreground dark:border-none dark:!bg-zinc-800 dark:text-zinc-300"
          >
            <RefreshCw size={16} className="mr-2" />
            {t("randomColor") || "Tasodifiy rang"}
          </ShimmerButton>
        </div>

        <div className="flex items-center gap-2">
          {isValid && (
            <ShimmerButton
              onClick={onDownloadPalette}
              variant="outline"
              size="sm"
              className="border-input border !bg-white text-zinc-700 hover:bg-muted hover:text-foreground dark:border-none dark:!bg-zinc-800 dark:text-zinc-300"
            >
              <Download size={16} className="mr-2" />
              {t("downloadPalette") || "Palette yuklab olish"}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
