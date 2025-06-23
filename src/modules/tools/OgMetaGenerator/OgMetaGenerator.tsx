'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Eye, RefreshCw } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyButton } from '@/components/shared/CopyButton'
import { useCopyToClipboard } from 'usehooks-ts'
import { CodeHighlight, ShimmerButton } from '@/components/ui'

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

const OG_TYPES = [
  'website',
  'article',
  'book',
  'profile',
  'music.song',
  'music.album',
  'video.movie',
  'video.episode',
  'video.tv_show',
  'video.other',
]

const TWITTER_CARD_TYPES = ['summary', 'summary_large_image', 'app', 'player']

const SAMPLE_DATA: MetaData = {
  title: 'Webiston - Dasturlash va Web Texnologiyalar',
  description:
    "O'zbek tilida web dasturlash, React, Next.js va zamonaviy texnologiyalar haqida to'liq qo'llanma va foydali vositalar.",
  image: 'https://webiston.uz/og-image.jpg',
  url: 'https://webiston.uz',
  siteName: 'Webiston',
  type: 'website',
  locale: 'uz_UZ',
  twitterCard: 'summary_large_image',
  twitterSite: '@webiston_uz',
  twitterCreator: '@webiston_uz',
}

export default function OGMetaGeneratorPage() {
  const [metaData, setMetaData] = useState<MetaData>({
    title: '',
    description: '',
    image: '',
    url: '',
    siteName: '',
    type: 'website',
    locale: 'uz_UZ',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    twitterCreator: '',
  })

  const [generatedMeta, setGeneratedMeta] = useState<string>('')
  const [, copy] = useCopyToClipboard()

  const generateMeta = () => {
    const meta = []

    // Basic Open Graph tags
    if (metaData.title) {
      meta.push(`<meta property="og:title" content="${metaData.title}" />`)
      meta.push(`<meta name="twitter:title" content="${metaData.title}" />`)
    }

    if (metaData.description) {
      meta.push(`<meta property="og:description" content="${metaData.description}" />`)
      meta.push(`<meta name="twitter:description" content="${metaData.description}" />`)
      meta.push(`<meta name="description" content="${metaData.description}" />`)
    }

    if (metaData.image) {
      meta.push(`<meta property="og:image" content="${metaData.image}" />`)
      meta.push(`<meta name="twitter:image" content="${metaData.image}" />`)
    }

    if (metaData.url) {
      meta.push(`<meta property="og:url" content="${metaData.url}" />`)
      meta.push(`<meta name="twitter:url" content="${metaData.url}" />`)
      meta.push(`<link rel="canonical" href="${metaData.url}" />`)
    }

    if (metaData.siteName) {
      meta.push(`<meta property="og:site_name" content="${metaData.siteName}" />`)
    }

    if (metaData.type) {
      meta.push(`<meta property="og:type" content="${metaData.type}" />`)
    }

    if (metaData.locale) {
      meta.push(`<meta property="og:locale" content="${metaData.locale}" />`)
    }

    // Twitter specific tags
    if (metaData.twitterCard) {
      meta.push(`<meta name="twitter:card" content="${metaData.twitterCard}" />`)
    }

    if (metaData.twitterSite) {
      meta.push(`<meta name="twitter:site" content="${metaData.twitterSite}" />`)
    }

    if (metaData.twitterCreator) {
      meta.push(`<meta name="twitter:creator" content="${metaData.twitterCreator}" />`)
    }

    // Additional SEO tags
    if (metaData.title) {
      meta.push(`<title>${metaData.title}</title>`)
    }

    const generated = meta.join('\n')
    setGeneratedMeta(generated)
  }

  const loadSampleData = () => {
    setMetaData(SAMPLE_DATA)
  }

  const clearForm = () => {
    setMetaData({
      title: '',
      description: '',
      image: '',
      url: '',
      siteName: '',
      type: 'website',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
      twitterSite: '',
      twitterCreator: '',
    })
    setGeneratedMeta('')
  }

  const updateField = (field: keyof MetaData, value: string) => {
    setMetaData((prev) => ({ ...prev, [field]: value }))
  }

  // Real-time generation whenever metaData changes
  useEffect(() => {
    generateMeta()
  }, [metaData])

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader
        title="Open Graph Meta Generator"
        description="Ijtimoiy tarmoqlar uchun meta taglar yarating va SEO ni yaxshilang"
      />

      {/* Sample Data Section */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Tez boshlash</h3>
              <p className="text-sm text-zinc-400">
                Namuna ma'lumotlari bilan boshlang yoki barcha maydonlarni tozalang
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadSampleData}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Eye className="mr-2 h-4 w-4" />
                Namuna yuklash
              </Button>
              <Button onClick={clearForm} variant="outline" className="border-zinc-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tozalash
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Asosiy Ma'lumotlar</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Sahifa sarlavhasi *</label>
                  <Input
                    placeholder="Ajoyib web sahifa sarlavhasi"
                    value={metaData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Tavsiya: 50-60 belgi</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Tavsif *</label>
                  <Textarea
                    placeholder="Sahifa haqida qisqacha va aniq tavsif yozing..."
                    value={metaData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="border-zinc-700 bg-zinc-800"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Tavsiya: 150-160 belgi. Joriy: {metaData.description.length}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Rasm URL manzili</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={metaData.image}
                    onChange={(e) => updateField('image', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Tavsiya: 1200x630 piksel, 8MB dan kam</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Sahifa URL manzili</label>
                  <Input
                    placeholder="https://example.com/page"
                    value={metaData.url}
                    onChange={(e) => updateField('url', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Sayt nomi</label>
                  <Input
                    placeholder="Webiston"
                    value={metaData.siteName}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Qo'shimcha Sozlamalar</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Kontent turi</label>
                  <Select value={metaData.type} onValueChange={(value) => updateField('type', value)}>
                    <SelectTrigger className="border-zinc-700 bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OG_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Til kodi</label>
                  <Input
                    placeholder="uz_UZ"
                    value={metaData.locale}
                    onChange={(e) => updateField('locale', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Twitter Card turi</label>
                  <Select value={metaData.twitterCard} onValueChange={(value) => updateField('twitterCard', value)}>
                    <SelectTrigger className="border-zinc-700 bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TWITTER_CARD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Twitter sahifa (@username)</label>
                  <Input
                    placeholder="@webiston_uz"
                    value={metaData.twitterSite}
                    onChange={(e) => updateField('twitterSite', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Twitter muallif (@username)</label>
                  <Input
                    placeholder="@author_username"
                    value={metaData.twitterCreator}
                    onChange={(e) => updateField('twitterCreator', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                </div>
              </div>

              <ShimmerButton
                onClick={generateMeta}
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Meta teglar yaratish
              </ShimmerButton>
            </div>
          </Card>
        </div>

        {/* Generated Meta Tags */}
        <div className="space-y-6">
          {/* Preview */}
          {metaData.title && (
            <Card className="border-zinc-800 bg-zinc-900/80">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">Ko'rinish</h3>

                {/* Social Media Preview */}
                <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                  {metaData.image && (
                    <div
                      className="aspect-[1.91/1] bg-zinc-700 bg-cover bg-center"
                      style={{ backgroundImage: `url(${metaData.image})` }}
                    ></div>
                  )}
                  <div className="p-4">
                    <div className="mb-1 text-sm text-zinc-400">{metaData.url || 'example.com'}</div>
                    <div className="mb-1 line-clamp-2 font-medium text-zinc-100">{metaData.title}</div>
                    <div className="line-clamp-2 text-sm text-zinc-400">{metaData.description}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Generated Code */}
          {generatedMeta && (
            <Card className="border-zinc-800 bg-zinc-900/80">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-100">Yaratilgan Meta Teglar</h3>
                  <CopyButton text={generatedMeta} />
                </div>

                <div className="overflow-auto rounded-lg border border-zinc-700">
                  <CodeHighlight code={generatedMeta} language="html" showLineNumbers={true} />
                </div>
              </div>
            </Card>
          )}

          {/* Meta Tags Information */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Meta Teglar Haqida</h3>

              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <div className="mb-1 font-medium text-blue-400">Open Graph</div>
                  <div className="text-zinc-400">Facebook, LinkedIn va boshqa ijtimoiy tarmoqlar uchun</div>
                </div>

                <div className="rounded-lg bg-cyan-500/10 p-3">
                  <div className="mb-1 font-medium text-cyan-400">Twitter Cards</div>
                  <div className="text-zinc-400">Twitter (X) da go'zal ko'rinish uchun</div>
                </div>

                <div className="rounded-lg bg-green-500/10 p-3">
                  <div className="mb-1 font-medium text-green-400">SEO Teglar</div>
                  <div className="text-zinc-400">Qidiruv tizimlari uchun optimallashtirilgan</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h4 className="mb-3 font-medium text-zinc-200">Maslahatlar</h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  • <strong>Sarlavha:</strong> 50-60 belgi, qisqa va aniq
                </p>
                <p>
                  • <strong>Tavsif:</strong> 150-160 belgi, jozibali va informativ
                </p>
                <p>
                  • <strong>Rasm:</strong> 1200x630 piksel, JPEG/PNG format
                </p>
                <p>
                  • <strong>URL:</strong> To'liq va aniq manzil kiriting
                </p>
                <p>
                  • Meta teglarni HTML <code>&lt;head&gt;</code> qismiga joylashtiring
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
