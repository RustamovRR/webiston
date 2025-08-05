import { useState, useMemo, useCallback } from 'react'
import { getColorByName } from '@/constants/color-names'
import {
  parseColorInput,
  isValidColor,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  rgbToLab,
  labToLch,
  rgbToOklab,
  oklabToOklch,
  generateTailwindShades,
  generatePalette,
  isValidHex,
  addToColorHistory,
} from '@/lib/utils'

export interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  rgba: string
  hsla: string
  lab: string
  lch: string
  oklab: string
  oklch: string
  rgbValues: { r: number; g: number; b: number; a: number }
  hslValues: { h: number; s: number; l: number; a: number }
  labValues: { l: number; a: number; b: number }
  lchValues: { l: number; c: number; h: number }
  oklabValues: { l: number; a: number; b: number }
  oklchValues: { l: number; c: number; h: number }
  opacity: number
  isValid: boolean
}

interface UseColorConverterProps {
  initialColor?: string
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useColorConverter = ({ initialColor = '#3b82f6', onSuccess, onError }: UseColorConverterProps = {}) => {
  const [inputColor, setInputColorState] = useState(initialColor)

  // Enhanced setInputColor with history tracking
  const setInputColor = useCallback((color: string) => {
    setInputColorState(color)
    // Add to history if it's a valid color
    if (parseColorInput(color)) {
      addToColorHistory(color)
    }
  }, [])

  // Main color formats calculation
  const colorFormats = useMemo((): ColorFormats | null => {
    try {
      // Parse input using universal parser
      const parsedColor = parseColorInput(inputColor)

      if (!parsedColor) {
        onError?.("Noto'g'ri rang formati")
        return {
          hex: inputColor.toUpperCase(),
          rgb: '',
          hsl: '',
          rgba: '',
          hsla: '',
          lab: '',
          lch: '',
          oklab: '',
          oklch: '',
          rgbValues: { r: 0, g: 0, b: 0, a: 1 },
          hslValues: { h: 0, s: 0, l: 0, a: 1 },
          labValues: { l: 0, a: 0, b: 0 },
          lchValues: { l: 0, c: 0, h: 0 },
          oklabValues: { l: 0, a: 0, b: 0 },
          oklchValues: { l: 0, c: 0, h: 0 },
          opacity: 1,
          isValid: false,
        }
      }

      const { r, g, b, a } = parsedColor
      const hsl = rgbToHsl(r, g, b)
      const lab = rgbToLab(r, g, b)
      const lch = labToLch(lab.l, lab.a, lab.b)
      const oklab = rgbToOklab(r, g, b)
      const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)

      // Generate HEX with alpha if needed
      const hexColor =
        a < 1
          ? `#${rgbToHex(r, g, b).slice(1)}${Math.round(a * 255)
              .toString(16)
              .padStart(2, '0')}`
          : rgbToHex(r, g, b)

      const result: ColorFormats = {
        hex: hexColor.toUpperCase(),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
        hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`,
        lab: `lab(${lab.l}% ${lab.a} ${lab.b})`,
        lch: `lch(${lch.l}% ${lch.c} ${lch.h})`,
        oklab: `oklab(${oklab.l} ${oklab.a} ${oklab.b})`,
        oklch: `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
        rgbValues: { r, g, b, a },
        hslValues: { ...hsl, a },
        labValues: lab,
        lchValues: lch,
        oklabValues: oklab,
        oklchValues: oklch,
        opacity: a,
        isValid: true,
      }

      onSuccess?.('Rang muvaffaqiyatli konvertatsiya qilindi')
      return result
    } catch (error) {
      onError?.('Rang konvertatsiyasida xatolik yuz berdi')
      return null
    }
  }, [
    inputColor,
    parseColorInput,
    rgbToHsl,
    rgbToLab,
    labToLch,
    rgbToOklab,
    oklabToOklch,
    rgbToHex,
    onSuccess,
    onError,
  ])

  // Set color from different formats
  const setColorFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b)
    setInputColor(hex)
  }, [])

  const setColorFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setInputColor(hex)
  }, [])

  // Get color name (basic implementation)
  const getColorName = useCallback((hex: string): string => {
    const colorNames: Record<string, string> = {
      '#FF0000': 'Qizil',
      '#00FF00': 'Yashil',
      '#0000FF': "Ko'k",
      '#FFFF00': 'Sariq',
      '#FF00FF': 'Binafsha',
      '#00FFFF': 'Turkuaz',
      '#000000': 'Qora',
      '#FFFFFF': 'Oq',
      '#808080': 'Kulrang',
      '#FFA500': "To'q sariq",
      '#800080': 'Binafsha',
      '#008000': "To'q yashil",
    }

    // Return color name if found, otherwise return empty string
    return colorNames[hex.toUpperCase()] || ''
  }, [])

  return {
    inputColor,
    setInputColor,
    colorFormats,
    setColorFromRgb,
    setColorFromHsl,
    generatePalette,
    generateTailwindShades,
    getColorName,
    isValidHex,
    utilities: {
      hexToRgb,
      rgbToHsl,
      hslToRgb,
      rgbToHex,
    },
  }
}
