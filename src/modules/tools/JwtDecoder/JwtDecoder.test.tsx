import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import { encodeBase64 } from "@/lib/utils"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/jwt-decoder/uz.json"
import { JwtDecoder } from "./JwtDecoder"
import { useJwtDraftStore } from "./stores/jwtDraftStore"

/**
 * The tool, driven the way a visitor drives it.
 *
 * Everything asserted here is a defect this tool actually shipped: `atob`
 * turning a non-ASCII claim into an "invalid token" error, a token with no
 * `exp` reported as valid, a signature shown by default, and a draft that
 * vanished on a locale switch.
 */

const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <JwtDecoder />
    </NextIntlClientProvider>
  )
}

const field = () => screen.getByRole("textbox", { name: /JWT token/i })

const type = (value: string) => fireEvent.change(field(), { target: { value } })

const makeToken = (
  header: Record<string, unknown>,
  payload: Record<string, unknown>
) =>
  [
    encodeBase64(JSON.stringify(header), true),
    encodeBase64(JSON.stringify(payload), true),
    "sig"
  ].join(".")

const nowSeconds = () => Math.floor(Date.now() / 1000)

beforeEach(() => {
  // The draft store is module scope on purpose (it survives the locale
  // remount), which means it also survives between tests.
  useJwtDraftStore.getState().reset()
})

describe("decoding", () => {
  it("reads a claim that is not ASCII", async () => {
    // Arrange + Act — `atob` returns Latin-1, so this produced mojibake and
    // usually a `JSON.parse` throw reported as "invalid token format"
    renderTool()
    type(makeToken({ alg: "HS256" }, { name: "Alisher Oʻtkirov" }))

    // Assert
    expect(await screen.findByText(/Alisher Oʻtkirov/)).toBeInTheDocument()
  })

  it("names WHICH segment is broken", () => {
    // Arrange + Act — one generic sentence covered all three failures
    renderTool()
    type("!!!.eyJhIjoxfQ.sig")

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/base64url emas/i)
  })

  it("asks for three segments before anything else", () => {
    // Arrange + Act
    renderTool()
    type("only.two")

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/uchta qism/i)
  })
})

describe("expiry", () => {
  it("says a live token is still valid", async () => {
    // Arrange + Act
    renderTool()
    type(makeToken({ alg: "HS256" }, { exp: nowSeconds() + 3600 }))

    // Assert
    expect(await screen.findByText(/hali amal qiladi/i)).toBeInTheDocument()
  })

  it("says an expired token is expired", async () => {
    // Arrange + Act
    renderTool()
    type(makeToken({ alg: "HS256" }, { exp: nowSeconds() - 3600 }))

    // Assert
    expect(await screen.findByText(/muddati tugagan/i)).toBeInTheDocument()
  })

  it("refuses to call a token with no exp 'valid'", async () => {
    // Arrange + Act — the old code returned `isExpired: false` here, which
    // reads as "checked, and fine" for a claim that was never present
    renderTool()
    type(makeToken({ alg: "HS256" }, { sub: "1" }))

    // Assert
    expect(
      await screen.findByText(/muddat ko'rsatilmagan/i)
    ).toBeInTheDocument()
  })
})

describe("security posture", () => {
  it("keeps the signature hidden until asked", async () => {
    // Arrange
    renderTool()
    type(makeToken({ alg: "HS256" }, { sub: "1" }))
    expect(await screen.findByText(/Imzo yashirilgan/i)).toBeInTheDocument()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Ko'rsatish/i }))

    // Assert
    expect(screen.getByText("sig")).toBeInTheDocument()
  })

  it("calls out alg: none", async () => {
    // Arrange + Act — the oldest JWT attack there is, and the old tool
    // rendered it as just another algorithm name
    renderTool()
    type(makeToken({ alg: "none" }, { sub: "1", role: "admin" }))

    // Assert
    expect(await screen.findByRole("note")).toHaveTextContent(/alg: none/i)
  })
})

describe("draft survival", () => {
  it("keeps the token across a remount, which is what a locale switch is", () => {
    // Arrange
    const token = makeToken({ alg: "HS256" }, { sub: "1" })
    const { unmount } = renderTool()
    type(token)

    // Act
    unmount()
    renderTool()

    // Assert
    expect(field()).toHaveValue(token)
  })
})
