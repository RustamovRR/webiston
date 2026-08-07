/**
 * Color conversion utility functions
 */

// Convert HSL to RGB
export const hslToRgb = (h: number, s: number, l: number) => {
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
    b: Math.round(b * 255)
  }
}

// Convert hex to RGB (supports both 3 and 6 digit hex)
export const hexToRgb = (hex: string) => {
  // Remove # if present
  hex = hex.replace("#", "")

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number) => {
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
    l: Math.round(l * 100)
  }
}

// Convert RGB to HEX
//
// Clamps and rounds, because this function's contract is "return a hex colour"
// and it could not previously keep it. `c.toString(16)` on anything outside
// 0–255, or on a fraction, produced invalid CSS — a fractional channel yielded
// a literal "." inside the string, a negative one a "-", and 300 produced seven
// hex digits instead of six.
//
// Not theoretical: `parseColorInput` does not clamp channels, so typing
// `rgb(300, 0, 0)` into the Color Converter displayed that 7-digit value as the
// HEX result. Exact cases are pinned in color-conversions.test.ts. Every
// in-range input is unchanged by this.
export const rgbToHex = (r: number, g: number, b: number): string => {
  const componentToHex = (c: number) => {
    const byte = Math.round(Math.min(255, Math.max(0, c || 0)))
    return byte.toString(16).padStart(2, "0")
  }
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

// Validate hex color
export const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}
