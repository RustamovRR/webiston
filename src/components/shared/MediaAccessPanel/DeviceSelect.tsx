"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@webiston/ui/primitives/select"
import { useTranslations } from "next-intl"
import { useId } from "react"

import type { MediaAccessDevice } from "@/hooks/useMediaAccess"

/**
 * Choosing which camera or microphone to use.
 *
 * Shared, because both tools need the same control and both had built it with
 * the same two mistakes.
 *
 * **Labels are shown verbatim.** The microphone tool used to rewrite them —
 * `Microphone` to `Mic`, `Default - ` stripped, then a hard cut at 32
 * characters plus an ellipsis. The name in our dropdown then no longer matched
 * the name in the system sound settings the visitor was about to go and change,
 * which is the one place the name has to match.
 *
 * **An unlabelled device gets a position, not a hash.** Before permission is
 * granted the spec gives every label as an empty string, and the old fallback
 * printed eight characters of the opaque device id. "Microphone 2" at least
 * counts; `Device a1b2c3d4` describes nothing.
 */

interface DeviceSelectProps {
  devices: readonly MediaAccessDevice[]
  value: string | null
  onChange: (deviceId: string) => void
  /** Selects the wording for the label and the unnamed-device fallback. */
  kind: "camera" | "microphone"
  disabled?: boolean
}

export function DeviceSelect({
  devices,
  value,
  onChange,
  kind,
  disabled
}: DeviceSelectProps) {
  const t = useTranslations("Common.media")
  const labelId = useId()

  if (devices.length === 0) return null

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span id={labelId} className="shrink-0 text-muted-foreground text-sm">
        {t(`deviceLabel.${kind}`)}
      </span>
      <Select
        value={value ?? undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          className="min-w-0 max-w-[22rem] flex-1"
        >
          <SelectValue placeholder={t(`deviceLabel.${kind}`)} />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device, index) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label || t(`unnamedDevice.${kind}`, { index: index + 1 })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
