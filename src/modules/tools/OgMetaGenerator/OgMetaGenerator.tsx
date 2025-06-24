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

export default function OGMetaGeneratorPage() {
  const {
    metaData,
    generatedMeta,
    formattedMeta,
    copied,
    activeTab,
    previewInfo,
    presetTemplates,
    generateMeta,
    loadSampleData,
    loadTemplate,
    clearForm,
    updateField,
    handleCopy,
    downloadMeta,
    downloadFormatted,
    setActiveTab,
  } = useOgMetaGenerator()

  const [outputFormat, setOutputFormat] = useState('raw')
  const toolColors = TOOL_COLOR_MAP['og-meta-generator']

  const tabOptions = [
    {
      value: 'form',
      label: "Ma'lumot kiritish",
      icon: <Globe size={16} />,
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
      label: 'Meta taglar',
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

      {/* Tab Selection */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Rejim tanlang:</h3>
          <GradientTabs options={tabOptions} value={activeTab} onChange={setActiveTab} toolCategory="utilities" />
        </div>
      </div>

      {/* Templates */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Tez shablonlar:</h3>
          <div className="flex flex-wrap items-center gap-4">
            {presetTemplates.map((template, index) => (
              <Button
                key={index}
                onClick={() => loadTemplate(template.data)}
                variant="outline"
                size="sm"
                className="cursor-pointer border-zinc-700 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              >
                {template.label}
              </Button>
            ))}
            <Button
              onClick={loadSampleData}
              variant="outline"
              size="sm"
              className="cursor-pointer border-blue-500/50 text-xs text-blue-400 hover:border-blue-500 hover:text-blue-300"
            >
              <Eye size={14} className="mr-1" />
              Demo ma'lumot
            </Button>
            <Button
              onClick={clearForm}
              variant="outline"
              size="sm"
              className="cursor-pointer border-zinc-700 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            >
              <RefreshCw size={14} className="mr-1" />
              Tozalash
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'form' && (
        <>
          {/* Basic Information */}
          <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
            <h3 className="mb-6 text-lg font-semibold text-zinc-100">Asosiy Ma'lumotlar</h3>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Sahifa sarlavhasi *</label>
                  <Input
                    placeholder="Ajoyib web sahifa sarlavhasi"
                    value={metaData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Tavsiya: 50-60 belgi. Joriy: {metaData.title.length}</p>
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

              <div className="space-y-4">
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
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
            <h3 className="mb-6 text-lg font-semibold text-zinc-100">Qo'shimcha Sozlamalar</h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

              <div className="md:col-span-2 lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-200">Twitter muallif (@username)</label>
                <Input
                  placeholder="@author_username"
                  value={metaData.twitterCreator}
                  onChange={(e) => updateField('twitterCreator', e.target.value)}
                  className="border-zinc-700 bg-zinc-800"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Output Format Selection */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Chiqish formati:</h3>
          <ModeSwitch
            options={formatOptions}
            value={outputFormat}
            onChange={setOutputFormat}
            toolCategory="utilities"
          />
        </div>
      </div>

      {/* Controls */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShimmerButton onClick={generateMeta} variant="default" size="sm">
              <Share2 size={16} className="mr-2" />
              Meta teglar yaratish
            </ShimmerButton>
          </div>

          {generatedMeta && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              >
                {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                {copied ? 'Nusxalandi!' : 'Nusxalash'}
              </Button>

              <ShimmerButton
                onClick={outputFormat === 'formatted' ? downloadFormatted : downloadMeta}
                variant="outline"
                size="sm"
              >
                <Download size={16} className="mr-2" />
                {outputFormat === 'formatted' ? 'HTML yuklash' : 'Meta yuklash'}
              </ShimmerButton>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel - Only show when activeTab is 'preview' or when there's content */}
      {(activeTab === 'preview' || generatedMeta) && (
        <>
          {/* Social Media Preview */}
          {metaData.title && activeTab === 'preview' && (
            <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Ijtimoiy tarmoqlarda ko'rinish</h3>

              <div className="max-w-md overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
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
          )}

          {/* Main Panel with beautiful formatting */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Panel - Raw/Formatted View */}
            <div className={UI_PATTERNS.TERMINAL_PANEL.container}>
              <div className={UI_PATTERNS.TERMINAL_PANEL.header}>
                <div className="flex items-center gap-4">
                  <div className={UI_PATTERNS.TERMINAL_PANEL.dots}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full ${
                          i === 0 ? 'bg-red-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300">
                    {outputFormat === 'formatted' ? "To'liq HTML kod" : 'Meta teglar'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleCopy} variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
              <div className={`${UI_PATTERNS.TERMINAL_PANEL.content} bg-zinc-950/50`}>
                {currentOutput ? (
                  <CodeHighlight
                    code={currentOutput}
                    language={currentLanguage}
                    showLineNumbers={true}
                    className="h-full overflow-auto"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Ma'lumotlarni to'ldiring...
                  </div>
                )}
              </div>
              {currentOutput && (
                <div className={UI_PATTERNS.TERMINAL_PANEL.footer}>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {currentOutput.split('\n').length} qator • {currentOutput.length} belgi
                    </span>
                    <span>{outputFormat === 'formatted' ? 'HTML Document' : 'Meta Tags'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Info or Preview */}
            <div className={UI_PATTERNS.TERMINAL_PANEL.container}>
              <div className={UI_PATTERNS.TERMINAL_PANEL.header}>
                <div className="flex items-center gap-4">
                  <div className={UI_PATTERNS.TERMINAL_PANEL.dots}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full ${
                          i === 0 ? 'bg-red-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300">Ma'lumotlar</h3>
                </div>
              </div>
              <div className={`${UI_PATTERNS.TERMINAL_PANEL.content} bg-zinc-950/50 p-4`}>
                <div className="space-y-4 text-sm">
                  {metaData.title ? (
                    <>
                      <div>
                        <span className="text-zinc-400">Sarlavha:</span>
                        <p className="text-zinc-200">{metaData.title}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">Tavsif:</span>
                        <p className="text-zinc-200">{metaData.description}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">URL:</span>
                        <p className="text-zinc-200">{metaData.url || "Yo'q"}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">Rasm:</span>
                        <p className="text-zinc-200">{metaData.image || "Yo'q"}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">Turi:</span>
                        <p className="text-zinc-200">{metaData.type}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400">Twitter Card:</span>
                        <p className="text-zinc-200">{metaData.twitterCard}</p>
                      </div>
                      <div className="border-t border-zinc-700 pt-4">
                        <span className="text-zinc-400">Statistika:</span>
                        <div className="mt-2 space-y-1 text-xs">
                          <p>Meta teglar: {generatedMeta.split('\n').filter((line) => line.trim()).length}</p>
                          <p>Sarlavha uzunligi: {metaData.title.length} belgi</p>
                          <p>Tavsif uzunligi: {metaData.description.length} belgi</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-zinc-500">
                      <p>Ma'lumotlarni to'ldiring...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Help Section */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className={toolColors.text.replace('text-', 'text-')} />
          Meta teglar haqida ma'lumot
        </h3>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 font-medium text-blue-400">Open Graph</div>
            <div className="text-sm text-zinc-400">
              Facebook, LinkedIn va boshqa ijtimoiy tarmoqlar uchun. Kontentingizni go'zal ko'rinishda baham ko'rish
              imkonini beradi.
            </div>
          </div>

          <div className="rounded-lg bg-cyan-500/10 p-4">
            <div className="mb-2 font-medium text-cyan-400">Twitter Cards</div>
            <div className="text-sm text-zinc-400">
              Twitter (X) da professional ko'rinish. Turli xil card turlari: summary, large image, player va app.
            </div>
          </div>

          <div className="rounded-lg bg-green-500/10 p-4">
            <div className="mb-2 font-medium text-green-400">SEO Teglar</div>
            <div className="text-sm text-zinc-400">
              Qidiruv tizimlari uchun optimallashtirilgan meta ma'lumotlar va canonical linklar.
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-700 pt-6">
          <h4 className="mb-3 font-medium text-zinc-200">Muhim maslahatlar:</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>Sarlavha:</strong> 50-60 belgi, qisqa va aniq
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>Tavsif:</strong> 150-160 belgi, jozibali va informativ
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>Rasm:</strong> 1200x630 piksel, JPEG/PNG format
              </li>
            </ul>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>URL:</strong> To'liq va aniq manzil kiriting
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Meta teglarni HTML <code>&lt;head&gt;</code> qismiga joylashtiring
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                Har bir sahifa uchun alohida meta teglar yarating
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
