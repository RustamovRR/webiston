/**
 * Color palette generation utilities
 */

import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "./color-conversions"

export const SHADE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
] as const

/**
 * The lightness curve of a neutral Tailwind-style scale, with 500 sitting at
 * the midpoint. It is a SHAPE, not a set of absolute targets — the base colour
 * is anchored at 500 and the two halves are stretched onto it.
 */
const REFERENCE_LIGHTNESS: Record<number, number> = {
  50: 97,
  100: 93,
  200: 86,
  300: 77,
  400: 65,
  500: 50,
  600: 42,
  700: 35,
  800: 27,
  900: 18,
  950: 10
}

const LIGHTEST = 97
const MID = 50
const DARKEST = 10

/**
 * A shade scale that only ever gets darker.
 *
 * The version this replaces read the curve as ABSOLUTE lightness with floors:
 * `600 = max(l - 15, 35)`, `700 = max(l - 25, 25)`. For any base darker than
 * the floor those clamps LIFTED the shade above the base, so the ramp went
 * light → dark → light → dark. Measured on the site's own `#0d5a6b` (L 24%):
 * 500 came out `#0d5b6d`, then 600 `#14859f` — visibly BRIGHTER than the colour
 * it was supposed to be a darker step of — and 700 brighter still.
 *
 * Anchoring instead: 500 IS the base, the lighter half is stretched from the
 * base up to 97%, the darker half from 10% up to the base. Monotonic by
 * construction, at any base lightness.
 */
const anchorLightness = (reference: number, base: number): number => {
  if (reference === MID) return base

  if (reference > MID) {
    // A base that is already lighter than the nominal top still needs somewhere
    // to go, so the ceiling opens up rather than folding under the base.
    const top = Math.min(100, Math.max(LIGHTEST, base + 3))
    return base + ((reference - MID) / (LIGHTEST - MID)) * (top - base)
  }

  // Same on the dark end: `#111111` sits at L 7%, below the nominal floor of
  // 10%, and interpolating "up" to it inverted the whole darker half.
  const bottom = Math.max(0, Math.min(DARKEST, base - 3))
  return bottom + ((reference - DARKEST) / (MID - DARKEST)) * (base - bottom)
}

/**
 * Guarantees eleven DISTINCT steps.
 *
 * Anchoring alone leaves the ends compressed when the base is near white or
 * near black — a beige base produced `96, 96` for 100 and 200 after rounding,
 * two identical swatches in a scale whose whole point is eleven usable steps.
 * Each half is walked outward from 500 and forced to keep moving. Past 0 or 100
 * there is nowhere left to go and ties are physically unavoidable; the clamp
 * says so rather than wrapping around.
 */
const enforceStrictRamp = (lightnessByStep: number[], baseIndex: number) => {
  const ramp = [...lightnessByStep]

  for (let i = baseIndex - 1; i >= 0; i--) {
    ramp[i] = Math.min(100, Math.max(ramp[i], ramp[i + 1] + 1))
  }
  for (let i = baseIndex + 1; i < ramp.length; i++) {
    ramp[i] = Math.max(0, Math.min(ramp[i], ramp[i - 1] - 1))
  }

  return ramp
}

// Generate Tailwind-style shade system
export const generateTailwindShades = (baseColor: string) => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const baseIndex = SHADE_STEPS.indexOf(500)
  const ramp = enforceStrictRamp(
    SHADE_STEPS.map((shade) =>
      Math.round(anchorLightness(REFERENCE_LIGHTNESS[shade], hsl.l))
    ),
    baseIndex
  )

  return SHADE_STEPS.map((shade, index) => {
    const lightness = ramp[index]

    // Adjust saturation for lighter/darker shades.
    //
    // The floors used to be absolute — `max(s - 20, 10)` and `min(s + 10, 100)`
    // — which INJECTED colour into a colour that had none. Measured on
    // `#808080`: the scale came back `#f8f7f7 … #2a2222`, a red-tinted ramp
    // from a pure grey, because hue 0 met a forced saturation of 10. A grey
    // base must stay grey at every stop.
    let saturation = hsl.s
    if (hsl.s > 0) {
      if (shade <= 200) {
        saturation = Math.max(hsl.s - 20, Math.min(hsl.s, 10))
      } else if (shade >= 800) {
        saturation = Math.min(hsl.s + 10, 100)
      }
    }

    // 500 IS the visitor's colour, returned untouched. Re-deriving it through
    // HSL and back costs a unit per channel to integer rounding — `#3b82f6`
    // came out `#3c83f6` — and a scale that hands back a NEIGHBOUR of the hex
    // you pasted is the one thing a shade generator must never do.
    const newRgb = shade === 500 ? rgb : hslToRgb(hsl.h, saturation, lightness)

    return {
      shade,
      hex:
        shade === 500
          ? rgbToHex(rgb.r, rgb.g, rgb.b)
          : rgbToHex(newRgb.r, newRgb.g, newRgb.b),
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
    case "monochromatic": {
      /**
       * One hue, five steps, saturation easing off at both ends.
       *
       * This used to `return generateTailwindShades(baseColor)` verbatim — so
       * the "Monochromatic palette" card and the "Colour shades (50–950)" card
       * below it rendered THE SAME ELEVEN COLOURS, two full-width sections of
       * identical data, on the tool's default setting. A scheme and a token
       * ramp are different artefacts: the ramp is eleven named steps for a
       * design system, the scheme is a handful of colours that work together.
       */
      const STEPS = [
        { lightness: 32, saturation: 0.75 },
        { lightness: 16, saturation: 0.9 },
        { lightness: 0, saturation: 1 },
        { lightness: -16, saturation: 0.9 },
        { lightness: -30, saturation: 0.75 }
      ]

      STEPS.forEach((step) => {
        const newRgb = hslToRgb(
          hsl.h,
          Math.round(hsl.s * step.saturation),
          Math.max(6, Math.min(96, hsl.l + step.lightness))
        )
        palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      })
      break
    }

    case "analogous":
      // Generate analogous colors (neighboring hues) - 30° apart
      for (let i = -30; i <= 30; i += 15) {
        const newHue = (hsl.h + i + 360) % 360
        const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
        palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      }
      break

    case "complementary": {
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

      // Add split-complementary for more harmony.
      //
      // `max(s - 20, 40)` raised saturation above the base whenever the base
      // sat below 40 — a near-grey produced two vivid split-complements that
      // belonged to no scheme the visitor had chosen. Softening means moving
      // DOWN from the base, never past zero.
      const softened = Math.max(hsl.s - 20, 0)
      const newRgb1 = hslToRgb(splitComp1, softened, hsl.l)
      const newRgb2 = hslToRgb(splitComp2, softened, hsl.l)
      palette.push(rgbToHex(newRgb1.r, newRgb1.g, newRgb1.b))
      palette.push(rgbToHex(newRgb2.r, newRgb2.g, newRgb2.b))
      break
    }
  }

  // A palette is a set of distinct colours. Rotating the hue of an achromatic
  // base is a no-op, so `analogous` on `#808080` returned the same grey five
  // times — five identical squares in the UI, and five React children keyed on
  // an identical hex (four "same key" warnings per render, measured).
  return [...new Set(palette)]
}
