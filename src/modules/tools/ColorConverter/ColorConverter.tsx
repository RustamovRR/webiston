"use client"

/**
 * Colour converter and palette generator.
 *
 * Brought onto the suite's footing: `max-w-[1536px]` so the content edge
 * meets the header like every other tool, one toolbar row instead of a card
 * wrapped around two groups, `SegmentedControl` for the palette type the way
 * every tool switches modes, and semantic tokens throughout. The ambient
 * glow layers that used to wrap the input card are gone — card interiors
 * stay plain; the colour itself is the decoration here.
 */

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Download, Shuffle } from "lucide-react"
import { useTranslations } from "next-intl"

import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  ColorFormatsPanel,
  ColorHistory,
  ColorInputPanel,
  ColorPalette,
  GradientGenerator,
  InfoSection,
  TailwindShades
} from "./components"
import { DEFAULT_COLOR, PALETTE_TYPES, type PaletteType } from "./constants"
import { useColorConverter } from "./hooks/useColorConverter"

const ColorConverter = () => {
  const t = useTranslations("ColorConverterPage")
  const {
    inputColor,
    setInputColor,
    chooseColor,
    recordCurrent,
    paletteType,
    setPaletteType,
    colorFormats,
    palette,
    tailwindShades,
    historyVersion,
    isValid,
    colorName
  } = useColorConverter()

  const randomColor = () => {
    // Math.random is fine here — a colour suggestion is not a secret.
    const hex = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`
    chooseColor(hex)
  }

  const downloadPalette = () => {
    if (!colorFormats) return
    const payload = {
      baseColor: colorFormats.hex,
      type: paletteType,
      colors: palette,
      shades: tailwindShades
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `webiston-palette-${paletteType}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    requestAnimationFrame(() => URL.revokeObjectURL(url))
  }

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* One toolbar row: palette mode on the left, the two actions right. */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SegmentedControl<PaletteType>
          label={t("ControlPanel.paletteType")}
          value={paletteType}
          onChange={setPaletteType}
          options={PALETTE_TYPES.map((type) => ({
            value: type,
            label: t(`ControlPanel.${type}`)
          }))}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={randomColor}
          >
            <Shuffle aria-hidden="true" />
            {t("ControlPanel.randomColor")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isValid}
            onClick={downloadPalette}
          >
            <Download aria-hidden="true" />
            {t("ControlPanel.downloadPalette")}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ColorInputPanel
          inputColor={inputColor}
          colorFormats={colorFormats}
          colorName={colorName}
          onInput={setInputColor}
          onChoose={chooseColor}
          onCommit={recordCurrent}
        />
        <ColorFormatsPanel colorFormats={colorFormats} />
      </div>

      <ColorPalette
        palette={palette}
        paletteType={paletteType}
        onColorSelect={chooseColor}
      />

      <TailwindShades
        baseColor={colorFormats?.hex ?? inputColor}
        shades={tailwindShades}
        isValid={isValid}
      />

      <GradientGenerator
        baseColor={colorFormats ? colorFormats.hex.slice(0, 7) : DEFAULT_COLOR}
        isValid={isValid}
      />

      <ColorHistory
        onColorSelect={chooseColor}
        historyVersion={historyVersion}
      />

      <InfoSection />
    </div>
  )
}

export default ColorConverter
export { ColorConverter }
