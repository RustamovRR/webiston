import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useMediaAccess } from "./useMediaAccess"

/**
 * The behaviour this hook exists to guarantee: **nothing is requested until
 * something asks for it.**
 *
 * Both media tools used to call `getUserMedia` from a mount effect, so opening
 * the page raised the browser's permission dialog — and a refusal is sticky,
 * which meant an accidental dismissal broke the tool until the visitor went
 * into site settings. It is the kind of regression that is invisible in review
 * and obvious to every visitor, so it gets a test rather than a comment.
 */

function fakeTrack(overrides: Partial<MediaStreamTrack> = {}) {
  return {
    stop: vi.fn(),
    getSettings: () => ({ deviceId: "mic-1" }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ...overrides
  } as unknown as MediaStreamTrack
}

function fakeStream(track = fakeTrack()) {
  return { getTracks: () => [track], active: true } as unknown as MediaStream
}

/** A DOMException as the browser throws it: only `name` is load-bearing. */
function rejection(name: string) {
  const error = new Error(name)
  error.name = name
  return error
}

const getUserMedia = vi.fn()
const enumerateDevices = vi.fn()

beforeEach(() => {
  getUserMedia.mockReset().mockResolvedValue(fakeStream())
  enumerateDevices.mockReset().mockResolvedValue([
    { kind: "audioinput", deviceId: "mic-1", label: "Built-in Microphone" },
    { kind: "videoinput", deviceId: "cam-1", label: "FaceTime HD Camera" }
  ])

  vi.stubGlobal("navigator", {
    ...navigator,
    mediaDevices: {
      getUserMedia,
      enumerateDevices,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    },
    // Absent on purpose in most cases: Firefox and Safari do not implement the
    // camera and microphone descriptors, so this is the majority path.
    permissions: undefined
  })
  vi.stubGlobal("isSecureContext", true)
  Object.defineProperty(window, "isSecureContext", {
    value: true,
    configurable: true
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const audioOptions = {
  kind: "audioinput" as const,
  buildConstraints: () => ({ audio: true })
}

describe("useMediaAccess", () => {
  it("asks for nothing on mount", async () => {
    // Arrange + Act
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Assert — the whole point. No prompt, no enumeration, no device light.
    expect(getUserMedia).not.toHaveBeenCalled()
    expect(result.current.status).toBe("idle")
    expect(result.current.failure).toBeNull()
  })

  it("opens the device only when asked, and reports what opened", async () => {
    // Arrange
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start()
    })

    // Assert
    expect(getUserMedia).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe("live")
    expect(result.current.isLive).toBe(true)
    // The device that ACTUALLY opened, from `getSettings()` — not the one that
    // was asked for, which an `ideal` constraint is free to ignore.
    expect(result.current.deviceId).toBe("mic-1")
  })

  it("separates a refused permission from a missing device", async () => {
    // Arrange
    getUserMedia.mockRejectedValueOnce(rejection("NotAllowedError"))
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start()
    })

    // Assert — one generic error covered both before, and only one of them is
    // fixed by clicking Allow.
    expect(result.current.status).toBe("blocked")
    expect(result.current.failure).toBe("denied")
  })

  it("calls a device another application holds busy, not denied", async () => {
    // Arrange
    getUserMedia.mockRejectedValueOnce(rejection("NotReadableError"))
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start()
    })

    // Assert
    expect(result.current.failure).toBe("inUse")
  })

  it("retries without the device once when constraints cannot be met", async () => {
    // Arrange — the device was unplugged between the list being drawn and the
    // button being pressed. The default device is a better answer than an error.
    getUserMedia
      .mockRejectedValueOnce(rejection("OverconstrainedError"))
      .mockResolvedValueOnce(fakeStream())

    const { result } = renderHook(() =>
      useMediaAccess({
        kind: "audioinput",
        buildConstraints: (deviceId) => ({
          audio: deviceId ? { deviceId: { ideal: deviceId } } : true
        })
      })
    )

    // Act
    await act(async () => {
      await result.current.start("gone-device")
    })

    // Assert
    expect(getUserMedia).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe("live")
  })

  it("does not retry forever when the second attempt fails too", async () => {
    // Arrange
    getUserMedia
      .mockRejectedValueOnce(rejection("OverconstrainedError"))
      .mockRejectedValueOnce(rejection("NotFoundError"))

    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start("gone-device")
    })

    // Assert
    expect(getUserMedia).toHaveBeenCalledTimes(2)
    expect(result.current.failure).toBe("notFound")
  })

  it("releases every track when stopped", async () => {
    // Arrange
    const track = fakeTrack()
    getUserMedia.mockResolvedValueOnce(fakeStream(track))
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    await act(async () => {
      await result.current.start()
    })

    // Act
    act(() => {
      result.current.stop()
    })

    // Assert — a track left running is a camera light that stays on.
    expect(track.stop).toHaveBeenCalled()
    expect(result.current.status).toBe("idle")
  })

  it("releases the stream on unmount", async () => {
    // Arrange
    const track = fakeTrack()
    getUserMedia.mockResolvedValueOnce(fakeStream(track))
    const { result, unmount } = renderHook(() => useMediaAccess(audioOptions))

    await act(async () => {
      await result.current.start()
    })

    // Act
    unmount()

    // Assert — the leak that left devices open after navigating away.
    expect(track.stop).toHaveBeenCalled()
  })

  it("reports an insecure page before asking for anything", async () => {
    // Arrange — browsers only grant these over HTTPS, and no amount of
    // clicking Allow fixes an http:// URL.
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      configurable: true
    })
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start()
    })

    // Assert
    expect(getUserMedia).not.toHaveBeenCalled()
    expect(result.current.failure).toBe("insecureContext")
  })

  it("lists devices of its own kind only, with their labels intact", async () => {
    // Arrange
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start()
    })

    // Assert — the microphone tool used to rewrite these, so the name in the
    // picker stopped matching the name in the system settings.
    await waitFor(() => {
      expect(result.current.devices).toEqual([
        { deviceId: "mic-1", label: "Built-in Microphone" }
      ])
    })
    expect(result.current.hasDeviceLabels).toBe(true)
  })

  it("stays live on the old device when switching to one that fails", async () => {
    // Arrange — the first device opens, the second refuses. This is the case
    // that matters most, because the failure happens while hardware is ON.
    const first = fakeTrack()
    getUserMedia.mockResolvedValueOnce(fakeStream(first))
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    await act(async () => {
      await result.current.start()
    })

    getUserMedia.mockRejectedValueOnce(rejection("NotReadableError"))

    // Act
    await act(async () => {
      await result.current.select("mic-2")
    })

    // Assert — the visitor keeps the working microphone and is told why the
    // other one did not open. Dropping to `blocked` here would hide the whole
    // toolbar, including its stop button, while the device stayed OPEN: a
    // camera light with nothing on screen able to turn it off.
    expect(result.current.failure).toBe("inUse")
    expect(result.current.isLive).toBe(true)
    expect(result.current.stream).not.toBeNull()
    expect(first.stop).not.toHaveBeenCalled()
  })

  it("does not leave a stream open when the first attempt fails", async () => {
    // Arrange
    getUserMedia.mockRejectedValueOnce(rejection("NotAllowedError"))
    const { result } = renderHook(() => useMediaAccess(audioOptions))

    // Act
    await act(async () => {
      await result.current.start()
    })

    // Assert — nothing was open, so there is nothing to fall back to.
    expect(result.current.isLive).toBe(false)
    expect(result.current.stream).toBeNull()
  })
})
