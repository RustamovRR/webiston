/**
 * Advanced color space conversion utilities (Lab, LCH, OKLab, OKLCH)
 */

// Convert RGB to Lab
export const rgbToLab = (r: number, g: number, b: number) => {
  // First convert RGB to XYZ
  let rNorm = r / 255
  let gNorm = g / 255
  let bNorm = b / 255

  // Apply gamma correction
  rNorm = rNorm > 0.04045 ? ((rNorm + 0.055) / 1.055) ** 2.4 : rNorm / 12.92
  gNorm = gNorm > 0.04045 ? ((gNorm + 0.055) / 1.055) ** 2.4 : gNorm / 12.92
  bNorm = bNorm > 0.04045 ? ((bNorm + 0.055) / 1.055) ** 2.4 : bNorm / 12.92

  // Convert to XYZ using sRGB matrix
  let x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375
  let y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.072175
  let z = rNorm * 0.0193339 + gNorm * 0.119192 + bNorm * 0.9503041

  // Normalize for D65 illuminant
  x = x / 0.95047
  y = y / 1.0
  z = z / 1.08883

  // Convert XYZ to Lab
  const fx = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116
  const fy = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116
  const fz = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116

  const l = Math.round(116 * fy - 16)
  const a = Math.round(500 * (fx - fy))
  const bLab = Math.round(200 * (fy - fz))

  return { l, a, b: bLab }
}

// Convert Lab to LCH
export const labToLch = (l: number, a: number, b: number) => {
  const c = Math.round(Math.sqrt(a * a + b * b))
  let h = Math.round((Math.atan2(b, a) * 180) / Math.PI)
  if (h < 0) h += 360

  // A grey has no hue. `atan2(0, 0)` is 0, which reads as "red".
  return { l, c, h: c === 0 ? 0 : h }
}

/**
 * OKLab, per Björn Ottosson's published matrices.
 *
 * What stood here called itself a "simplified approximation" and was in fact a
 * different colour space: `L` was the WCAG luminance of the GAMMA-ENCODED
 * channels and `a`/`b` were invented channel differences. Measured on the
 * site's own brand teal `#0d5a6b` it reported `oklch(0.29 0.19 216)` where the
 * true value is `oklch(0.433 0.073 217)` — chroma out by 2.6×. Since Tailwind
 * v4 and this repo's own `tokens.css` are written in OKLCH, the converter was
 * handing developers numbers that do not name the colour they pasted in.
 *
 * These are the same constants `scripts/contrast-check.mjs` already uses to
 * gate the design tokens, so the app and its guardrail now agree.
 */

const decodeGamma = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

const encodeGamma = (channel: number) =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055

/**
 * These return FULL precision on purpose. OKLab's `a` and `b` live in roughly
 * ±0.4, so rounding them for storage moves the derived hue: the brand teal's
 * true 217.5° became 217.8° when the hue was taken from values already cut to
 * three decimals. Rounding is presentation, and it belongs at the point of
 * display — `useColorConverter` does it there.
 */
export const rgbToOklab = (r: number, g: number, b: number) => {
  const lr = decodeGamma(r / 255)
  const lg = decodeGamma(g / 255)
  const lb = decodeGamma(b / 255)

  const long = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  )
  const medium = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  )
  const short = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  )

  return {
    l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short
  }
}

export const oklabToOklch = (l: number, a: number, b: number) => {
  const c = Math.sqrt(a * a + b * b)
  let h = Math.round((Math.atan2(b, a) * 180) / Math.PI)
  if (h < 0) h += 360

  // A neutral has no hue; reporting the arctangent of two zeroes as 0° reads
  // as "red" to anyone skimming the value. The epsilon is below the precision
  // any display uses, so it cannot hide a real hue.
  return { l, c, h: c < 0.0005 ? 0 : h }
}

// Convert Lab to RGB
export const labToRgb = (l: number, a: number, b: number) => {
  // Convert Lab to XYZ
  const fy = (l + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200

  const delta = 6 / 29
  const deltaSquared = delta * delta

  let x = fx > delta ? fx * fx * fx : 3 * deltaSquared * (fx - 4 / 29)
  let y = fy > delta ? fy * fy * fy : 3 * deltaSquared * (fy - 4 / 29)
  let z = fz > delta ? fz * fz * fz : 3 * deltaSquared * (fz - 4 / 29)

  // Apply D65 illuminant
  x *= 0.95047
  y *= 1.0
  z *= 1.08883

  // Convert XYZ to RGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415
  let bRgb = x * 0.0557 + y * -0.204 + z * 1.057

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r
  g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g
  bRgb = bRgb > 0.0031308 ? 1.055 * bRgb ** (1 / 2.4) - 0.055 : 12.92 * bRgb

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(bRgb * 255)))
  }
}

// Convert LCH to Lab
export const lchToLab = (l: number, c: number, h: number) => {
  const hRad = (h * Math.PI) / 180
  const a = Math.round(c * Math.cos(hRad))
  const b = Math.round(c * Math.sin(hRad))
  return { l, a, b }
}

/** The exact inverse of `rgbToOklab`, clipped into the sRGB gamut. */
export const oklabToRgb = (l: number, a: number, b: number) => {
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3

  const toByte = (linear: number) =>
    Math.round(Math.min(1, Math.max(0, encodeGamma(linear))) * 255)

  return {
    r: toByte(
      4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short
    ),
    g: toByte(
      -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short
    ),
    b: toByte(
      -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short
    )
  }
}

/**
 * OKLCH → OKLab. The `/ 100` that used to sit on both channels here had no
 * counterpart in `oklabToOklch`, so a value round-tripped through the two came
 * back a hundredth of the chroma it went in with.
 */
export const oklchToOklab = (l: number, c: number, h: number) => {
  const hRad = (h * Math.PI) / 180
  return { l, a: c * Math.cos(hRad), b: c * Math.sin(hRad) }
}
