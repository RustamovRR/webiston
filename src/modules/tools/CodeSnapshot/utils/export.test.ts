import { afterEach, describe, expect, it, vi } from "vitest"

import { downloadSnapshot, snapshotFileName } from "./export"

describe("snapshotFileName", () => {
  it("slugifies the window title", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("useDebounce hook")).toBe("usedebounce-hook.png")
  })

  it("drops an existing extension instead of stacking one on", () => {
    // Arrange / Act / Assert — the title bar usually holds a filename, and
    // `app.tsx.png` would be a file with two extensions.
    expect(snapshotFileName("App.tsx")).toBe("app.png")
    expect(snapshotFileName("server.route.ts")).toBe("server-route.png")
  })

  it("collapses punctuation runs into single hyphens", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("a  ///  b")).toBe("a-b.png")
  })

  it("never leaves a leading or trailing hyphen", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("  --hello--  ")).toBe("hello.png")
  })

  /**
   * The failure this guards: an empty stem yields `.png`, which is a HIDDEN
   * file on macOS and Linux. The reader clicks download and nothing appears.
   */
  it("falls back to a real stem when the title is empty or symbols only", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("")).toBe("code-snapshot.png")
    expect(snapshotFileName("   ")).toBe("code-snapshot.png")
    expect(snapshotFileName("***")).toBe("code-snapshot.png")
  })

  /**
   * The extension is whatever the browser ACTUALLY produced, not what was
   * asked for. `toBlob` silently falls back to PNG for a type it cannot
   * encode — measured: `toBlob(cb, "image/avif")` hands back `image/png` —
   * so a name built from the request would promise a file no viewer opens.
   */
  it("takes the extension it is given", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("App.tsx", "webp")).toBe("app.webp")
    expect(snapshotFileName("", "webp")).toBe("code-snapshot.webp")
  })

  it("does not produce a name that starts with a dot", () => {
    // Arrange
    // A lambda, not a bare reference: `map` passes the INDEX as the second
    // argument, which `snapshotFileName` now reads as the extension.
    const names = ["", "***", "  ", ".ts", "..."].map((title) =>
      snapshotFileName(title)
    )

    // Act / Assert
    for (const name of names) expect(name.startsWith(".")).toBe(false)
  })
})

/**
 * `toBlob` does not report an unsupported type — it silently encodes a PNG
 * instead. Measured in Chrome: `toBlob(cb, "image/avif")` hands back a blob of
 * type `image/png`. A filename built from what was ASKED for would then
 * promise a `.webp` that no viewer opens, and nothing anywhere would say so.
 */
describe("downloadSnapshot names the file after what it got back", () => {
  function captureDownload(producedType: string) {
    const names: string[] = []
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(((
      callback: BlobCallback
    ) => {
      callback(new Blob(["x"], { type: producedType }))
    }) as typeof HTMLCanvasElement.prototype.toBlob)
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      names.push(this.download)
    })
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: () => "blob:test",
      revokeObjectURL: () => {}
    })
    vi.stubGlobal("requestAnimationFrame", () => 0)
    return names
  }

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("uses .webp when the browser really produced WebP", async () => {
    // Arrange
    const names = captureDownload("image/webp")

    // Act
    await downloadSnapshot(document.createElement("canvas"), "App.tsx", "webp")

    // Assert
    expect(names).toEqual(["app.webp"])
  })

  it("uses .png when the browser quietly fell back to PNG", async () => {
    // Arrange — asked for WebP, given a PNG. This is the exact behaviour
    // AVIF exhibits today, and any engine may do it for WebP tomorrow.
    const names = captureDownload("image/png")

    // Act
    await downloadSnapshot(document.createElement("canvas"), "App.tsx", "webp")

    // Assert — the extension follows the FILE, not the request.
    expect(names).toEqual(["app.png"])
  })
})
