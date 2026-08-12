import { vi } from "vitest"

/**
 * A canvas that records instead of painting.
 *
 * jsdom implements `<canvas>` as an element and nothing else — `getContext`
 * returns `null`, and `document.fonts` does not exist at all. Both are hard
 * requirements of this tool's render path, so without a stub the component
 * cannot be mounted in a test, let alone driven.
 *
 * It records rather than merely swallowing calls, and that is the point: every
 * assertion in `CodeSnapshot.test.tsx` reads back what would have been drawn —
 * which strings, in which colours, at which sizes. That is the closest thing
 * to "what the visitor sees" available without a real rasteriser, and it is
 * enough to catch the wiring bugs an integration test exists for: a theme that
 * does not reach the paint, a language that never re-tokenises, a line-number
 * toggle that changes state and nothing else.
 */

export interface DrawnText {
  text: string
  x: number
  y: number
  fillStyle: string
  font: string
  /**
   * `globalAlpha` at the moment of the draw.
   *
   * The only observable for line focus. The painter dims a line by setting
   * alpha, not by changing its colour, so a recording that keeps colours but
   * drops alpha cannot tell a focused snapshot from an unfocused one — and
   * "the other lines went dim" is the entire feature.
   */
  alpha: number
}

export interface CanvasRecording {
  /**
   * One entry per paint, newest last.
   *
   * Grouping matters more than it looks. A single accumulating list cannot
   * answer "what is on the canvas *now*" — a paint still in flight when the
   * test acts lands after it, and the assertion then sees the old picture
   * merged with the new one. Every paint begins with `setTransform`, so that
   * call is the pass boundary.
   */
  passes: DrawnText[][]
  /** The picture currently on the canvas: the most recent complete pass. */
  latest: () => DrawnText[]
  /**
   * `fillStyle` is recorded alongside the rectangle, and it is the field that
   * matters: whether the background sheet is PAINTED is not the question a
   * transparent export asks — `fillRect` with `transparent` is a no-op — the
   * question is whether anything OPAQUE covers the canvas.
   */
  fills: {
    x: number
    y: number
    width: number
    height: number
    fillStyle: string
  }[]
  gradients: number
  clear: () => void
}

/**
 * Width per character, so a measured string has a predictable width.
 *
 * A real `measureText` would make every dimension assertion depend on a font
 * file; this makes them arithmetic.
 */
const CHAR_WIDTH_RATIO = 0.6

export function installCanvasStub(): CanvasRecording {
  const recording: CanvasRecording = {
    passes: [],
    latest: () => recording.passes.at(-1) ?? [],
    fills: [],
    gradients: 0,
    clear: () => {
      recording.passes.length = 0
      recording.fills.length = 0
      recording.gradients = 0
    }
  }

  function createContext(canvas: HTMLCanvasElement) {
    // Not a colour: every recorded `fillText` is preceded by a real assignment,
    // so this only ever shows up if the painter forgets to set one.
    const state = { font: "10px sans-serif", fillStyle: "unset", alpha: 1 }
    const stack: (typeof state)[] = []

    return {
      canvas,
      get font() {
        return state.font
      },
      set font(value: string) {
        state.font = value
      },
      get fillStyle() {
        return state.fillStyle
      },
      set fillStyle(value: string) {
        // A gradient object arrives here too; keep the last string colour so
        // token colours stay readable in the recording.
        if (typeof value === "string") state.fillStyle = value
      },
      get globalAlpha() {
        return state.alpha
      },
      set globalAlpha(value: number) {
        state.alpha = value
      },
      shadowColor: "",
      shadowBlur: 0,
      shadowOffsetY: 0,
      textAlign: "left",
      textBaseline: "alphabetic",

      measureText: (text: string) => {
        // The size is the first number in a CSS font shorthand.
        const size = Number(state.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 10)
        return { width: text.length * size * CHAR_WIDTH_RATIO }
      },
      fillText: (text: string, x: number, y: number) => {
        const pass = recording.passes.at(-1)
        pass?.push({
          text,
          x,
          y,
          fillStyle: state.fillStyle,
          font: state.font,
          alpha: state.alpha
        })
      },
      fillRect: (x: number, y: number, width: number, height: number) => {
        recording.fills.push({
          x,
          y,
          width,
          height,
          fillStyle: state.fillStyle
        })
      },
      // Deliberately absent from this stub: `getImageData`. `canvas-limits.ts`
      // probes the engine by drawing at the far edge and reading the pixel
      // back, so under jsdom every probe fails and the limit resolves to the
      // conservative 8192 fallback — deterministic, and low enough that a
      // few hundred lines exercise the scale clamp in a test.
      clearRect: () => {},
      // `paintSnapshot` calls this exactly once, first — so it is the marker
      // that a new picture is starting.
      setTransform: () => {
        recording.passes.push([])
      },
      // REAL save/restore, not no-ops.
      //
      // The painter halves the alpha for a line number inside a save/restore
      // pair. With no-ops the 0.4 leaked onto every token drawn after it, so
      // the recording showed the whole snapshot dimmed and any assertion
      // about focus was measuring the stub instead of the painter.
      save: () => {
        stack.push({ ...state })
      },
      restore: () => {
        const previous = stack.pop()
        if (previous) Object.assign(state, previous)
      },
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      arcTo: () => {},
      roundRect: () => {},
      fill: () => {},
      createLinearGradient: () => {
        recording.gradients += 1
        return { addColorStop: () => {} }
      }
    } as unknown as CanvasRenderingContext2D
  }

  // `getContext` is an overloaded signature covering 2d, webgl and
  // bitmaprenderer, so a 2D-only stub cannot be asserted onto it directly —
  // TS is right that the types do not overlap. Through `unknown`, with the
  // reason stated, per `code-rules.md` §5.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      return createContext(this)
    } as unknown as typeof HTMLCanvasElement.prototype.getContext
  )

  // `document.fonts` is absent in jsdom; the hook awaits it before painting.
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: {
      load: () => Promise.resolve([]),
      ready: Promise.resolve()
    }
  })

  return recording
}
