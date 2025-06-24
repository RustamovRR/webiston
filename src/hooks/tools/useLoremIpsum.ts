import { useState, useCallback } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

type GenerationType = 'paragraphs' | 'sentences' | 'words' | 'bytes'

interface LoremSettings {
  generationType: GenerationType
  amount: number
  textType: string
  startWithLorem: boolean
}

const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'at',
  'vero',
  'eos',
  'accusamus',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'et',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'sunt',
  'explicabo',
  'nemo',
  'ipsam',
  'voluptatem',
  'quia',
  'voluptas',
  'aspernatur',
  'aut',
  'odit',
  'fugit',
  'sed',
  'quia',
  'consequuntur',
  'magni',
  'dolores',
  'ratione',
  'sequi',
  'nesciunt',
  'neque',
  'porro',
  'quisquam',
  'dolorem',
  'adipisci',
  'numquam',
  'eius',
  'modi',
  'tempora',
  'incidunt',
  'magnam',
  'quaerat',
]

const ALTERNATIVE_TEXTS = {
  cicero: {
    name: 'Cicero (Klasik)',
    words: LOREM_WORDS,
  },
  bacon: {
    name: 'Bacon Ipsum',
    words: [
      'bacon',
      'ipsum',
      'dolor',
      'amet',
      'hamburger',
      'leberkas',
      'beef',
      'ribs',
      'brisket',
      'tongue',
      'spare',
      'ribs',
      'jerky',
      'corned',
      'beef',
      'pig',
      'short',
      'loin',
      'chicken',
      'turkey',
      'pork',
      'belly',
      'shoulder',
      'chuck',
      'sirloin',
      'bresaola',
      'pancetta',
      'meatball',
      'fatback',
      'strip',
      'steak',
      'salami',
      'capicola',
      'tail',
      'ball',
      'tip',
      'drumstick',
      'tri-tip',
      'sausage',
      'ground',
      'round',
      'pastrami',
      'shank',
      'flank',
      'kielbasa',
    ],
  },
  hipster: {
    name: 'Hipster Ipsum',
    words: [
      'artisan',
      'sustainable',
      'organic',
      'locavore',
      'craft',
      'beer',
      'quinoa',
      'kale',
      'chips',
      'beard',
      'mustache',
      'vintage',
      'retro',
      'authentic',
      'artisanal',
      'small',
      'batch',
      'farm',
      'to',
      'table',
      'fixie',
      'bicycle',
      'vinyl',
      'record',
      'player',
      'messenger',
      'bag',
      'flannel',
      'shirt',
      'skinny',
      'jeans',
      'coffee',
      'shop',
      'bookstore',
      'thrift',
      'store',
      'urban',
      'farming',
      'kombucha',
      'meditation',
      'yoga',
      'minimalist',
    ],
  },
  cupcake: {
    name: 'Cupcake Ipsum',
    words: [
      'cupcake',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'chocolate',
      'cake',
      'lemon',
      'drops',
      'pastry',
      'carrot',
      'cake',
      'gummies',
      'sweet',
      'roll',
      'danish',
      'jujubes',
      'donut',
      'candy',
      'canes',
      'apple',
      'pie',
      'cheesecake',
      'brownie',
      'cotton',
      'candy',
      'macaroon',
      'bonbon',
      'tart',
      'biscuit',
      'wafer',
      'liquorice',
      'tiramisu',
      'powder',
      'jelly',
      'beans',
      'marzipan',
      'croissant',
      'pudding',
      'fruitcake',
      'ice',
      'cream',
      'shortbread',
    ],
  },
  uzbek: {
    name: "O'zbek Lorem",
    words: [
      'matn',
      'sahifa',
      'dizayn',
      'web',
      'dasturlash',
      'loyiha',
      'ishlab',
      'chiqish',
      'texnologiya',
      'zamonaviy',
      'tizim',
      'platforma',
      'mobil',
      'ilovalar',
      'foydalanuvchi',
      'interfeys',
      'tajriba',
      'dizayner',
      'dasturchi',
      'muhandis',
      'kreativ',
      'innovatsiya',
      'raqamli',
      'dunyosi',
      'internet',
      'tarmoq',
      'malumot',
      'bazasi',
      'server',
      'bulut',
      'xavfsizlik',
      'optimizatsiya',
      'samaradorlik',
      'tezlik',
      'chiroyli',
      'zamonaviy',
      'professional',
      'mukammal',
      'ajoyib',
      'qiziqarli',
    ],
  },
}

const SAMPLE_SETTINGS: LoremSettings = {
  generationType: 'paragraphs',
  amount: 3,
  textType: 'cicero',
  startWithLorem: true,
}

export const useLoremIpsum = () => {
  const [generatedText, setGeneratedText] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()

  const [settings, setSettings] = useState<LoremSettings>(SAMPLE_SETTINGS)

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
    [getRandomWord],
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
    [generateSentence],
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
    setSettings(SAMPLE_SETTINGS)
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
      { label: 'belgi', value: generatedText.length },
      {
        label: "so'z",
        value: generatedText.split(/\s+/).filter((word) => word.length > 0).length,
      },
      { label: 'qator', value: generatedText.split('\n').length },
      { label: 'paragraf', value: generatedText.split('\n\n').filter((p) => p.trim()).length },
    ]
  }, [generatedText])

  const textInfo = generatedText
    ? `Yaratilgan matn ma'lumoti:\n\nUzunlik: ${generatedText.length} belgi\nSo'zlar: ${generatedText.split(/\s+/).filter((w) => w.length > 0).length}\nQatorlar: ${generatedText.split('\n').length}\nParagraflar: ${generatedText.split('\n\n').filter((p) => p.trim()).length}\n\nSozlamalar:\n- Turi: ${settings.generationType}\n- Miqdor: ${settings.amount}\n- Matn turi: ${ALTERNATIVE_TEXTS[settings.textType as keyof typeof ALTERNATIVE_TEXTS].name}\n- Lorem bilan boshlash: ${settings.startWithLorem ? 'Ha' : "Yo'q"}`
    : ''

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
