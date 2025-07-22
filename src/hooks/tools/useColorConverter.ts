import { useState, useMemo, useCallback } from 'react'

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
  rgbValues: { r: number; g: number; b: number }
  hslValues: { h: number; s: number; l: number }
  labValues: { l: number; a: number; b: number }
  lchValues: { l: number; c: number; h: number }
  oklabValues: { l: number; a: number; b: number }
  oklchValues: { l: number; c: number; h: number }
  isValid: boolean
}

interface UseColorConverterProps {
  initialColor?: string
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useColorConverter = ({ initialColor = '#3b82f6', onSuccess, onError }: UseColorConverterProps = {}) => {
  const [inputColor, setInputColor] = useState(initialColor)

  // Validate hex color
  const isValidHex = useCallback((hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
  }, [])

  // Convert hex to RGB (supports both 3 and 6 digit hex)
  const hexToRgb = useCallback((hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '')

    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }, [])

  // Convert RGB to HSL
  const rgbToHsl = useCallback((r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h: number
    let s: number
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
        default:
          h = 0
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }, [])

  // Convert HSL to RGB
  const hslToRgb = useCallback((h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r: number, g: number, b: number

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }, [])

  // Convert RGB to HEX
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    const componentToHex = (c: number) => {
      const hex = c.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
  }, [])

  // Convert RGB to Lab
  const rgbToLab = useCallback((r: number, g: number, b: number) => {
    // First convert RGB to XYZ
    let rNorm = r / 255
    let gNorm = g / 255
    let bNorm = b / 255

    // Apply gamma correction
    rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92
    gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92
    bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92

    // Convert to XYZ using sRGB matrix
    let x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375
    let y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.072175
    let z = rNorm * 0.0193339 + gNorm * 0.119192 + bNorm * 0.9503041

    // Normalize for D65 illuminant
    x = x / 0.95047
    y = y / 1.0
    z = z / 1.08883

    // Convert XYZ to Lab
    const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
    const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
    const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116

    const l = Math.round(116 * fy - 16)
    const a = Math.round(500 * (fx - fy))
    const bLab = Math.round(200 * (fy - fz))

    return { l, a, b: bLab }
  }, [])

  // Convert Lab to LCH
  const labToLch = useCallback((l: number, a: number, b: number) => {
    const c = Math.round(Math.sqrt(a * a + b * b))
    let h = Math.round((Math.atan2(b, a) * 180) / Math.PI)
    if (h < 0) h += 360

    return { l, c, h }
  }, [])

  // Convert RGB to OKLab (simplified approximation)
  const rgbToOklab = useCallback((r: number, g: number, b: number) => {
    // Simplified OKLab conversion (approximation)
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    // Linear RGB to OKLab (simplified)
    const l = Math.round((0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm) * 100) / 100
    const a = Math.round((rNorm - gNorm) * 0.5 * 100) / 100
    const bOk = Math.round((rNorm + gNorm - 2 * bNorm) * 0.25 * 100) / 100

    return { l, a, b: bOk }
  }, [])

  // Convert OKLab to OKLCH
  const oklabToOklch = useCallback((l: number, a: number, b: number) => {
    const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100
    let h = Math.round((Math.atan2(b, a) * 180) / Math.PI)
    if (h < 0) h += 360

    return { l, c, h }
  }, [])

  // Main color formats calculation
  const colorFormats = useMemo((): ColorFormats | null => {
    try {
      if (!isValidHex(inputColor)) {
        onError?.("Noto'g'ri HEX rang formati")
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
          rgbValues: { r: 0, g: 0, b: 0 },
          hslValues: { h: 0, s: 0, l: 0 },
          labValues: { l: 0, a: 0, b: 0 },
          lchValues: { l: 0, c: 0, h: 0 },
          oklabValues: { l: 0, a: 0, b: 0 },
          oklchValues: { l: 0, c: 0, h: 0 },
          isValid: false,
        }
      }

      const rgb = hexToRgb(inputColor)
      if (!rgb) {
        onError?.('RGB konvertatsiya xatoligi')
        return null
      }

      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      const lab = rgbToLab(rgb.r, rgb.g, rgb.b)
      const lch = labToLch(lab.l, lab.a, lab.b)
      const oklab = rgbToOklab(rgb.r, rgb.g, rgb.b)
      const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)

      const result: ColorFormats = {
        hex: inputColor.toUpperCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
        hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
        lab: `lab(${lab.l}% ${lab.a} ${lab.b})`,
        lch: `lch(${lch.l}% ${lch.c} ${lch.h})`,
        oklab: `oklab(${oklab.l} ${oklab.a} ${oklab.b})`,
        oklch: `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
        rgbValues: rgb,
        hslValues: hsl,
        labValues: lab,
        lchValues: lch,
        oklabValues: oklab,
        oklchValues: oklch,
        isValid: true,
      }

      onSuccess?.('Rang muvaffaqiyatli konvertatsiya qilindi')
      return result
    } catch (error) {
      onError?.('Rang konvertatsiyasida xatolik yuz berdi')
      return null
    }
  }, [inputColor, isValidHex, hexToRgb, rgbToHsl, rgbToLab, labToLch, rgbToOklab, oklabToOklch, onSuccess, onError])

  // Set color from different formats
  const setColorFromRgb = useCallback(
    (r: number, g: number, b: number) => {
      const hex = rgbToHex(r, g, b)
      setInputColor(hex)
    },
    [rgbToHex],
  )

  const setColorFromHsl = useCallback(
    (h: number, s: number, l: number) => {
      const rgb = hslToRgb(h, s, l)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      setInputColor(hex)
    },
    [hslToRgb, rgbToHex],
  )

  // Generate color palette
  const generatePalette = useCallback(
    (baseColor: string, type: 'monochromatic' | 'analogous' | 'complementary' = 'monochromatic') => {
      try {
        const rgb = hexToRgb(baseColor)
        if (!rgb) return []

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        const palette: string[] = []

        switch (type) {
          case 'monochromatic':
            // Generate shades and tints
            for (let i = 20; i <= 80; i += 20) {
              const newHsl = { ...hsl, l: i }
              const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
              palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
            }
            break
          case 'analogous':
            // Generate analogous colors (neighboring hues)
            for (let i = -60; i <= 60; i += 30) {
              const newHue = (hsl.h + i + 360) % 360
              const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
              palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
            }
            break
          case 'complementary':
            // Generate complementary and split-complementary
            const complementary = (hsl.h + 180) % 360
            const splitComp1 = (hsl.h + 150) % 360
            const splitComp2 = (hsl.h + 210) % 360

            for (const h of [hsl.h, splitComp1, complementary, splitComp2]) {
              const newRgb = hslToRgb(h, hsl.s, hsl.l)
              palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
            }
            break
        }

        return palette
      } catch (error) {
        onError?.('Palette generatsiya xatoligi')
        return []
      }
    },
    [hexToRgb, rgbToHsl, hslToRgb, rgbToHex, onError],
  )

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

    return colorNames[hex.toUpperCase()] || "Noma'lum rang"
  }, [])

  return {
    inputColor,
    setInputColor,
    colorFormats,
    setColorFromRgb,
    setColorFromHsl,
    generatePalette,
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
