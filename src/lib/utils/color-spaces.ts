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
  rNorm =
    rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92
  gNorm =
    gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92
  bNorm =
    bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92

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
}

// Convert Lab to LCH
export const labToLch = (l: number, a: number, b: number) => {
  const c = Math.round(Math.sqrt(a * a + b * b))
  let h = Math.round((Math.atan2(b, a) * 180) / Math.PI)
  if (h < 0) h += 360

  return { l, c, h }
}

// Convert RGB to OKLab (simplified approximation)
export const rgbToOklab = (r: number, g: number, b: number) => {
  // Simplified OKLab conversion (approximation)
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  // Linear RGB to OKLab (simplified)
  const l =
    Math.round((0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm) * 100) / 100
  const a = Math.round((rNorm - gNorm) * 0.5 * 100) / 100
  const bOk = Math.round((rNorm + gNorm - 2 * bNorm) * 0.25 * 100) / 100

  return { l, a, b: bOk }
}

// Convert OKLab to OKLCH
export const oklabToOklch = (l: number, a: number, b: number) => {
  const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100
  let h = Math.round((Math.atan2(b, a) * 180) / Math.PI)
  if (h < 0) h += 360

  return { l, c, h }
}

// Convert Lab to RGB
export const labToRgb = (l: number, a: number, b: number) => {
  // Convert Lab to XYZ
  let fy = (l + 16) / 116
  let fx = a / 500 + fy
  let fz = fy - b / 200

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
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g
  bRgb =
    bRgb > 0.0031308 ? 1.055 * Math.pow(bRgb, 1 / 2.4) - 0.055 : 12.92 * bRgb

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

// Convert OKLab to RGB (simplified approximation)
export const oklabToRgb = (l: number, a: number, b: number) => {
  // Simplified reverse conversion from OKLab to RGB
  // This is an approximation since we used simplified forward conversion
  const r = Math.max(0, Math.min(1, l + a * 2))
  const g = Math.max(0, Math.min(1, l - a * 2))
  const bRgb = Math.max(0, Math.min(1, l - b * 4))

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(bRgb * 255)
  }
}

// Convert OKLCH to OKLab
export const oklchToOklab = (l: number, c: number, h: number) => {
  const hRad = (h * Math.PI) / 180
  const a = (c * Math.cos(hRad)) / 100
  const b = (c * Math.sin(hRad)) / 100
  return { l, a, b }
}
