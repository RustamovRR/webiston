/**
 * Universal color format parser
 */

import { getColorByName } from '@/constants/color-names'
import { hslToRgb } from './color-conversions'
import { labToRgb, lchToLab, oklabToRgb, oklchToOklab } from './color-spaces'

// Universal color format validator and parser
export const parseColorInput = (input: string): { r: number; g: number; b: number; a: number } | null => {
  const cleanInput = input.trim().toLowerCase()

  // HEX format (#rgb, #rrggbb, #rrggbbaa)
  const hexMatch = cleanInput.match(/^#([a-f0-9]{3,8})$/i)
  if (hexMatch) {
    let hex = hexMatch[1]

    if (hex.length === 3) {
      // #rgb -> #rrggbb
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    } else if (hex.length === 4) {
      // #rgba -> #rrggbbaa
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }

    if (hex.length === 6) {
      // #rrggbb
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      }
    } else if (hex.length === 8) {
      // #rrggbbaa
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      }
    }
  }

  // RGB format: rgb(r, g, b)
  const rgbMatch = cleanInput.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: 1,
    }
  }

  // RGBA format: rgba(r, g, b, a)
  const rgbaMatch = cleanInput.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: parseFloat(rgbaMatch[4]),
    }
  }

  // HSL format: hsl(h, s%, l%)
  const hslMatch = cleanInput.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/)
  if (hslMatch) {
    const h = parseInt(hslMatch[1])
    const s = parseInt(hslMatch[2])
    const l = parseInt(hslMatch[3])
    const rgb = hslToRgb(h, s, l)
    return { ...rgb, a: 1 }
  }

  // HSLA format: hsla(h, s%, l%, a)
  const hslaMatch = cleanInput.match(/^hsla\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/)
  if (hslaMatch) {
    const h = parseInt(hslaMatch[1])
    const s = parseInt(hslaMatch[2])
    const l = parseInt(hslaMatch[3])
    const a = parseFloat(hslaMatch[4])
    const rgb = hslToRgb(h, s, l)
    return { ...rgb, a }
  }

  // Lab format: lab(l% a b)
  const labMatch = cleanInput.match(
    /^lab\s*\(\s*([0-9]*\.?[0-9]+)%?\s+([+-]?[0-9]*\.?[0-9]+)\s+([+-]?[0-9]*\.?[0-9]+)\s*\)$/
  )
  if (labMatch) {
    const l = parseFloat(labMatch[1])
    const a = parseFloat(labMatch[2])
    const b = parseFloat(labMatch[3])
    const rgb = labToRgb(l, a, b)
    return { ...rgb, a: 1 }
  }

  // LCH format: lch(l% c h)
  const lchMatch = cleanInput.match(/^lch\s*\(\s*([0-9]*\.?[0-9]+)%?\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s*\)$/)
  if (lchMatch) {
    const l = parseFloat(lchMatch[1])
    const c = parseFloat(lchMatch[2])
    const h = parseFloat(lchMatch[3])
    const lab = lchToLab(l, c, h)
    const rgb = labToRgb(lab.l, lab.a, lab.b)
    return { ...rgb, a: 1 }
  }

  // OKLab format: oklab(l a b)
  const oklabMatch = cleanInput.match(
    /^oklab\s*\(\s*([0-9]*\.?[0-9]+)\s+([+-]?[0-9]*\.?[0-9]+)\s+([+-]?[0-9]*\.?[0-9]+)\s*\)$/
  )
  if (oklabMatch) {
    const l = parseFloat(oklabMatch[1])
    const a = parseFloat(oklabMatch[2])
    const b = parseFloat(oklabMatch[3])
    const rgb = oklabToRgb(l, a, b)
    return { ...rgb, a: 1 }
  }

  // OKLCH format: oklch(l c h)
  const oklchMatch = cleanInput.match(/^oklch\s*\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s*\)$/)
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1])
    const c = parseFloat(oklchMatch[2])
    const h = parseFloat(oklchMatch[3])
    const oklab = oklchToOklab(l, c, h)
    const rgb = oklabToRgb(oklab.l, oklab.a, oklab.b)
    return { ...rgb, a: 1 }
  }

  // Color names: red, blue, white, black, etc.
  const colorByName = getColorByName(cleanInput)
  if (colorByName) {
    // Recursively parse the hex color returned by name lookup
    return parseColorInput(colorByName)
  }

  return null
}

// Check if input is valid color in any format
export const isValidColor = (input: string): boolean => {
  return parseColorInput(input) !== null
}
