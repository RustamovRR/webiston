import { Eye, Globe, Share2 } from 'lucide-react'

interface MetaData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  locale: string
  twitterCard: string
  twitterSite: string
  twitterCreator: string
}

interface MetaPreviewProps {
  metaData: MetaData
  previewInfo: {
    facebook: {
      titleLength: number
      descriptionLength: number
      imageSize: string
    }
    twitter: {
      titleLength: number
      descriptionLength: number
      imageSize: string
    }
  }
}

export const MetaPreview = ({ metaData, previewInfo }: MetaPreviewProps) => {
  return (
    <div className="space-y-6">
      {/* Facebook Preview */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-zinc-200">Facebook/Meta Ko'rinishi</span>
        </div>

        <div className="rounded-lg border border-zinc-600/50 bg-zinc-900/50 p-4">
          {metaData.image && (
            <div className="mb-3 h-40 overflow-hidden rounded bg-zinc-700/50">
              <img
                src={metaData.image}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-zinc-500">{metaData.siteName || 'SAYT NOMI'}</p>
            <h3 className="line-clamp-2 text-lg font-semibold text-zinc-200">
              {metaData.title || 'Sahifa sarlavhasi'}
            </h3>
            <p className="line-clamp-2 text-sm text-zinc-400">
              {metaData.description || 'Sahifa haqida qisqacha tavsif...'}
            </p>
            <p className="text-xs text-zinc-500">{metaData.url || 'example.com'}</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          <p>Sarlavha: {previewInfo.facebook.titleLength}/60 belgi</p>
          <p>Tavsif: {previewInfo.facebook.descriptionLength}/160 belgi</p>
          <p>Tavsiya etilgan rasm o'lchami: 1200x630px</p>
        </div>
      </div>

      {/* Twitter Preview */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Share2 size={16} className="text-sky-400" />
          <span className="text-sm font-medium text-zinc-200">Twitter Ko'rinishi</span>
        </div>

        <div className="rounded-lg border border-zinc-600/50 bg-zinc-900/50 p-4">
          {metaData.twitterCard === 'summary_large_image' && metaData.image && (
            <div className="mb-3 h-48 overflow-hidden rounded bg-zinc-700/50">
              <img
                src={metaData.image}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-zinc-200">
              {metaData.title || 'Sahifa sarlavhasi'}
            </h3>
            <p className="line-clamp-2 text-sm text-zinc-400">
              {metaData.description || 'Sahifa haqida qisqacha tavsif...'}
            </p>
            <p className="text-xs text-zinc-500">{metaData.url || 'example.com'}</p>
          </div>

          {metaData.twitterCard === 'summary' && metaData.image && (
            <div className="mt-3 h-20 w-20 overflow-hidden rounded bg-zinc-700/50">
              <img
                src={metaData.image}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          <p>Sarlavha: {previewInfo.twitter.titleLength}/70 belgi</p>
          <p>Tavsif: {previewInfo.twitter.descriptionLength}/200 belgi</p>
          <p>Tavsiya etilgan rasm: {metaData.twitterCard === 'summary_large_image' ? '1200x675px' : '144x144px'}</p>
        </div>
      </div>
    </div>
  )
}
