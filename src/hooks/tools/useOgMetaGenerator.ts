import { useState, useEffect, useCallback } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

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

const SAMPLE_DATA: MetaData = {
  title: 'Webiston - Dasturlash va Web Texnologiyalar',
  description:
    "O'zbek tilida web dasturlash, React, Next.js va zamonaviy texnologiyalar haqida to'liq qo'llanma va foydali vositalar.",
  image: 'https://webiston.uz/logo.png',
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

export const useOgMetaGenerator = () => {
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
  const [formattedMeta, setFormattedMeta] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()
  const [activeTab, setActiveTab] = useState('form')

  const generateMeta = useCallback(() => {
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

    // Create formatted version with proper HTML structure
    const formatted = [
      '<!DOCTYPE html>',
      '<html lang="' + (metaData.locale || 'uz_UZ') + '">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '',
      '  <!-- Primary Meta Tags -->',
      ...meta.map((tag) => (tag.startsWith('<title>') ? `  ${tag}` : `  ${tag}`)),
      '',
      '  <!-- Additional Meta Tags -->',
      '  <meta name="robots" content="index, follow">',
      '  <meta name="googlebot" content="index, follow">',
      '</head>',
      '<body>',
      '  <!-- Your content here -->',
      '</body>',
      '</html>',
    ].join('\n')

    setFormattedMeta(formatted)
  }, [metaData])

  const loadSampleData = useCallback(() => {
    setMetaData(SAMPLE_DATA)
  }, [])

  const loadTemplate = useCallback((templateData: Partial<MetaData>) => {
    setMetaData((prev) => ({ ...prev, ...templateData }))
  }, [])

  const clearForm = useCallback(() => {
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
    setFormattedMeta('')
  }, [])

  const updateField = useCallback((field: keyof MetaData, value: string) => {
    setMetaData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCopy = useCallback(async () => {
    if (!generatedMeta) return
    try {
      await copy(generatedMeta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }, [generatedMeta, copy])

  const downloadMeta = useCallback(() => {
    if (!generatedMeta) return

    const content = [
      '<!-- Open Graph Meta Tags -->',
      "<!-- HTML <head> qismiga qo'ying -->",
      '',
      generatedMeta,
      '',
      "<!-- Meta teglar haqida ma'lumot -->",
      `<!-- Yaratilgan: ${new Date().toLocaleString()} -->`,
      '<!-- Webiston.uz - OG Meta Generator tomonidan yaratilgan -->',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meta-tags-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [generatedMeta])

  const downloadFormatted = useCallback(() => {
    if (!formattedMeta) return

    const blob = new Blob([formattedMeta], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `complete-page-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [formattedMeta])

  // Real-time generation whenever metaData changes
  useEffect(() => {
    generateMeta()
  }, [metaData, generateMeta])

  const previewInfo = metaData.title
    ? `Meta tag preview:\n\nSarlavha: ${metaData.title}\nTavsif: ${metaData.description}\nRasm: ${metaData.image || "Yo'q"}\nURL: ${metaData.url || "Yo'q"}\nSayt nomi: ${metaData.siteName || "Yo'q"}\nTuri: ${metaData.type}\nTil: ${metaData.locale}\nTwitter Card: ${metaData.twitterCard}\n\nGenerated meta tags count: ${generatedMeta.split('\n').filter((line) => line.trim()).length} tags`
    : "Ma'lumotlarni to'ldiring..."

  return {
    // State
    metaData,
    generatedMeta,
    formattedMeta,
    copied,
    activeTab,
    previewInfo,

    // Constants
    presetTemplates: PRESET_TEMPLATES,

    // Actions
    generateMeta,
    loadSampleData,
    loadTemplate,
    clearForm,
    updateField,
    handleCopy,
    downloadMeta,
    downloadFormatted,
    setActiveTab,
  }
}
