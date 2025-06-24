'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Eye, RefreshCw, Download, Check, Globe, Zap, FileText, Code } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CodeHighlight, ShimmerButton, GradientTabs, ModeSwitch } from '@/components/ui'
import { DualTextPanel } from '@/components/shared/DualTextPanel'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'
import { useOgMetaGenerator } from '@/hooks/tools'
import { StatsDisplay, CopyButton } from '@/components/shared'
import { cn } from '@/lib/common'
import { Link2, ImageIcon, Settings, Palette } from 'lucide-react'

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

const PRESET_TEMPLATES = [
  {
    label: 'Blog maqolasi',
    data: {
      title: 'Ajoyib maqola sarlavhasi',
      description: 'Bu maqola haqida qisqacha va jozibali tavsif yozing. SEO uchun muhim.',
      type: 'article',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
    },
  },
  {
    label: 'Mahsulot sahifasi',
    data: {
      title: 'Ajoyib Mahsulot - Eng Yaxshi Tanlov',
      description: "Mahsulotning asosiy xususiyatlari va afzalliklari haqida qisqa ma'lumot.",
      type: 'website',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
    },
  },
  {
    label: 'Video kontent',
    data: {
      title: "Qiziqarli Video - Ko'rishga arziydi",
      description: 'Video haqida qisqacha tavsif. Nima haqida ekanligini tushuntiring.',
      type: 'video.other',
      locale: 'uz_UZ',
      twitterCard: 'player',
    },
  },
]

export default function OgMetaGenerator() {
  const {
    metaData,
    generatedMeta,
    formattedMeta,
    copied,
    activeTab,
    stats,
    inputStats,
    outputStats,
    previewInfo,
    presetTemplates,
    ogTypes,
    twitterCardTypes,
    generateMeta,
    loadSampleData,
    loadTemplate,
    clearForm,
    updateField,
    handleCopy,
    downloadMeta,
    setActiveTab,
  } = useOgMetaGenerator()

  const [outputFormat, setOutputFormat] = useState('raw')
  const toolColors = TOOL_COLOR_MAP['og-meta-generator']

  const tabOptions = [
    {
      value: 'form',
      label: "Ma'lumot Kiritish",
      icon: <Settings size={16} />,
    },
    {
      value: 'preview',
      label: "Ko'rinish",
      icon: <Eye size={16} />,
    },
  ]

  const formatOptions = [
    {
      value: 'raw',
      label: 'Meta Taglar',
      icon: <Code size={16} />,
    },
    {
      value: 'formatted',
      label: "To'liq HTML",
      icon: <FileText size={16} />,
    },
  ]

  const currentOutput = outputFormat === 'formatted' ? formattedMeta : generatedMeta
  const currentLanguage = outputFormat === 'formatted' ? 'html' : 'html'

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="OG Meta Generator"
        description="Ijtimoiy tarmoqlar uchun meta taglar yarating va SEO ni professional darajada yaxshilang"
      />

      {/* Mode Selection Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Tool Konfiguratsiya</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-zinc-500">Rejim Tanlang</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Ish rejimi:</h3>
          <GradientTabs options={tabOptions} value={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Templates Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Shablonlar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-500">Tez Tanlov</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Tayyor shablonlar:</h3>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presetTemplates.map((template, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                onClick={() => loadTemplate(template.data)}
              >
                <div className="text-sm font-medium text-zinc-200">{template.label}</div>
                <div className="mt-1 text-xs text-zinc-400">{template.description}</div>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Yuklash
                </Button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-4">
            <Button onClick={loadSampleData} variant="outline" size="sm">
              <Eye size={14} className="mr-2" />
              Demo Ma'lumot
            </Button>
            <Button onClick={clearForm} variant="outline" size="sm">
              <Zap size={14} className="mr-2" />
              Tozalash
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'form' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm font-medium text-zinc-300">Ma'lumot Kiritish</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-zinc-500">Form</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Globe size={16} />
                  Asosiy Ma'lumotlar
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Sarlavha *</label>
                    <Input
                      value={metaData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Sahifa sarlavhasi (70 belgigacha)"
                      className="border-zinc-700 bg-zinc-800/50"
                    />
                    <div className="mt-1 text-xs text-zinc-500">{metaData.title.length}/70 belgi</div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Tavsif *</label>
                    <Textarea
                      value={metaData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Sahifa haqida qisqacha tavsif (200 belgigacha)"
                      className="min-h-[100px] border-zinc-700 bg-zinc-800/50"
                    />
                    <div className="mt-1 text-xs text-zinc-500">{metaData.description.length}/200 belgi</div>
                  </div>

                  <div>
                    <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <ImageIcon size={16} />
                      Rasm URL
                    </label>
                    <Input
                      value={metaData.image}
                      onChange={(e) => updateField('image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="border-zinc-700 bg-zinc-800/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Link2 size={16} />
                      Sahifa URL
                    </label>
                    <Input
                      value={metaData.url}
                      onChange={(e) => updateField('url', e.target.value)}
                      placeholder="https://example.com"
                      className="border-zinc-700 bg-zinc-800/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Sayt Nomi</label>
                    <Input
                      value={metaData.siteName}
                      onChange={(e) => updateField('siteName', e.target.value)}
                      placeholder="Sayt yoki kompaniya nomi"
                      className="border-zinc-700 bg-zinc-800/50"
                    />
                  </div>
                </div>
              </div>

              {/* Type Selection */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Settings size={16} />
                  Tizim Sozlamalari
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Kontent Turi</label>
                    <Select value={metaData.type} onValueChange={(value) => updateField('type', value)}>
                      <SelectTrigger className="border-zinc-700 bg-zinc-800/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ogTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-zinc-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Twitter Card</label>
                    <Select value={metaData.twitterCard} onValueChange={(value) => updateField('twitterCard', value)}>
                      <SelectTrigger className="border-zinc-700 bg-zinc-800/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {twitterCardTypes.map((card) => (
                          <SelectItem key={card.value} value={card.value}>
                            <div>
                              <div className="font-medium">{card.label}</div>
                              <div className="text-xs text-zinc-500">{card.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Twitter Site</label>
                    <Input
                      value={metaData.twitterSite}
                      onChange={(e) => updateField('twitterSite', e.target.value)}
                      placeholder="@username"
                      className="border-zinc-700 bg-zinc-800/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">Twitter Creator</label>
                    <Input
                      value={metaData.twitterCreator}
                      onChange={(e) => updateField('twitterCreator', e.target.value)}
                      placeholder="@username"
                      className="border-zinc-700 bg-zinc-800/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Display */}
            <div className="mt-6 border-t border-zinc-800 pt-6">
              <h4 className="mb-3 text-sm font-medium text-zinc-300">Kiritilgan ma'lumotlar</h4>
              <StatsDisplay stats={inputStats} />
            </div>
          </div>

          {/* Output Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm font-medium text-zinc-300">Tool Natija</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-zinc-500">Meta Taglar</span>
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <GradientTabs options={formatOptions} value={outputFormat} onChange={setOutputFormat} />
            </div>

            {/* Generated Meta Tags */}
            <div className="space-y-4">
              {generatedMeta ? (
                <>
                  <CodeHighlight
                    code={generatedMeta}
                    language="html"
                    showLineNumbers={true}
                    className="max-h-96 overflow-y-auto"
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <CopyButton text={generatedMeta} size="sm" variant="outline" />
                    <Button onClick={() => downloadMeta('raw')} variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      TXT
                    </Button>
                    <Button onClick={() => downloadMeta('formatted')} variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      HTML
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <Code size={48} className="mx-auto mb-4 text-zinc-600" />
                  <div className="text-sm text-zinc-400">
                    Ma'lumotlarni to'ldiring, meta taglar avtomatik yaratiladi
                  </div>
                </div>
              )}
            </div>

            {/* Stats Display */}
            {generatedMeta && (
              <div className="mt-6 border-t border-zinc-800 pt-6">
                <h4 className="mb-3 text-sm font-medium text-zinc-300">Yaratilgan natija</h4>
                <StatsDisplay stats={outputStats} />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Ijtimoiy Tarmoq Ko'rinishi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-500">Preview</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Social Media Preview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Facebook/Open Graph Preview */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Share2 size={16} />
                  Facebook / Open Graph
                </h3>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
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
                    <div className="text-xs text-zinc-500 uppercase">{previewInfo.siteName}</div>
                    <div className="line-clamp-2 text-sm font-medium text-zinc-200">{previewInfo.title}</div>
                    <div className="line-clamp-3 text-xs text-zinc-400">{previewInfo.description}</div>
                  </div>
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Palette size={16} />
                  Twitter Card
                </h3>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="space-y-3">
                    <div className="line-clamp-2 text-sm font-medium text-zinc-200">{previewInfo.title}</div>
                    <div className="line-clamp-2 text-xs text-zinc-400">{previewInfo.description}</div>
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
                    <div className="text-xs text-zinc-500">{previewInfo.url}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className="text-blue-400" />
          Open Graph Meta nima uchun muhim?
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Asosiy foydalanish joylari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>Ijtimoiy tarmoqlar:</strong> Facebook, LinkedIn, WhatsApp'da chiroyli preview
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>Twitter Cards:</strong> Twitter'da professional ko'rinish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>SEO yaxshilash:</strong> Qidiruv tizimlari uchun batafsil ma'lumot
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>Klik darajasi:</strong> Jozibali preview orqali ko'proq bosish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <strong>Brand identity:</strong> Brendingiz uchun consistent ko'rinish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                <strong>Professional taassurot:</strong> Saytingiz haqida ijobiy fikr
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Sarlavha 70 belgidan oshmasligi kerak (optimal 50-60)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Tavsif 200 belgidan oshmasligi kerak (optimal 150-160)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                Rasm 1200x630 piksel o'lchamida bo'lishi kerak
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                Har bir sahifa uchun unique meta tag yarating
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Preview'ni turli platformalarda sinab ko'ring
              </li>
            </ul>

            <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
              <div className="text-sm text-blue-400">
                <strong>Eslatma:</strong> Meta taglar to'g'ri sozlangan bo'lsa, ijtimoiy tarmoqlarda sahifangiz
                professional va ishonchli ko'rinadi, bu esa ko'proq mijoz jalb qilishga yordam beradi.
              </div>
            </div>
          </div>
        </div>

        {/* Meta Tag Types Info */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 font-medium text-blue-400">Open Graph</div>
            <div className="text-sm text-zinc-400">
              Facebook, LinkedIn va WhatsApp kabi platformalar uchun asosiy meta taglar
            </div>
          </div>

          <div className="rounded-lg bg-purple-500/10 p-4">
            <div className="mb-2 font-medium text-purple-400">Twitter Cards</div>
            <div className="text-sm text-zinc-400">
              Twitter'da chiroyli va professional ko'rinish uchun maxsus formatlar
            </div>
          </div>

          <div className="rounded-lg bg-green-500/10 p-4">
            <div className="mb-2 font-medium text-green-400">SEO Meta</div>
            <div className="text-sm text-zinc-400">
              Google va boshqa qidiruv tizimlari uchun optimallashtirilgan taglar
            </div>
          </div>

          <div className="rounded-lg bg-orange-500/10 p-4">
            <div className="mb-2 font-medium text-orange-400">Schema.org</div>
            <div className="text-sm text-zinc-400">Tuzilgan ma'lumotlar uchun semantic web standartlari</div>
          </div>
        </div>
      </div>
    </div>
  )
}
