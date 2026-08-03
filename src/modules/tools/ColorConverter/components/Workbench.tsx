"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { WORKBENCH_VIEWS } from "../constants"
import { useColorDraftStore } from "../stores/colorDraftStore"
import type { PaletteType, ShadeStep, WorkbenchView } from "../types"
import type { RampReadability } from "../utils/contrast"
import { ColorHistory } from "./ColorHistory"
import { GradientGenerator } from "./GradientGenerator"
import { PalettePanel } from "./PalettePanel"
import { ScalePanel } from "./ScalePanel"

/**
 * One card, four settings — the answer to "is this too long".
 *
 * Four full-width cards of identical weight read as four equal things, none of
 * which is the point; one card and four nouns says "one instrument, four
 * settings". Nothing is lost: every panel that used to be its own section is
 * here, whole.
 *
 * Every panel stays MOUNTED and the inactive ones carry `hidden`. Two reasons,
 * both load-bearing. The route publishes a `featureList` in its structured
 * data, and that list has to be true of the served HTML — this module has just
 * finished fixing exactly that class of defect twice. And `hidden` content is
 * still indexable and still reachable with the browser's own find, which
 * unmounted content is not.
 */

interface WorkbenchProps {
  shades: readonly ShadeStep[]
  baseColor: string
  ramp: RampReadability
  tokenName: string
  palettes: ReadonlyArray<{ type: PaletteType; colors: string[] }>
  /** A NEW pick — palette swatch. Records to history. */
  onColorSelect: (color: string) => void
  /** A colour taken back out of the saved list. Records nothing. */
  onSavedSelect: (color: string) => void
  historyVersion: number
  isValid: boolean
}

export function Workbench({
  shades,
  baseColor,
  ramp,
  tokenName,
  palettes,
  onColorSelect,
  onSavedSelect,
  historyVersion,
  isValid
}: WorkbenchProps) {
  const t = useTranslations("ColorConverterPage.Workbench")
  const view = useColorDraftStore((state) => state.view)
  const setView = useColorDraftStore((state) => state.setView)

  return (
    <ToolCard title={t("title")} bodyClassName="space-y-5 p-5">
      {/* The strip lives in the BODY, not in the card header's `actions` slot:
          that slot is `shrink-0`, so a four-option control that does not wrap
          forced the whole card wider than the viewport — measured 52px of
          horizontal document overflow at 375px. Here it scrolls in its own box
          and the card stays put. A mode switch also reads better directly above
          the thing it switches. */}
      <div className="min-w-0 overflow-x-auto">
        <SegmentedControl<WorkbenchView>
          label={t("title")}
          value={view}
          onChange={setView}
          options={WORKBENCH_VIEWS.map((option) => ({
            value: option,
            label: t(`views.${option}`)
          }))}
        />
      </div>

      <div hidden={view !== "scale"}>
        <ScalePanel
          baseColor={baseColor}
          shades={shades}
          ramp={ramp}
          tokenName={tokenName}
        />
      </div>
      <div hidden={view !== "palette"}>
        <PalettePanel palettes={palettes} onColorSelect={onColorSelect} />
      </div>
      <div hidden={view !== "gradient"}>
        <GradientGenerator baseColor={baseColor} isValid={isValid} />
      </div>
      <div hidden={view !== "saved"}>
        <ColorHistory
          onColorSelect={onSavedSelect}
          historyVersion={historyVersion}
        />
      </div>
    </ToolCard>
  )
}
