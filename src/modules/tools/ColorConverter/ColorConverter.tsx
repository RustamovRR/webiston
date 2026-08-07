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
          {/* The cap is a guard, not a design choice. A sticky element taller
              than the space below its own `top` offset is PINNED with its
              bottom past the fold and there is no way to scroll to it.
              Measured at 1280×720: 640px available, 641px closed — and 881px
              with "Boshqa rang fazolari" open, which put the copy-link footer
              241px out of reach. Opening the disclosure is the only thing that
              can trip it on a normal window; the scroller earns its keep
              exactly then and never otherwise. */}
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
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
            /* A colour taken back OUT of the saved list is a read, not a new
               event, so it does not re-record. Recording moves the entry to
               the front of the history, which reorders the grid the click
               came from: measured, a swatch clicked at x=418 was at x=53 by
               the time the click finished, and the browser holds `:hover` on
               a moved node until the pointer moves again — so the badge sat
               lit on the first tile and went out on the next twitch. Leaving
               the saved order alone removes the cause, not the symptom. */
            onSavedSelect={setInputColor}
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
