"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"

function RecorderSkeleton() {
  const t = useTranslations("Common")

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="rounded-xl border border-border bg-card/80 p-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <div className="text-lg text-muted-foreground">{t("loading")}</div>
        </div>
      </div>
    </div>
  )
}

// `react-media-recorder` pulls in `extendable-media-recorder-wav-encoder`,
// which calls `new Worker(...)` at MODULE scope. There is no Worker on the
// server, so merely importing this tool crashes any server render — including
// the build's prerender pass. `ssr: false` keeps the import in the browser.
//
// This wrapper already existed but was never wired up: the page imported
// `CameraRecorder` from `@/modules/tools` directly.
const CameraRecorder = dynamic(
  () =>
    import("@/modules/tools").then((mod) => ({ default: mod.CameraRecorder })),
  { ssr: false, loading: () => <RecorderSkeleton /> }
)

export function CameraRecorderClient() {
  return <CameraRecorder />
}
