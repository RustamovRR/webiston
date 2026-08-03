/**
 * The EyeDropper API is not in TypeScript's DOM lib yet (it is a WICG spec,
 * shipped in Chromium 95+ and absent from Safari and Firefox). Declared here
 * as OPTIONAL on `window` so every call site is forced through a feature
 * check — which is also what the UI needs, since the button must not appear
 * in a browser that cannot honour it.
 */

interface ColorSelectionResult {
  /** Always a 6-digit `#rrggbb`. */
  sRGBHex: string
}

interface EyeDropperConstructor {
  new (): {
    open: (options?: { signal?: AbortSignal }) => Promise<ColorSelectionResult>
  }
}

interface Window {
  EyeDropper?: EyeDropperConstructor
}
