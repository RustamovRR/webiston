/**
 * Color palette generation utilities
 */

import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "./color-conversions"

// Generate Tailwind-style shade system
export const generateTailwindShades = (baseColor: string) => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  return shades.map((shade) => {
    let lightness: number

    // Tailwind-style lightness mapping
    switch (shade) {
      case 50:
        lightness = 97
        break
      case 100:
        lightness = 93
        break
      case 200:
        lightness = 86
        break
      case 300:
        lightness = 77
        break
      case 400:
        lightness = 65
        break
      case 500:
        lightness = hsl.l
        break // Base color
      case 600:
        lightness = Math.max(hsl.l - 15, 35)
        break
      case 700:
        lightness = Math.max(hsl.l - 25, 25)
        break
      case 800:
        lightness = Math.max(hsl.l - 35, 15)
        break
      case 900:
        lightness = Math.max(hsl.l - 45, 8)
        break
      case 950:
        lightness = Math.max(hsl.l - 55, 4)
        break
      default:
        lightness = hsl.l
    }

    // Adjust saturation for lighter/darker shades
    let saturation = hsl.s
    if (shade <= 200) {
      saturation = Math.max(hsl.s - 20, 10) // Less saturated for light shades
    } else if (shade >= 800) {
      saturation = Math.min(hsl.s + 10, 100) // More saturated for dark shades
    }

    const newRgb = hslToRgb(hsl.h, saturation, lightness)
    return {
      shade,
      hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
      rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
      hsl: `hsl(${hsl.h}, ${saturation}%, ${lightness}%)`
    }
  })
}

// Generate color palette
export const generatePalette = (
  baseColor: string,
  type: "monochromatic" | "analogous" | "complementary" = "monochromatic"
): string[] => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const palette: string[] = []

  switch (type) {
    case "monochromatic":
      // Generate Tailwind-style shades for monochromatic
      const shades = generateTailwindShades(baseColor)
      return shades.map((shade) => shade.hex)

    case "analogous":
      // Generate analogous colors (neighboring hues) - 30° apart
      for (let i = -30; i <= 30; i += 15) {
        const newHue = (hsl.h + i + 360) % 360
        const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
        palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      }
      break

    case "complementary":
      // Generate true complementary color scheme
      const complementaryHue = (hsl.h + 180) % 360
      const splitComp1 = (hsl.h + 150) % 360
      const splitComp2 = (hsl.h + 210) % 360

      // Generate different lightness levels for variety
      const lightnesLevels = [30, 50, 70, 85]

      // Base color variations
      lightnesLevels.forEach((lightness) => {
        const newRgb = hslToRgb(hsl.h, hsl.s, lightness)
        palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      })

      // Complementary color variations
      lightnesLevels.forEach((lightness) => {
        const newRgb = hslToRgb(complementaryHue, hsl.s, lightness)
        palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      })

      // Add split-complementary for more harmony
      const newRgb1 = hslToRgb(splitComp1, Math.max(hsl.s - 20, 40), hsl.l)
      const newRgb2 = hslToRgb(splitComp2, Math.max(hsl.s - 20, 40), hsl.l)
      palette.push(rgbToHex(newRgb1.r, newRgb1.g, newRgb1.b))
      palette.push(rgbToHex(newRgb2.r, newRgb2.g, newRgb2.b))
      break
  }

  return palette
}
