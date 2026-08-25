import { Button } from "@webiston/ui/primitives/button"
import { useCallback, useEffect, useState } from "react"

import type { Format } from "../../lib/capture"
import { fileName, saveBlob, toFormat, toPdf } from "./export"

interface Shot {
  dataUrl: string
  width: number
  height: number
  clamped: boolean
  requestedHeight: number
  pendingImages: number
  innerScroll: boolean
  title: string
}

type State =
  | { status: "loading" }
  | { status: "expired" }
  | { status: "ready"; shot: Shot; blob: Blob }

/** What the visitor can walk away with. PNG is the capture itself. */
type Export = Format | "pdf"

/**
 * WXT derives this union from `public/_locales`, so a typo is a compile error
 * rather than a button with no label. Widening it to `string` is what `tsc`
 * rejected here, which is the type doing exactly what it is for.
 */
type MessageKey = Parameters<typeof browser.i18n.getMessage>[0]

const t = (key: MessageKey, ...args: string[]) =>
  browser.i18n.getMessage(key, args) || key

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function App() {
  const [state, setState] = useState<State>({ status: "loading" })
  const [busy, setBusy] = useState<Export>()
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState<string>()

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("id")
    if (!id) return setState({ status: "expired" })

    void (async () => {
      const shot = (await browser.runtime.sendMessage({
        type: "take-result",
        id
      })) as Shot | null
      if (!shot) return setState({ status: "expired" })
      const blob = await (await fetch(shot.dataUrl)).blob()
      setState({ status: "ready", shot, blob })
      document.title = `${shot.title} — ${shot.width}×${shot.height}`
    })()
  }, [])

  const save = useCallback(
    async (kind: Export) => {
      if (state.status !== "ready" || busy) return
      setNotice(undefined)
      setBusy(kind)
      try {
        const out =
          kind === "pdf"
            ? await toPdf(state.blob)
            : await toFormat(state.blob, kind)
        if (!out) {
          setNotice(t(kind === "pdf" ? "errPdfFailed" : "errJpegTooLarge"))
          return
        }
        saveBlob(out, fileName(state.shot.title, kind))
      } catch {
        // `createImageBitmap` THROWS on an image past the decoder's limits
        // rather than returning null, and a 65,000px capture can reach it.
        // Without this the button simply re-enabled and said nothing, which
        // reads as "the extension is broken" — the PNG is still right there.
        setNotice(t(kind === "pdf" ? "errPdfFailed" : "errJpegTooLarge"))
      } finally {
        setBusy(undefined)
      }
    },
    [state, busy]
  )

  const copy = useCallback(async () => {
    if (state.status !== "ready") return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": state.blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard writes need focus; if the user clicked away mid-write there
      // is nothing to recover, and the download button is right there.
    }
  }, [state])

  /**
   * The two shortcuts the hands already know. Ctrl/Cmd+S in a browser saves
   * the HTML of the viewer page, which is never what anyone wanted here, so
   * it is taken over. Ctrl/Cmd+C is only taken over when NOTHING is selected —
   * copying selected text has to keep working, or the page feels broken.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return
      if (event.key === "s") {
        event.preventDefault()
        void save("png")
      }
      if (event.key === "c" && !window.getSelection()?.toString()) {
        event.preventDefault()
        void copy()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [save, copy])

  if (state.status === "loading") {
    return (
      <main className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">{t("viewerLoading")}</p>
      </main>
    )
  }

  if (state.status === "expired") {
    return (
      <main className="flex h-full items-center justify-center px-6">
        <p className="max-w-md text-center text-muted-foreground text-sm">
          {t("viewerExpired")}
        </p>
      </main>
    )
  }

  const { shot } = state
  const label = (kind: Export, idle: MessageKey) =>
    busy === kind ? t("preparing") : t(idle)

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-border border-b bg-background/85 px-5 py-3 backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-medium text-foreground text-sm">
            {shot.title}
          </h1>
          <p className="text-muted-foreground text-xs">
            {shot.width}×{shot.height} · {formatBytes(state.blob.size)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button size="sm" disabled={!!busy} onClick={() => void save("png")}>
            {label("png", "downloadPng")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!busy}
            onClick={() => void save("jpeg")}
          >
            {label("jpeg", "downloadJpeg")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!busy}
            onClick={() => void save("pdf")}
          >
            {label("pdf", "downloadPdf")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void copy()}>
            {copied ? t("copied") : t("copy")}
          </Button>
        </div>
      </header>

      {notice && (
        <p className="border-border border-b bg-muted px-5 py-2 text-destructive text-xs">
          {notice}
        </p>
      )}

      {shot.pendingImages > 0 && (
        // Said, not hidden: some pages hold an image open forever, and the
        // deadline that protects the screenshot is also the thing that can
        // cost it a picture. The user is the one who knows if it mattered.
        <p className="border-border border-b bg-muted px-5 py-2 text-muted-foreground text-xs">
          {t("someImagesPending", String(shot.pendingImages))}
        </p>
      )}

      {shot.innerScroll && (
        // Not an error and not hidden. This page scrolls a panel, not the
        // document, so `captureBeyondViewport` has nothing beyond the
        // viewport to render — the honest answer is a correct picture of what
        // was on screen plus the reason it stops there.
        <p className="border-border border-b bg-muted px-5 py-2 text-muted-foreground text-xs">
          {t("innerScroll")}
        </p>
      )}

      {shot.clamped && (
        // Said out loud, with the numbers. A tool that silently returns less
        // than the whole page is the tool this one exists to replace.
        <p className="border-border border-b bg-muted px-5 py-2 text-muted-foreground text-xs">
          {t("clamped", String(shot.height), String(shot.requestedHeight))}
        </p>
      )}

      <div className="shot-canvas flex-1 overflow-auto p-6">
        <img
          src={shot.dataUrl}
          alt={shot.title}
          width={shot.width}
          height={shot.height}
          className="mx-auto block h-auto max-w-full shadow-lg"
        />
      </div>
    </div>
  )
}
