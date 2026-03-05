"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"

// Dynamic import to avoid SSR issues with microphone and audio context
const MicrophoneTest = dynamic(
  () =>
    import("@/modules/tools").then((mod) => ({ default: mod.MicrophoneTest })),
  {
    ssr: false,
    loading: () => <MicrophoneTestLoading />
  }
)

function MicrophoneTestLoading() {
  const t = useTranslations("MicrophoneTestPage.Loading")

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="rounded-xl border border-zinc-200 bg-white/80 p-8 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <div className="text-lg text-zinc-600 dark:text-zinc-400">
            {t("text")}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MicrophoneTestClient() {
  return <MicrophoneTest />
}
