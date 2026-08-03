"use client"

/**
 * Colour converter, palette generator and contrast checker.
 *
 * The version this replaces was not too LONG — it was too FLAT: nine bordered
 * cards of identical weight in one column, so nothing on the page said "this
 * is the point and that is the depth". Measured, the consequences were real
 * rather than aesthetic: a toolbar controlling cards ~900px below it, and the
 * converted values — the reason most visitors arrive — scrolling off the top at
 * the exact moment a click changed them. On a 375×812 phone the RGB row sat at
 * y=1,465, 1.8 screens down.
 *
 * Three weights now, the same three the QR generator has: controls, a pinned
 * answer, and one workbench underneath. For a QR code the input and the result
 * are two objects; for a colour they are ONE, which is why what gets pinned
 * here is the VALUES and not the picker.
 */

import { useTranslations } from "next-intl"

import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  ColorControls,
  ColorSummary,
  ContrastPanel,
  Workbench
} from "./components"
import { DEFAULT_COLOR } from "./constants"
import { useColorConverter } from "./hooks/useColorConverter"

const ColorConverter = () => {
  const t = useTranslations("ColorConverterPage")
  const {
    inputColor,
    setInputColor,
    chooseColor,
    recordCurrent,
    setOpacity,
    colorFormats,
    contrast,
    palettes,
    tailwindShades,
    rampReadability,
    passingShade,
    historyVersion,
    isValid,
    colorName,
    tokenName
  } = useColorConverter()

  const baseColor = colorFormats?.hexOpaque ?? DEFAULT_COLOR

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* The QrGenerator recipe verbatim: `row-span` over a taller left column
          is what gives the sticky element travel — a cell collapsed to its own
          content height has nowhere to stick. `grid-cols-1` on mobile is
          load-bearing too: without an explicit track the single implicit column
          sizes to content and the document scrolls sideways. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="lg:col-start-1 lg:row-start-1">
          <ColorControls
            inputColor={inputColor}
            colorFormats={colorFormats}
            onInput={setInputColor}
            onChoose={chooseColor}
            onCommit={recordCurrent}
            onOpacityChange={setOpacity}
          />
        </div>

        {/* Second in the DOM, so on a phone the answer lands immediately under
            the input instead of below three generators. */}
        <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-stretch">
          <div className="lg:sticky lg:top-20">
            <ColorSummary
              colorFormats={colorFormats}
              colorName={colorName}
              contrast={contrast}
            />
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <Workbench
            shades={tailwindShades}
            baseColor={baseColor}
            ramp={rampReadability}
            tokenName={tokenName}
            palettes={palettes}
            onColorSelect={chooseColor}
            historyVersion={historyVersion}
            isValid={isValid}
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-3">
          <ContrastPanel
            contrast={contrast}
            color={colorFormats?.hex ?? DEFAULT_COLOR}
            passingShade={passingShade}
            onAdoptShade={chooseColor}
          />
        </div>
      </div>
    </div>
  )
}

export default ColorConverter
export { ColorConverter }
