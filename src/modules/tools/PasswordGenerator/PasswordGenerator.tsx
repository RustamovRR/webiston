"use client"

import { useTranslations } from "next-intl"
import { ToolHeader, DualTextPanel } from "@/components/shared"
import { ConfigPanel, StrengthPanel, InfoSection } from "./components"
import { usePasswordGenerator } from "./hooks/usePasswordGenerator"

const PasswordGenerator = () => {
  const t = useTranslations("PasswordGeneratorPage.ToolHeader")
  const tInput = useTranslations("PasswordGeneratorPage.InputPanel")
  const tResults = useTranslations("PasswordGeneratorPage.ResultsPanel")
  const tTypes = useTranslations("PasswordGeneratorPage.PasswordTypes")
  const tPresets = useTranslations("PasswordGeneratorPage")
  const tStrength = useTranslations("PasswordGeneratorPage.StrengthLevels")

  const {
    password,
    showPassword,
    copied,
    settings,
    passwordDisplayText,
    passwordStrength,
    stats,
    presetSettings,
    generatePassword,
    handleCopy,
    downloadPassword,
    loadPreset,
    togglePasswordVisibility,
    updateSettings
  } = usePasswordGenerator(
    {
      onSuccess: (message) => console.log(message),
      onError: (error) => console.error(error)
    },
    tPresets,
    tStrength
  )

  const getCharacterTypes = () => {
    const types = []
    if (settings.includeUppercase) types.push("ABC")
    if (settings.includeLowercase) types.push("abc")
    if (settings.includeNumbers) types.push("123")
    if (settings.includeSymbols) types.push("!@#")
    return types.join("+") || "Hech qanday"
  }

  const getPasswordTypeText = () => {
    switch (settings.passwordType) {
      case "memorable":
        return tTypes("memorable")
      case "strong":
        return tTypes("strong")
      default:
        return tTypes("random")
    }
  }

  const passwordInfo = password
    ? `${tResults("success")}\n\n${tResults("length")} ${password.length} ${tResults("characters")}\n${tResults("type")} ${getPasswordTypeText()}\n${tResults("strength")} ${passwordStrength.text}\n${tResults("entropy")} ${stats.entropy} bit\n\n${tResults("characterTypes")} ${getCharacterTypes()}\n${tResults("uniqueChars")} ${stats.unique}/${stats.characters}`
    : ""

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      <ConfigPanel
        settings={settings}
        password={password}
        showPassword={showPassword}
        copied={copied}
        presetSettings={presetSettings}
        onUpdateSettings={updateSettings}
        onGeneratePassword={generatePassword}
        onTogglePasswordVisibility={togglePasswordVisibility}
        onCopy={handleCopy}
        onDownload={downloadPassword}
        onLoadPreset={(preset) => loadPreset(preset)}
      />

      <DualTextPanel
        sourceText={passwordDisplayText}
        convertedText={passwordInfo}
        sourceLabel={tInput("title")}
        targetLabel={tResults("title")}
        onSourceChange={() => {}} // Read-only
        sourcePlaceholder={tInput("placeholder")}
        onClear={() => {}}
        showSwapButton={false}
        showClearButton={false}
        variant="terminal"
        showShadow={true}
      />

      <StrengthPanel
        password={password}
        passwordStrength={passwordStrength}
        stats={stats}
      />

      <InfoSection />
    </div>
  )
}

export default PasswordGenerator
