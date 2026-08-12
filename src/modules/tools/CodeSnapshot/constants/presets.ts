import type { SnapshotOptions } from "../types"
import { BACKGROUND_PRESETS } from "."

/**
 * Four ready-made looks, named for where the picture is going.
 *
 * The problem they solve is the first ten seconds: a newcomer meets a theme
 * grid, a background row and six dropdowns, and has no idea which combination
 * is any good. A preset is the "just make it look right" button, and every
 * control stays exactly where it was for whatever they want to change next.
 *
 * **Four, not fifty.** Fifty presets is the same problem as 65 themes with no
 * swatches — a list to search rather than a decision to make. These four are
 * genuinely different destinations, not four shades of the same picture.
 *
 * **Named for the destination, not the mood.** `Yarim tun` had to become a
 * gradient chip because the word means nothing; `README uchun` needs no chip,
 * because it says what it is for.
 *
 * **They do NOT set the font.** Theme, background, frame, padding and size are
 * all properties of the OUTPUT — where it is going and how big it has to read.
 * The face is a personal preference someone has already expressed, and
 * overwriting it is the one thing a preset has no business doing.
 */

const background = (id: string) =>
  BACKGROUND_PRESETS.find((preset) => preset.id === id)?.value ??
  BACKGROUND_PRESETS[0].value

export interface StylePreset {
  id: string
  theme: string
  /** Everything a preset touches. The code and the language are never in it. */
  patch: Partial<SnapshotOptions>
}

export const STYLE_PRESETS: readonly StylePreset[] = [
  {
    // A timeline thumbnail: seen small, scrolled past, competing with photos.
    // Wide margin so it survives a platform's own crop, and a warm gradient
    // so it is not another grey rectangle.
    id: "social",
    theme: "dracula",
    patch: {
      background: background("ember"),
      frame: "macos",
      padding: 96,
      fontSize: 16,
      lineHeight: 1.6,
      showLineNumbers: false,
      focusLines: []
    }
  },
  {
    // Dropped into a Markdown file next to body text: light, tight, and with
    // the gutter ON, because a README quotes line numbers in the prose around
    // it. Transparent, so it sits on whatever the reader's theme paints.
    id: "readme",
    theme: "github-light-default",
    patch: {
      background: background("none"),
      frame: "plain",
      padding: 32,
      fontSize: 14,
      lineHeight: 1.5,
      showLineNumbers: true,
      focusLines: []
    }
  },
  {
    // Read from the back of a room. The size is the whole point; everything
    // else gets out of its way.
    id: "slide",
    theme: "github-dark-default",
    patch: {
      background: background("slate"),
      frame: "macos",
      padding: 128,
      fontSize: 24,
      lineHeight: 1.8,
      showLineNumbers: false,
      focusLines: []
    }
  },
  {
    // Just the code. No card, no sheet — a transparent PNG that drops into
    // someone else's slide or document and takes its colours from there.
    id: "minimal",
    theme: "vitesse-dark",
    patch: {
      background: background("none"),
      frame: "none",
      padding: 32,
      fontSize: 14,
      lineHeight: 1.6,
      showLineNumbers: false,
      focusLines: []
    }
  }
]
