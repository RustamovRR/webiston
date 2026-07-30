/** Shared QR types. Previously declared in the hook, with `QrCustomization`
 *  ALSO exported from QrCustomizationPanel.tsx — two exported definitions of
 *  one concept, which is exactly how `MetaData` drifted elsewhere. */

export type QrSize = 150 | 200 | 300 | 400
export type QrErrorLevel = "L" | "M" | "Q" | "H"

export interface QrPreset {
  label: string
  value: string
  description: string
  category: "url" | "contact" | "text" | "wifi" | "sms"
}

export interface QrCustomization {
  foregroundColor: string
  backgroundColor: string
  logo?: string
  logoSize: number
  cornerStyle: "square" | "rounded" | "extraRounded" | "circle"
  patternStyle: "square" | "circle" | "rounded" | "diamond"
  margin: number
  borderRadius: number
  gradientEnabled: boolean
  gradientDirection: "horizontal" | "vertical" | "diagonal" | "radial"
  gradientEndColor?: string
}
