'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with react-media-recorder Worker
const CameraRecorder = dynamic(() => import('@/modules/tools').then((mod) => ({ default: mod.CameraRecorder })), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <div className="text-lg text-zinc-400">Kamera yozuvchi yuklanmoqda...</div>
        </div>
      </div>
    </div>
  ),
})

export function CameraRecorderClient() {
  return <CameraRecorder />
}
