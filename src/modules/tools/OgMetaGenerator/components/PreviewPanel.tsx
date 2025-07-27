'use client'

import { Share2, Palette } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PreviewInfo {
  title: string
  description: string
  image: string
  url: string
  siteName: string
}

interface PreviewPanelProps {
  previewInfo: PreviewInfo
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewInfo }) => {
  const t = useTranslations('OgMetaGeneratorPage.PreviewPanel')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Social Media Preview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Facebook/Open Graph Preview */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Share2 size={16} />
              {t('facebook')}
            </h3>
            <div className="rounded-lg border border-zinc-300 bg-zinc-100/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              {previewInfo.image && (
                <div className="mb-3">
                  <img
                    src={previewInfo.image}
                    alt="Preview"
                    className="h-48 w-full rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg'
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 uppercase dark:text-zinc-500">{previewInfo.siteName}</div>
                <div className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {previewInfo.title}
                </div>
                <div className="line-clamp-3 text-xs text-zinc-600 dark:text-zinc-400">{previewInfo.description}</div>
              </div>
            </div>
          </div>

          {/* Twitter Preview */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Palette size={16} />
              {t('twitter')}
            </h3>
            <div className="rounded-lg border border-zinc-300 bg-zinc-100/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="space-y-3">
                <div className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {previewInfo.title}
                </div>
                <div className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{previewInfo.description}</div>
                {previewInfo.image && (
                  <div>
                    <img
                      src={previewInfo.image}
                      alt="Twitter Preview"
                      className="h-32 w-full rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg'
                      }}
                    />
                  </div>
                )}
                <div className="text-xs text-zinc-500 dark:text-zinc-500">{previewInfo.url}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewPanel
