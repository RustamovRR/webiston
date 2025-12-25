import { useState, useCallback } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import { useTranslations } from 'next-intl'
import { LOREM_WORDS, ALTERNATIVE_TEXTS, LOREM_SAMPLE_SETTINGS } from '@/constants/tool-constants'

export type GenerationType = 'paragraphs' | 'sentences' | 'words' | 'bytes'

export interface LoremSettings {
  generationType: GenerationType
  amount: number
  textType: string
  startWithLorem: boolean
}

export const useLoremIpsum = () => {
  const [generatedText, setGeneratedText] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()
  const t = useTranslations('LoremIpsumPage')

  const [settings, setSettings] = useState<LoremSettings>(LOREM_SAMPLE_SETTINGS)

  const getRandomWord = useCallback((words: string[]) => {
    return words[Math.floor(Math.random() * words.length)]
  }, [])

  const generateSentence = useCallback(
    (words: string[], minWords = 5, maxWords = 15) => {
      const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
      const sentence = []

      for (let i = 0; i < wordCount; i++) {
        sentence.push(getRandomWord(words))
      }

      // Capitalize first word
      sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1)

      return sentence.join(' ') + '.'
    },
    [getRandomWord]
  )

  const generateParagraph = useCallback(
    (words: string[], sentenceCount = 0) => {
      if (sentenceCount === 0) {
        sentenceCount = Math.floor(Math.random() * 5) + 3 // 3-7 sentences
      }

      const sentences = []
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence(words))
      }

      return sentences.join(' ')
    },
    [generateSentence]
  )

  const generateText = useCallback(() => {
    // Clear previous text first
    setGeneratedText('')

    const selectedTextType = ALTERNATIVE_TEXTS[settings.textType as keyof typeof ALTERNATIVE_TEXTS]
    const words = selectedTextType.words
    let result = ''

    switch (settings.generationType) {
      case 'paragraphs':
        const paragraphs = []
        for (let i = 0; i < settings.amount; i++) {
          let paragraph = generateParagraph(words)
          // Start first paragraph with "Lorem ipsum" if enabled
          if (i === 0 && settings.startWithLorem && settings.textType === 'cicero') {
            paragraph = 'Lorem ipsum ' + paragraph.slice(paragraph.indexOf(' ') + 1)
          }
          paragraphs.push(paragraph)
        }
        result = paragraphs.join('\n\n')
        break

      case 'sentences':
        const sentences = []
        for (let i = 0; i < settings.amount; i++) {
          let sentence = generateSentence(words)
          if (i === 0 && settings.startWithLorem && settings.textType === 'cicero') {
            sentence = 'Lorem ipsum ' + sentence.slice(sentence.indexOf(' ') + 1)
          }
          sentences.push(sentence)
        }
        result = sentences.join(' ')
        break

      case 'words':
        const wordList = []
        for (let i = 0; i < settings.amount; i++) {
          if (i === 0 && settings.startWithLorem && settings.textType === 'cicero') {
            wordList.push('Lorem')
            if (settings.amount > 1) {
              wordList.push('ipsum')
              i++ // Skip one iteration since we added two words
            }
          } else {
            wordList.push(getRandomWord(words))
          }
        }
        result = wordList.join(' ')
        break

      case 'bytes':
        let text = ''
        while (text.length < settings.amount) {
          text += getRandomWord(words) + ' '
        }
        result = text.slice(0, settings.amount)
        break
    }

    // Set the new generated text
    setGeneratedText(result)
  }, [settings, generateParagraph, generateSentence, getRandomWord])

  const clearText = useCallback(() => {
    setGeneratedText('')
  }, [])

  const loadSample = useCallback(() => {
    setSettings(LOREM_SAMPLE_SETTINGS)
    // Generate after a small delay to ensure state is updated
    setTimeout(() => {
      generateText()
    }, 100)
  }, [generateText])

  const updateSettings = useCallback((updates: Partial<LoremSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleCopy = useCallback(async () => {
    if (!generatedText) return
    try {
      await copy(generatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }, [generatedText, copy])

  const downloadText = useCallback(() => {
    if (!generatedText) return

    const content = [
      '# Lorem Ipsum Generator - Yaratilgan Matn',
      '',
      `Yaratilgan: ${new Date().toLocaleString()}`,
      `Turi: ${settings.generationType}`,
      `Miqdor: ${settings.amount}`,
      `Matn turi: ${ALTERNATIVE_TEXTS[settings.textType as keyof typeof ALTERNATIVE_TEXTS].name}`,
      '',
      '---',
      '',
      generatedText,
      '',
      '---',
      '',
      'Webiston.uz - Lorem Ipsum Generator tomonidan yaratilgan',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lorem-ipsum-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [generatedText, settings])

  const getTextStats = useCallback(() => {
    if (!generatedText) return []

    return [
      { label: t('Stats.characters'), value: generatedText.length },
      {
        label: t('Stats.words'),
        value: generatedText.split(/\s+/).filter((word) => word.length > 0).length,
      },
      { label: t('Stats.lines'), value: generatedText.split('\n').length },
      {
        label: t('Stats.paragraphs'),
        value: generatedText.split('\n\n').filter((p) => p.trim()).length,
      },
    ]
  }, [generatedText, t])

  const getTextInfo = useCallback(() => {
    if (!generatedText) return ''

    const tInfo = (key: string) => t(`TextInfo.${key}`)
    const tTypes = (key: string) => t(`GenerationTypes.${key}`)

    const wordsCount = generatedText.split(/\s+/).filter((w) => w.length > 0).length
    const linesCount = generatedText.split('\n').length
    const paragraphsCount = generatedText.split('\n\n').filter((p) => p.trim()).length

    return `${tInfo('title')}

${tInfo('length')}: ${generatedText.length} ${tInfo('characters')}
${tInfo('words')}: ${wordsCount}
${tInfo('lines')}: ${linesCount}
${tInfo('paragraphs')}: ${paragraphsCount}

${tInfo('settings')}
- ${tInfo('type')}: ${tTypes(settings.generationType)}
- ${tInfo('amount')}: ${settings.amount}
- ${tInfo('textType')}: ${ALTERNATIVE_TEXTS[settings.textType as keyof typeof ALTERNATIVE_TEXTS].name}
- ${tInfo('startWithLorem')}: ${settings.startWithLorem ? tInfo('yes') : tInfo('no')}`
  }, [generatedText, settings, t])

  const textInfo = getTextInfo()

  return {
    // State
    generatedText,
    copied,
    settings,
    textInfo,

    // Constants
    alternativeTexts: ALTERNATIVE_TEXTS,
    textStats: getTextStats(),

    // Actions
    generateText,
    clearText,
    loadSample,
    updateSettings,
    handleCopy,
    downloadText,
  }
}
