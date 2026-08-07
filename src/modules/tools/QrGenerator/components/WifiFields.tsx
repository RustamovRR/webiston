"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Input } from "@webiston/ui/primitives/input"
import { useTranslations } from "next-intl"

import type { WifiConfig, WifiSecurity } from "../utils/wifi"

/**
 * The WiFi form — three fields and a flag, nothing more. It compiles to the
 * WIFI: payload in `utils/wifi.ts`; this component never sees the format.
 *
 * The password is a plain text field on purpose: it is about to be printed
 * into a QR code hung on a wall. Masking it here would be theatre, and it
 * stays in memory only (see the draft store).
 */

interface WifiFieldsProps {
  wifi: WifiConfig
  onChange: (patch: Partial<WifiConfig>) => void
}

const SECURITY_OPTIONS: readonly WifiSecurity[] = ["WPA", "WEP", "nopass"]

export function WifiFields({ wifi, onChange }: WifiFieldsProps) {
  const t = useTranslations("QrGeneratorPage.InputPanel.wifi")

  return (
    <div className="space-y-4">
      {/* `htmlFor`, not a wrapping label: `Input` is a component, so the
          linter cannot see the control inside — same note as StylePanel. */}
      <div className="text-sm">
        <label htmlFor="qr-wifi-ssid" className="block text-muted-foreground">
          {t("ssid")}
        </label>
        <Input
          id="qr-wifi-ssid"
          value={wifi.ssid}
          onChange={(event) => onChange({ ssid: event.target.value })}
          placeholder={t("ssidPlaceholder")}
          className="mt-1.5"
          autoComplete="off"
        />
      </div>

      <SegmentedControl<WifiSecurity>
        label={t("security")}
        value={wifi.security}
        onChange={(security) => onChange({ security })}
        options={SECURITY_OPTIONS.map((option) => ({
          value: option,
          label: option === "nopass" ? t("open") : option
        }))}
      />

      {wifi.security !== "nopass" && (
        <div className="text-sm">
          <label
            htmlFor="qr-wifi-password"
            className="block text-muted-foreground"
          >
            {t("password")}
          </label>
          <Input
            id="qr-wifi-password"
            value={wifi.password}
            onChange={(event) => onChange({ password: event.target.value })}
            className="mt-1.5 font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={wifi.hidden}
          onChange={(event) => onChange({ hidden: event.target.checked })}
          className="size-4 accent-primary"
        />
        <span className="text-foreground">{t("hidden")}</span>
      </label>
    </div>
  )
}
