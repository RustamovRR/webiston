import { describe, expect, it } from "vitest"

import {
  languageFromFilename,
  MAX_DROPPED_BYTES,
  readDroppedFile
} from "./file-drop"
import { ALL_LANGUAGES, resolveLanguage } from "./highlight"

/** A `File` that behaves like a dropped one, without touching the disk. */
function fakeFile(name: string, content: string, size?: number): File {
  const file = new File([content], name)
  if (size !== undefined) Object.defineProperty(file, "size", { value: size })
  return file
}

describe("languageFromFilename", () => {
  it("reads the common extensions through Shiki's own alias table", () => {
    // Arrange / Act / Assert — none of these are hand-mapped in this module.
    // 60 of 71 checked extensions resolve this way, which is why the hand map
    // is ten entries instead of seventy.
    expect(languageFromFilename("main.rs")).toBe("rust")
    expect(languageFromFilename("app.py")).toBe("python")
    expect(languageFromFilename("config.yml")).toBe("yaml")
    expect(languageFromFilename("index.tsx")).toBe("tsx")
    expect(languageFromFilename("README.md")).toBe("markdown")
  })

  it("covers the ones Shiki's aliases miss", () => {
    // Arrange / Act / Assert
    expect(languageFromFilename("vector.hpp")).toBe("cpp")
    expect(languageFromFilename("stdio.h")).toBe("c")
    expect(languageFromFilename("Token.sol")).toBe("solidity")
    expect(languageFromFilename("server.ex")).toBe("elixir")
  })

  it("adds nothing Shiki already answers", () => {
    // Arrange — every hand-mapped extension, re-asked of Shiki directly.
    const handMapped = ["h", "cc", "hpp", "htm", "pl", "ex", "exs", "sol"]

    // Act
    const redundant = handMapped.filter(
      (extension) => resolveLanguage(extension) !== "text"
    )

    // Assert — an entry Shiki can resolve is a second source of truth that
    // will drift the next time Shiki adds an alias.
    expect(redundant).toEqual([])
  })

  it("names files whose type IS the name", () => {
    // Arrange / Act / Assert — no extension to read.
    expect(languageFromFilename("Dockerfile")).toBe("docker")
    expect(languageFromFilename("Makefile")).toBe("make")
  })

  it("says nothing rather than guessing", () => {
    // Arrange / Act / Assert — `null` hands the decision to the content
    // scorer, which is right: a `.txt` holding Python is Python.
    expect(languageFromFilename("notes.txt")).toBeNull()
    expect(languageFromFilename("LICENSE")).toBeNull()
    expect(languageFromFilename("archive.zzz")).toBeNull()
  })

  it("returns only canonical ids, which is what the picker needs", () => {
    // Arrange
    const known = new Set(ALL_LANGUAGES.map((lang) => lang.id))
    const names = [
      "main.rs",
      "app.py",
      "config.yml",
      "index.tsx",
      "README.md",
      "vector.hpp",
      "stdio.h",
      "Token.sol",
      "server.ex",
      "Dockerfile",
      "Makefile",
      ".env",
      "page.htm",
      "script.pl",
      "fix.patch"
    ]

    // Act
    const bad = names
      .map(languageFromFilename)
      .filter((id) => id !== null)
      .filter((id) => !known.has(id) || resolveLanguage(id) !== id)

    // Assert — an alias here leaves the language picker showing an empty box,
    // the same defect the detector shipped with.
    expect(bad).toEqual([])
  })
})

describe("readDroppedFile", () => {
  it("returns the code, the language and the filename", async () => {
    // Arrange
    const file = fakeFile("greet.rs", 'fn main() {\n    println!("salom");\n}')

    // Act
    const dropped = await readDroppedFile(file)

    // Assert — one gesture, three answers. The title is the reason anyone
    // types in that field, and here it is already known.
    expect(dropped.language).toBe("rust")
    expect(dropped.code).toContain("println!")
    expect(dropped.title).toBe("greet.rs")
  })

  it("normalises Windows line endings", async () => {
    // Arrange
    const file = fakeFile("a.js", "const a = 1\r\nconst b = 2\r\n")

    // Act
    const dropped = await readDroppedFile(file)

    // Assert — the layout splits on `\n`, so a stray `\r` would be measured
    // and drawn as a glyph at the end of every line.
    expect(dropped.code).not.toContain("\r")
    expect(dropped.code.split("\n")).toHaveLength(3)
  })

  it("refuses a file too large to become a picture", async () => {
    // Arrange — the cap is not arbitrary: past the browser's canvas limit the
    // image cannot be drawn at any scale, which lands around 3,000 lines.
    const file = fakeFile("huge.ts", "x", MAX_DROPPED_BYTES + 1)

    // Act / Assert
    await expect(readDroppedFile(file)).rejects.toThrow("tooBig")
  })

  it("refuses a binary file by its content, not its extension", async () => {
    // Arrange — a PNG renamed `.ts` is still a PNG, and `File.type` is empty
    // for most of the extensions this tool cares about.
    const file = fakeFile("image.ts", "\u0089PNG\u0000\u0000IHDR binary junk")

    // Act / Assert — without this the editor fills with replacement
    // characters and the tool paints a picture of garbage.
    await expect(readDroppedFile(file)).rejects.toThrow("notText")
  })
})
