"use client"

/**
 * Password generator.
 *
 * Same architecture as the QR page, on purpose: the RESULT holds the first
 * screen with its actions on it, the settings scroll under it, and the
 * right-hand rail carries the measured facts (entropy, crack time) the way
 * the QR rail carries the code. The version this replaces printed the
 * password into a read-only textarea labelled "Tool Kirish" and pushed the
 * strength readout below the fold.
 */

import { useTranslations } from "next-intl"

import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  InfoSection,
  PasswordDisplay,
  SettingsPanel,
  StrengthMeter
} from "./components"
import { usePasswordGenerator } from "./hooks/usePasswordGenerator"

const PasswordGenerator = () => {
  const t = useTranslations("PasswordGeneratorPage")
  const {
    settings,
    password,
    error,
    show,
    copied,
    strength,
    uniqueCharacters,
    regenerate,
    updateSettings,
    toggleShow,
    copy
  } = usePasswordGenerator()

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* Three cells placed explicitly — the QR page's grid, for the QR
          page's reason: stacked, the order must be result → facts → controls;
          side by side, the facts hold the rail across both rows. */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="lg:col-start-1 lg:row-start-1">
          <PasswordDisplay
            password={password}
            errorText={error ? t(`Errors.${error}`) : undefined}
            show={show}
            copied={copied}
            onToggleShow={toggleShow}
            onCopy={copy}
            onRegenerate={regenerate}
          />
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <div className="lg:sticky lg:top-20">
            <StrengthMeter
              strength={strength}
              passwordLength={password.length}
              uniqueCharacters={uniqueCharacters}
            />
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <SettingsPanel settings={settings} onChange={updateSettings} />
        </div>
      </div>

      <InfoSection />
    </div>
  )
}

export default PasswordGenerator
export { PasswordGenerator }
