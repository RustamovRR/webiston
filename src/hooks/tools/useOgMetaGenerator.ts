import { useState, useEffect, useCallback, useMemo } from 'react'
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

interface UseOgMetaGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Sample data constants
const SAMPLE_DATA: MetaData = {
  title: "Webiston - O'zbekistondagi Eng Yaxshi Web Development Platformasi",
  description:
    "O'zbek tilida web dasturlash, React, Next.js va zamonaviy texnologiyalar haqida professional qo'llanma. 10,000+ dasturchi bizdan foydalanadi va o'z mahoratini oshiradi.",
  image: 'https://webiston.uz/images/og-main.jpg',
  url: 'https://webiston.uz',
  siteName: 'Webiston',
  type: 'website',
  locale: 'uz_UZ',
  twitterCard: 'summary_large_image',
  twitterSite: '@webiston_uz',
  twitterCreator: '@webiston_uz',
}

// Preset template constants
const PRESET_TEMPLATES = [
  {
    label: 'Blog maqolasi',
    description: 'Maqola va blog post uchun',
    data: {
      title: "Web Dasturlash bo'yicha Professional Qo'llanma - 2024",
      description:
        "React, Next.js va zamonaviy web texnologiyalar haqida to'liq ma'lumot. Dasturchilar uchun foydali maslahatlar va amaliy misollar bilan.",
      image: 'https://webiston.uz/images/blog-cover.jpg',
      url: 'https://webiston.uz/blog/web-dasturlash-qollanma',
      siteName: 'Webiston',
      type: 'article',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
      twitterSite: '@webiston_uz',
      twitterCreator: '@webiston_uz',
    },
  },
  {
    label: 'Mahsulot sahifasi',
    description: 'E-commerce va landing page',
    data: {
      title: 'Premium Web Development Tools - Professional Package',
      description:
        "Dasturchilar uchun eng yaxshi vositalar to'plami. React, Vue, Angular va Node.js uchun professional komponentlar va shablonlar.",
      image: 'https://webiston.uz/images/product-showcase.jpg',
      url: 'https://webiston.uz/products/premium-tools',
      siteName: 'Webiston Store',
      type: 'website',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
      twitterSite: '@webiston_uz',
      twitterCreator: '@webiston_uz',
    },
  },
  {
    label: 'Video kontent',
    description: 'YouTube va video content',
    data: {
      title: 'React.js Tutorial - Noldan Professional Darajagacha',
      description:
        "React.js ni o'rganish uchun to'liq video kurs. Hooks, Context API, Redux va zamonaviy React pattern'lar bilan amaliy loyihalar yaratish.",
      image: 'https://webiston.uz/images/react-tutorial-thumb.jpg',
      url: 'https://webiston.uz/videos/react-tutorial-complete',
      siteName: 'Webiston Academy',
      type: 'video.other',
      locale: 'uz_UZ',
      twitterCard: 'player',
      twitterSite: '@webiston_uz',
      twitterCreator: '@webiston_uz',
    },
  },
  {
    label: 'Kompaniya sahifasi',
    description: 'Biznes va korporativ',
    data: {
      title: "Webiston - O'zbekistondagi Eng Yaxshi Web Development Kompaniyasi",
      description:
        'Professional web saytlar, mobil ilovalar va e-commerce yechimlar. 5+ yillik tajriba, 200+ muvaffaqiyatli loyiha va mijozlar ehtiyojiga moslashgan xizmatlar.',
      image: 'https://webiston.uz/images/company-hero.jpg',
      url: 'https://webiston.uz/about',
      siteName: 'Webiston',
      type: 'website',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
      twitterSite: '@webiston_uz',
      twitterCreator: '@webiston_uz',
    },
  },
  {
    label: 'Event sahifasi',
    description: 'Tadbirlar va konferensiyalar',
    data: {
      title: 'Web Development Conference 2024 - Toshkentda Eng Katta Tech Event',
      description:
        "O'zbekistondagi eng yirik web development konferensiyasi. 50+ spikerlar, 1000+ ishtirokchi, networking va yangi texnologiyalar bilan tanishish imkoniyati.",
      image: 'https://webiston.uz/images/conference-2024.jpg',
      url: 'https://webiston.uz/events/web-dev-conference-2024',
      siteName: 'Webiston Events',
      type: 'website',
      locale: 'uz_UZ',
      twitterCard: 'summary_large_image',
      twitterSite: '@webiston_uz',
      twitterCreator: '@webiston_uz',
    },
  },
]

// OG Types with descriptions
const OG_TYPES = [
  { value: 'website', label: 'Website', description: 'Oddiy web sahifa' },
  { value: 'article', label: 'Article', description: 'Maqola va blog post' },
  { value: 'book', label: 'Book', description: 'Kitob va nashr' },
  { value: 'profile', label: 'Profile', description: 'Shaxsiy profil' },
  { value: 'music.song', label: 'Music Song', description: 'Musiqa treki' },
  { value: 'music.album', label: 'Music Album', description: 'Musiqa albomi' },
  { value: 'video.movie', label: 'Video Movie', description: 'Film' },
  { value: 'video.episode', label: 'Video Episode', description: 'Serial epizod' },
  { value: 'video.tv_show', label: 'TV Show', description: 'TV dasturi' },
  { value: 'video.other', label: 'Video Other', description: 'Boshqa video' },
]

// Twitter Card Types
const TWITTER_CARD_TYPES = [
  { value: 'summary', label: 'Summary', description: 'Kichik rasm bilan' },
  { value: 'summary_large_image', label: 'Large Image', description: 'Katta rasm bilan' },
  { value: 'app', label: 'App', description: 'Mobil ilova' },
  { value: 'player', label: 'Player', description: 'Video/audio player' },
]

export const useOgMetaGenerator = ({ onSuccess, onError }: UseOgMetaGeneratorProps = {}) => {
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
  const [activeTab, setActiveTab] = useState('form')

  // Generate meta tags with enhanced logic
  const generateMeta = useCallback(() => {
    try {
      const ogMetas = []
      const twitterMetas = []
      const basicMetas = []

      // Basic HTML meta tags
      if (metaData.title) {
        basicMetas.push(`<title>${metaData.title}</title>`)
      }

      if (metaData.description) {
        basicMetas.push(`<meta name="description" content="${metaData.description}" />`)
      }

      // Open Graph meta tags
      if (metaData.type) {
        ogMetas.push(`<meta property="og:type" content="${metaData.type}" />`)
      }

      if (metaData.title) {
        ogMetas.push(`<meta property="og:title" content="${metaData.title}" />`)
      }

      if (metaData.description) {
        ogMetas.push(`<meta property="og:description" content="${metaData.description}" />`)
      }

      if (metaData.url) {
        ogMetas.push(`<meta property="og:url" content="${metaData.url}" />`)
      }

      if (metaData.image) {
        ogMetas.push(`<meta property="og:image" content="${metaData.image}" />`)
        ogMetas.push(`<meta property="og:image:alt" content="${metaData.title || 'Image'}" />`)
      }

      if (metaData.siteName) {
        ogMetas.push(`<meta property="og:site_name" content="${metaData.siteName}" />`)
      }

      if (metaData.locale) {
        ogMetas.push(`<meta property="og:locale" content="${metaData.locale}" />`)
      }

      // Twitter meta tags
      if (metaData.twitterCard) {
        twitterMetas.push(`<meta name="twitter:card" content="${metaData.twitterCard}" />`)
      }

      if (metaData.twitterSite) {
        twitterMetas.push(`<meta name="twitter:site" content="${metaData.twitterSite}" />`)
      }

      if (metaData.twitterCreator) {
        twitterMetas.push(`<meta name="twitter:creator" content="${metaData.twitterCreator}" />`)
      }

      if (metaData.title) {
        twitterMetas.push(`<meta name="twitter:title" content="${metaData.title}" />`)
      }

      if (metaData.description) {
        twitterMetas.push(`<meta name="twitter:description" content="${metaData.description}" />`)
      }

      if (metaData.image) {
        twitterMetas.push(`<meta name="twitter:image" content="${metaData.image}" />`)
        twitterMetas.push(`<meta name="twitter:image:alt" content="${metaData.title || 'Image'}" />`)
      }

      if (metaData.url) {
        twitterMetas.push(`<meta name="twitter:url" content="${metaData.url}" />`)
      }

      // Combine all meta tags with comments
      const allMetas = []

      if (basicMetas.length > 0) {
        allMetas.push('<!-- Basic Meta Tags -->')
        allMetas.push(...basicMetas)
        allMetas.push('')
      }

      if (ogMetas.length > 0) {
        allMetas.push('<!-- Open Graph Meta Tags -->')
        allMetas.push(...ogMetas)
        allMetas.push('')
      }

      if (twitterMetas.length > 0) {
        allMetas.push('<!-- Twitter Meta Tags -->')
        allMetas.push(...twitterMetas)
        allMetas.push('')
      }

      // Additional SEO tags
      allMetas.push('<!-- Additional SEO Tags -->')
      allMetas.push(`<meta name="robots" content="index, follow" />`)
      allMetas.push(`<meta name="googlebot" content="index, follow" />`)

      if (metaData.url) {
        allMetas.push(`<link rel="canonical" href="${metaData.url}" />`)
      }

      const generated = allMetas.join('\n')
      setGeneratedMeta(generated)

      // Create formatted version with proper HTML structure
      const formatted = [
        '<!DOCTYPE html>',
        `<html lang="${metaData.locale.replace('_', '-') || 'uz-UZ'}">`,
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '',
        ...allMetas.map((tag) => `  ${tag}`),
        '',
        '  <!-- Additional Technical Meta Tags -->',
        '  <meta name="format-detection" content="telephone=no">',
        '  <meta name="mobile-web-app-capable" content="yes">',
        '</head>',
        '<body>',
        '  <!-- Your content here -->',
        '</body>',
        '</html>',
      ].join('\n')

      setFormattedMeta(formatted)
      onSuccess?.('Meta taglar muvaffaqiyatli yaratildi')
    } catch (error) {
      onError?.('Meta taglar yaratishda xatolik yuz berdi')
    }
  }, [metaData, onSuccess, onError])

  // Load sample data
  const loadSampleData = useCallback(() => {
    setMetaData(SAMPLE_DATA)
    onSuccess?.("Demo ma'lumotlar yuklandi")
  }, [onSuccess])

  // Load template
  const loadTemplate = useCallback(
    (templateData: Partial<MetaData>) => {
      setMetaData((prev) => ({ ...prev, ...templateData }))
      onSuccess?.('Shablon yuklandi')
    },
    [onSuccess],
  )

  // Clear form
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

  // Update field with validation
  const updateField = useCallback(
    (field: keyof MetaData, value: string) => {
      // Basic validation
      if (field === 'title' && value.length > 70) {
        onError?.('Sarlavha 70 belgidan oshmasligi kerak')
        return
      }
      if (field === 'description' && value.length > 200) {
        onError?.('Tavsif 200 belgidan oshmasligi kerak')
        return
      }
      if (field === 'url' && value && !value.match(/^https?:\/\//)) {
        value = 'https://' + value
      }

      setMetaData((prev) => ({ ...prev, [field]: value }))
    },
    [onError],
  )

  // Copy to clipboard
  const handleCopy = useCallback(
    async (content?: string) => {
      const textToCopy = content || generatedMeta
      if (!textToCopy) {
        onError?.('Nusxalash uchun matn mavjud emas')
        return
      }

      try {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        onSuccess?.('Meta taglar nusxalandi')
      } catch (error) {
        onError?.('Nusxalashda xatolik yuz berdi')
      }
    },
    [generatedMeta, onSuccess, onError],
  )

  // Download meta tags
  const downloadMeta = useCallback(
    (format: 'raw' | 'formatted' = 'raw') => {
      const content = format === 'formatted' ? formattedMeta : generatedMeta
      if (!content) {
        onError?.('Yuklab olish uchun meta taglar mavjud emas')
        return
      }

      try {
        const filename = format === 'formatted' ? `meta-tags-${Date.now()}.html` : `meta-tags-${Date.now()}.txt`
        const blob = new Blob([content], { type: format === 'formatted' ? 'text/html' : 'text/plain' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(url)
        onSuccess?.('Meta taglar yuklab olindi')
      } catch (error) {
        onError?.('Faylni yuklab olishda xatolik yuz berdi')
      }
    },
    [generatedMeta, formattedMeta, onSuccess, onError],
  )

  // Statistics
  const stats = useMemo(() => {
    const titleLength = metaData.title.length
    const descriptionLength = metaData.description.length
    const fieldsCompleted = Object.values(metaData).filter((value) => value.trim() !== '').length

    return {
      titleLength,
      descriptionLength,
      fieldsCompleted,
      totalFields: Object.keys(metaData).length,
    }
  }, [metaData])

  // Input statistics
  const inputStats = useMemo(
    () => [
      { label: 'maydon', value: stats.fieldsCompleted },
      { label: 'sarlavha', value: stats.titleLength },
      { label: 'tavsif', value: stats.descriptionLength },
    ],
    [stats],
  )

  // Output statistics
  const outputStats = useMemo(
    () => [
      { label: 'taglar', value: generatedMeta.split('\n').filter((line) => line.trim()).length },
      { label: 'belgi', value: generatedMeta.length },
      { label: 'qator', value: generatedMeta.split('\n').length },
    ],
    [generatedMeta],
  )

  // Auto-generate when data changes
  useEffect(() => {
    if (metaData.title || metaData.description || metaData.url) {
      generateMeta()
    }
  }, [metaData, generateMeta])

  // Preview info for social media
  const previewInfo = useMemo(
    () => ({
      title: metaData.title || 'Sarlavha kiritilmagan',
      description: metaData.description || 'Tavsif kiritilmagan',
      image: metaData.image || '/placeholder-image.jpg',
      url: metaData.url || 'https://example.com',
      siteName: metaData.siteName || 'Sayt nomi',
    }),
    [metaData],
  )

  return {
    // State
    metaData,
    generatedMeta,
    formattedMeta,
    copied,
    activeTab,
    stats,
    inputStats,
    outputStats,
    previewInfo,

    // Data
    presetTemplates: PRESET_TEMPLATES,
    ogTypes: OG_TYPES,
    twitterCardTypes: TWITTER_CARD_TYPES,

    // Actions
    generateMeta,
    loadSampleData,
    loadTemplate,
    clearForm,
    updateField,
    handleCopy,
    downloadMeta,
    setActiveTab,
  }
}
