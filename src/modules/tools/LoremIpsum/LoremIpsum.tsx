'use client'

import { useState } from 'react'
import { FileType, Copy, RefreshCw, Settings } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

type GenerationType = 'paragraphs' | 'sentences' | 'words' | 'bytes'

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
}

export default function LoremIpsumPage() {
  const [generationType, setGenerationType] = useState<GenerationType>('paragraphs')
  const [amount, setAmount] = useState<number>(3)
  const [textType, setTextType] = useState<string>('cicero')
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true)
  const [generatedText, setGeneratedText] = useState<string>('')

  const getRandomWord = (words: string[]) => {
    return words[Math.floor(Math.random() * words.length)]
  }

  const generateSentence = (words: string[], minWords = 5, maxWords = 15) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
    const sentence = []

    for (let i = 0; i < wordCount; i++) {
      sentence.push(getRandomWord(words))
    }

    // Capitalize first word
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1)

    return sentence.join(' ') + '.'
  }

  const generateParagraph = (words: string[], sentenceCount = 0) => {
    if (sentenceCount === 0) {
      sentenceCount = Math.floor(Math.random() * 5) + 3 // 3-7 sentences
    }

    const sentences = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(words))
    }

    return sentences.join(' ')
  }

  const generateText = () => {
    const selectedTextType = ALTERNATIVE_TEXTS[textType as keyof typeof ALTERNATIVE_TEXTS]
    const words = selectedTextType.words
    let result = ''

    switch (generationType) {
      case 'paragraphs':
        const paragraphs = []
        for (let i = 0; i < amount; i++) {
          let paragraph = generateParagraph(words)
          // Start first paragraph with "Lorem ipsum" if enabled
          if (i === 0 && startWithLorem && textType === 'cicero') {
            paragraph = 'Lorem ipsum ' + paragraph.slice(paragraph.indexOf(' ') + 1)
          }
          paragraphs.push(paragraph)
        }
        result = paragraphs.join('\n\n')
        break

      case 'sentences':
        const sentences = []
        for (let i = 0; i < amount; i++) {
          let sentence = generateSentence(words)
          if (i === 0 && startWithLorem && textType === 'cicero') {
            sentence = 'Lorem ipsum ' + sentence.slice(sentence.indexOf(' ') + 1)
          }
          sentences.push(sentence)
        }
        result = sentences.join(' ')
        break

      case 'words':
        const wordList = []
        for (let i = 0; i < amount; i++) {
          if (i === 0 && startWithLorem && textType === 'cicero') {
            wordList.push('Lorem')
            if (amount > 1) {
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
        while (text.length < amount) {
          text += getRandomWord(words) + ' '
        }
        result = text.slice(0, amount)
        break
    }

    setGeneratedText(result)
  }

  const clearText = () => {
    setGeneratedText('')
  }

  const loadSample = () => {
    setGenerationType('paragraphs')
    setAmount(3)
    setTextType('cicero')
    setStartWithLorem(true)
    setTimeout(generateText, 100)
  }

  const stats = generatedText
    ? [
        { label: 'belgi', value: generatedText.length },
        {
          label: "so'z",
          value: generatedText.split(/\s+/).filter((word) => word.length > 0).length,
        },
        { label: 'qator', value: generatedText.split('\n').length },
      ]
    : []

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader
        title="Lorem Ipsum Generator"
        description="Placeholder matn va paragraflar yarating, dizayn va maket uchun"
      />

      {/* Sample Data Section */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Tez boshlash</h3>
              <p className="text-sm text-zinc-400">
                Standart Lorem Ipsum bilan boshlang yoki sozlamalarni o'zgartiring
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadSample}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <FileType className="mr-2 h-4 w-4" />
                Namuna yuklash
              </Button>
              <Button onClick={clearText} variant="outline" className="border-zinc-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tozalash
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-1">
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-zinc-400" />
                <h3 className="text-lg font-semibold text-zinc-100">Sozlamalar</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Yaratish turi</label>
                  <Select value={generationType} onValueChange={(value: GenerationType) => setGenerationType(value)}>
                    <SelectTrigger className="border-zinc-700 bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraflar</SelectItem>
                      <SelectItem value="sentences">Jumlalar</SelectItem>
                      <SelectItem value="words">So'zlar</SelectItem>
                      <SelectItem value="bytes">Belgilar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Miqdor</label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                  <p className="mt-1 text-xs text-zinc-500">1 dan 1000 gacha</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Matn turi</label>
                  <Select value={textType} onValueChange={setTextType}>
                    <SelectTrigger className="border-zinc-700 bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ALTERNATIVE_TEXTS).map(([key, data]) => (
                        <SelectItem key={key} value={key}>
                          {data.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {textType === 'cicero' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="startWithLorem"
                      checked={startWithLorem}
                      onChange={(e) => setStartWithLorem(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800"
                    />
                    <label htmlFor="startWithLorem" className="text-sm text-zinc-200">
                      "Lorem ipsum" bilan boshlash
                    </label>
                  </div>
                )}

                <Button onClick={generateText} className="w-full bg-blue-600 hover:bg-blue-700">
                  <FileType className="mr-2 h-4 w-4" />
                  Matn yaratish
                </Button>
              </div>
            </div>
          </Card>

          {/* Text Types Info */}
          <Card className="mt-6 border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h4 className="mb-3 font-medium text-zinc-200">Matn turlari</h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <strong>Cicero:</strong> Klasik Lorem Ipsum matni
                </p>
                <p>
                  <strong>Bacon:</strong> Go'sht va ovqat atamalar
                </p>
                <p>
                  <strong>Hipster:</strong> Zamonaviy va trendy so'zlar
                </p>
                <p>
                  <strong>Cupcake:</strong> Shirinlik va desert nomlari
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Generated Text */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats */}
          {generatedText && <StatsDisplay stats={stats} />}

          {/* Text Output */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">Yaratilgan Matn</h3>
                {generatedText && <CopyButton text={generatedText} />}
              </div>

              <Textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder="Matn yaratish uchun chap tarafda sozlamalarni to'ldiring va 'Matn yaratish' tugmasini bosing"
                rows={15}
                className="border-zinc-700 bg-zinc-800 font-mono text-sm leading-relaxed"
              />
            </div>
          </Card>

          {/* Help Section */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h4 className="mb-3 font-medium text-zinc-200">Lorem Ipsum nima uchun ishlatiladi?</h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  • <strong>Web dizayn:</strong> Sahifa maketlarini yaratishda
                </p>
                <p>
                  • <strong>Grafik dizayn:</strong> Buklet va poster dizaynida
                </p>
                <p>
                  • <strong>Typography:</strong> Shrift va matn ko'rinishini sinovdan o'tkazishda
                </p>
                <p>
                  • <strong>Prototyping:</strong> Loyiha prototiplarida
                </p>
                <p>
                  • <strong>Testing:</strong> Kontent-independent sinovlarda
                </p>
                <p>
                  • <strong>Placeholder:</strong> Haqiqiy kontent tayyor bo'lgunga qadar
                </p>
              </div>

              <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
                <div className="text-sm text-blue-400">
                  <strong>Maslahat:</strong> Lorem Ipsum mazmundan chalg'itmasdan dizayn elementlariga e'tibor qaratish
                  imkonini beradi.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
