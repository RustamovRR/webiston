import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/hash-generator/uz.json"
import { HashGenerator } from "./HashGenerator"
import { useHashDraftStore } from "./stores/hashDraftStore"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The first test is the one that matters: what shipped here answered
 * `5955b8155955b8155955b8155955b815` for `Hello, World!` and called it MD5.
 */

const messages = { ...commonMessages, ...toolMessages }

const SHA256_HELLO =
  "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
const MD5_HELLO = "65a8e27d8879283831b664bd8b7f0ad4"

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <HashGenerator />
    </NextIntlClientProvider>
  )
}

const source = () => screen.getByRole("textbox", { name: /^(Matn|Fayl)$/ })

const results = () => screen.getByRole("region", { name: /natijalari/i })

const type = (value: string) =>
  fireEvent.change(source(), { target: { value } })

const choose = (label: string) =>
  fireEvent.click(screen.getByRole("radio", { name: label }))

beforeEach(() => {
  useHashDraftStore.getState().reset()
})

describe("the digests are the real ones", () => {
  it("computes a genuine MD5, not a 32-bit string hash repeated four times", async () => {
    // Arrange + Act
    renderTool()
    type("Hello, World!")

    // Assert — `md5sum` and RFC 1321 agree on this value; the shipped
    // implementation returned 5955b815 four times over
    await waitFor(() => expect(results()).toHaveTextContent(MD5_HELLO))
  })

  it("computes all five algorithms without being asked to pick any", async () => {
    // Arrange + Act — the algorithm checkboxes are gone. They caused a real
    // bug (toggling one regenerated with the PREVIOUS selection) and bought
    // nothing: five digests of typed text cost microseconds.
    renderTool()
    type("Hello, World!")

    // Assert
    await waitFor(() => expect(results()).toHaveTextContent(SHA256_HELLO))
    for (const algorithm of ["SHA-256", "SHA-512", "SHA-384", "SHA-1", "MD5"]) {
      expect(within(results()).getByText(algorithm)).toBeInTheDocument()
    }
  })

  it("counts BYTES, because that is what the digest is over", async () => {
    // Arrange + Act — 11 characters, 12 UTF-8 bytes
    renderTool()
    type("Oʻzbekiston")

    // Assert
    expect(await screen.findByText("12 bayt")).toBeInTheDocument()
  })

  it("never disables the field the visitor is typing into", () => {
    // Arrange
    renderTool()

    // Act — the digests start on this very keystroke, synchronously
    type("Hello")

    // Assert — `DualTextPanel` disables its textarea while `isProcessing`, so
    // wiring the (sub-millisecond) text hashing into that flag takes focus
    // away on every character typed and flashes "Ishlanmoqda..." in the result
    // panel. Only reading a FILE is slow enough to be worth saying.
    expect(source()).not.toBeDisabled()
    expect(screen.queryByText(/Ishlanmoqda/i)).toBeNull()
  })

  it("settles on the last input when several arrive in a row", async () => {
    // Arrange — the old `setTimeout(…, 300)` had no `clearTimeout`, so every
    // keystroke queued its own async run and they could finish out of order
    renderTool()

    // Act
    type("a")
    type("ab")
    type("Hello, World!")

    // Assert
    await waitFor(() => expect(results()).toHaveTextContent(SHA256_HELLO))
    expect(results()).not.toHaveTextContent(
      "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
    )
  })
})

describe("files are hashed as bytes", () => {
  it("gives the digest sha256sum gives, not the digest of the decoded text", async () => {
    // Arrange — four bytes that are not valid UTF-8. `FileReader.readAsText`,
    // which the old tool used, replaces each bad byte with U+FFFD, so it
    // hashed `efbfbdefbfbd0041` instead of `fffe0041` and answered
    // b4668f54… where `sha256sum` says 6e153708…
    const { container } = renderTool()
    const file = new File([new Uint8Array([0xff, 0xfe, 0x00, 0x41])], "a.bin")

    // Act
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) throw new Error("no file input")
    fireEvent.change(input, { target: { files: [file] } })

    // Assert
    await waitFor(() =>
      expect(results()).toHaveTextContent(
        "6e153708ea1302ccc480999bda6939c7aef6dd60531b7acfff00e81bde4986ab"
      )
    )
    expect(results()).not.toHaveTextContent(
      "b4668f548a3df2f3eb38b36d4764c527e362d5953b3ecdc1eeeab39d44fbad24"
    )
    expect(screen.getByText("a.bin")).toBeInTheDocument()
  })
})

describe("comparing a published checksum", () => {
  it("says which algorithm matched", async () => {
    // Arrange
    renderTool()
    type("Hello, World!")
    await waitFor(() => expect(results()).toHaveTextContent(SHA256_HELLO))

    // Act
    fireEvent.change(screen.getByRole("textbox", { name: /solishtirish/i }), {
      target: { value: SHA256_HELLO }
    })

    // Assert
    expect(screen.getByRole("status")).toHaveTextContent("Mos keldi — SHA-256")
  })

  it("reads a whole line copied off a release page", async () => {
    // Arrange
    renderTool()
    type("Hello, World!")
    await waitFor(() => expect(results()).toHaveTextContent(MD5_HELLO))

    // Act — the BSD `shasum` output shape, pasted verbatim
    fireEvent.change(screen.getByRole("textbox", { name: /solishtirish/i }), {
      target: { value: `MD5 (greeting.txt) = ${MD5_HELLO}` }
    })

    // Assert
    expect(screen.getByRole("status")).toHaveTextContent("Mos keldi — MD5")
  })

  it("names the algorithm even when the checksum does not match", async () => {
    // Arrange
    renderTool()
    type("Hello, World!")
    await waitFor(() => expect(results()).toHaveTextContent(SHA256_HELLO))

    // Act — 64 hex characters can only be a SHA-256
    fireEvent.change(screen.getByRole("textbox", { name: /solishtirish/i }), {
      target: { value: "0".repeat(64) }
    })

    // Assert
    expect(screen.getByRole("status")).toHaveTextContent(
      "Bu SHA-256 checksum'i"
    )
  })
})

describe("HMAC", () => {
  const PAYLOAD = "what do ya want for nothing?"

  it("asks for a key before computing anything", async () => {
    // Arrange + Act
    renderTool()
    type(PAYLOAD)
    choose("HMAC")

    // Assert — an empty result panel with no explanation reads as a bug
    expect(
      await screen.findByText(/Maxfiy kalit kiriting/i)
    ).toBeInTheDocument()
  })

  it("signs with the key, matching RFC 4231", async () => {
    // Arrange
    renderTool()
    type(PAYLOAD)
    choose("HMAC")

    // Act
    fireEvent.change(screen.getByLabelText("Maxfiy kalit"), {
      target: { value: "Jefe" }
    })

    // Assert
    await waitFor(() =>
      expect(results()).toHaveTextContent(
        "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
      )
    )
  })

  it("drops the MD5 row and says why", async () => {
    // Arrange + Act — Web Crypto has no MD5, so there is no HMAC-MD5. A row
    // silently disappearing from a list of five reads as a bug.
    renderTool()
    type(PAYLOAD)
    choose("HMAC")
    fireEvent.change(screen.getByLabelText("Maxfiy kalit"), {
      target: { value: "Jefe" }
    })

    // Assert
    await waitFor(() => expect(within(results()).queryByText("MD5")).toBeNull())
    expect(screen.getByText(/HMAC-MD5 ko'rsatilmaydi/i)).toBeInTheDocument()
  })
})

describe("output format", () => {
  it("switches every digest to Base64 at once", async () => {
    // Arrange
    renderTool()
    type("abc")
    await waitFor(() =>
      expect(results()).toHaveTextContent(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
      )
    )

    // Act
    choose("Base64")

    // Assert — the value an SRI attribute carries
    await waitFor(() =>
      expect(results()).toHaveTextContent(
        "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0="
      )
    )
  })
})

describe("clearing", () => {
  it("drops the work and keeps the settings", async () => {
    // Arrange — mode, format and signing key are settings, not work. Wiping
    // them on Escape means checking a second webhook payload starts by
    // retyping the secret.
    renderTool()
    choose("HMAC")
    choose("Base64")
    fireEvent.change(screen.getByLabelText("Maxfiy kalit"), {
      target: { value: "Jefe" }
    })
    type("what do ya want for nothing?")
    await waitFor(() =>
      expect(within(results()).getByText("SHA-256")).toBeInTheDocument()
    )

    // Act — the toolbar's Clear. The panel header carries a second one with
    // the same accessible name, and both call the same handler.
    fireEvent.click(screen.getAllByRole("button", { name: /Tozalash/i })[0])

    // Assert
    expect(source()).toHaveValue("")
    expect(screen.getByRole("radio", { name: "HMAC" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Base64" })).toBeChecked()
    expect(screen.getByLabelText("Maxfiy kalit")).toHaveValue("Jefe")
  })
})

describe("draft survival", () => {
  it("keeps the work across a remount, which is what a locale switch is", async () => {
    // Arrange
    const { unmount } = renderTool()
    type("Hello, World!")
    await waitFor(() => expect(results()).toHaveTextContent(SHA256_HELLO))

    // Act
    unmount()
    renderTool()

    // Assert
    expect(source()).toHaveValue("Hello, World!")
  })
})
