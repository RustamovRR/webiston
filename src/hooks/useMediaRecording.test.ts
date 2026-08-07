import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useMediaRecording } from "./useMediaRecording"

/**
 * The recorder, and the two things that go wrong quietly.
 *
 * A leaked object URL costs nothing visible — the page just holds every blob it
 * ever made until the tab dies — and an unsupported container makes the record
 * button do literally nothing. Both shipped in the tools this replaces, and
 * neither is the kind of thing anyone notices by clicking around.
 */

/** A MediaRecorder standing in for the browser's, driven by hand. */
class FakeRecorder {
  static supported = new Set(["audio/webm;codecs=opus"])
  static instances: FakeRecorder[] = []

  state: "inactive" | "recording" | "paused" = "inactive"
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  mimeType: string

  constructor(_stream: MediaStream, options?: { mimeType?: string }) {
    this.mimeType = options?.mimeType ?? "audio/webm"
    FakeRecorder.instances.push(this)
  }

  static isTypeSupported(type: string) {
    return FakeRecorder.supported.has(type)
  }

  start() {
    this.state = "recording"
  }

  pause() {
    this.state = "paused"
  }

  resume() {
    this.state = "recording"
  }

  stop() {
    this.state = "inactive"
    this.ondataavailable?.({ data: new Blob(["audio-bytes"]) })
    this.onstop?.()
  }
}

const created: string[] = []
const revoked: string[] = []

const stream = {
  getTracks: () => [],
  active: true
} as unknown as MediaStream

const options = {
  stream,
  candidates: ["audio/webm;codecs=opus", "audio/mp4"] as const,
  prefix: "mikrofon",
  max: 2
}

beforeEach(() => {
  created.length = 0
  revoked.length = 0
  FakeRecorder.instances = []
  FakeRecorder.supported = new Set(["audio/webm;codecs=opus"])

  vi.stubGlobal("MediaRecorder", FakeRecorder)
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn((_blob: Blob) => {
      const url = `blob:fake/${created.length}`
      created.push(url)
      return url
    }),
    revokeObjectURL: vi.fn((url: string) => {
      revoked.push(url)
    })
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useMediaRecording", () => {
  it("negotiates a container the browser will actually write", async () => {
    // Arrange + Act
    const { result } = renderHook(() => useMediaRecording(options))
    act(() => {
      result.current.start()
    })

    // Assert — the microphone tool hardcoded this string, and Safari does not
    // support it, so the constructor threw and record did nothing.
    expect(FakeRecorder.instances[0]?.mimeType).toBe("audio/webm;codecs=opus")
  })

  it("lets the browser choose when it supports none of the candidates", () => {
    // Arrange — a browser that likes nothing we offered.
    FakeRecorder.supported = new Set()

    // Act
    const { result } = renderHook(() => useMediaRecording(options))
    act(() => {
      result.current.start()
    })

    // Assert — a recorder built with no type at all, rather than a throw.
    expect(FakeRecorder.instances).toHaveLength(1)
    expect(result.current.isRecording).toBe(true)
  })

  it("keeps a finished recording and names it after the container", async () => {
    // Arrange
    const { result } = renderHook(() => useMediaRecording(options))

    // Act
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.stop()
    })

    // Assert
    await waitFor(() => {
      expect(result.current.recordings).toHaveLength(1)
    })
    expect(result.current.recordings[0].filename).toMatch(/^mikrofon-.*\.webm$/)
    // `blob.size`, not a `content-length` header off a `blob:` fetch — which is
    // usually absent, so most recordings used to report no size at all.
    expect(result.current.recordings[0].size).toBeGreaterThan(0)
  })

  it("revokes the oldest recording when the cap is reached", async () => {
    // Arrange — `max: 2`.
    const { result } = renderHook(() => useMediaRecording(options))

    // Act
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.start()
      })
      act(() => {
        result.current.stop()
      })
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => {
        expect(result.current.recordings.length).toBeLessThanOrEqual(2)
      })
    }

    // Assert — dropped from the list AND released, not merely forgotten.
    expect(result.current.recordings).toHaveLength(2)
    expect(revoked).toContain(created[0])
  })

  it("releases every recording on unmount", async () => {
    // Arrange
    const { result, unmount } = renderHook(() => useMediaRecording(options))
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.stop()
    })
    await waitFor(() => {
      expect(result.current.recordings).toHaveLength(1)
    })

    // Act
    unmount()

    // Assert — the leak that kept every blob alive for the lifetime of the tab.
    expect(revoked).toContain(created[0])
  })

  it("does not mint a URL for a recording that finishes after unmount", async () => {
    // Arrange — unmount stops a running recorder, which fires `onstop`. If that
    // handler builds a recording, it creates an object URL that no state update
    // will ever hold and no cleanup will ever revoke: a leak with no owner.
    const { result, unmount } = renderHook(() => useMediaRecording(options))
    act(() => {
      result.current.start()
    })

    // Act
    unmount()

    // Assert
    expect(created).toHaveLength(0)
  })
})
