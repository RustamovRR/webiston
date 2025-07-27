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
        {/* Platform Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <button className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            Facebook
          </button>
          <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
            Twitter
          </button>
          <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
            Telegram
          </button>
          <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
            LinkedIn
          </button>
          <button className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
            WhatsApp
          </button>
        </div>

        {/* Live Preview Content */}
        <div className="space-y-4">
          {/* Facebook/Open Graph Preview */}
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-zinc-700 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                <Share2 size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Facebook Preview</span>
            </div>

            <div className="rounded-lg border border-white/50 bg-white/80 p-3 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-800/80">
              {previewInfo.image && (
                <div className="mb-3">
                  <img
                    src={previewInfo.image}
                    alt="Facebook Preview"
                    className="h-40 w-full rounded-md object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <div className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  {previewInfo.siteName || 'SITE NAME'}
                </div>
                <div className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {previewInfo.title || 'Enter title to see preview...'}
                </div>
                <div className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {previewInfo.description || 'Enter description to see preview...'}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  {previewInfo.url || 'https://example.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Preview */}
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 dark:border-zinc-700 dark:from-sky-900/20 dark:to-cyan-900/20">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500">
                <Palette size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Twitter Card</span>
            </div>

            <div className="rounded-lg border border-white/50 bg-white/80 p-3 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-800/80">
              <div className="space-y-2">
                <div className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {previewInfo.title || 'Enter title to see preview...'}
                </div>
                <div className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {previewInfo.description || 'Enter description to see preview...'}
                </div>
                {previewInfo.image && (
                  <div className="mt-2">
                    <img
                      src={previewInfo.image}
                      alt="Twitter Preview"
                      className="h-32 w-full rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  {previewInfo.url || 'https://example.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Telegram Preview */}
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:border-zinc-700 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.54-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.49.24l.17-2.43 4.47-4.03c.19-.17-.04-.27-.3-.1L9.28 13.47l-2.38-.75c-.52-.16-.53-.52.11-.77l9.28-3.58c.43-.16.81.1.67.73z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Telegram Preview</span>
            </div>

            <div className="rounded-lg border border-white/50 bg-white/80 p-3 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-800/80">
              <div className="space-y-2">
                <div className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {previewInfo.title || 'Enter title to see preview...'}
                </div>
                <div className="line-clamp-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {previewInfo.description || 'Enter description to see preview...'}
                </div>
                {previewInfo.image && (
                  <div className="mt-2">
                    <img
                      src={previewInfo.image}
                      alt="Telegram Preview"
                      className="h-28 w-full rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="text-xs text-blue-500 dark:text-blue-400">
                  {previewInfo.url || 'https://example.com'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewPanel
