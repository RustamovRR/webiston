'use client'

import { toCyrillic, toLatin } from '@/lib/transliteration'
import React, { useMemo, useState, useEffect } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { DualTextPanel } from '@/components/shared/DualTextPanel'

type Direction = 'latin-to-cyrillic' | 'cyrillic-to-latin'

const LotinKirillConverter = () => {
  const [direction, setDirection] = useState<Direction>('latin-to-cyrillic')
  const [sourceText, setSourceText] = useState('')
  const [prevConvertedText, setPrevConvertedText] = useState('')

  const [debouncedText] = useDebounceValue(sourceText, 150)

  const convertedText = useMemo(() => {
    if (!debouncedText) return ''
    return direction === 'latin-to-cyrillic' ? toCyrillic(debouncedText) : toLatin(debouncedText)
  }, [debouncedText, direction])

  // Faqat yangi qo'shilgan textni animatsiya qilish uchun
  const newText = useMemo(() => {
    if (!prevConvertedText || convertedText.length <= prevConvertedText.length) {
      return convertedText
    }
    return convertedText.slice(prevConvertedText.length)
  }, [convertedText, prevConvertedText])

  useEffect(() => {
    if (convertedText !== prevConvertedText) {
      setPrevConvertedText(convertedText)
    }
  }, [convertedText])

  const handleSwap = () => {
    setDirection((prev) => (prev === 'latin-to-cyrillic' ? 'cyrillic-to-latin' : 'latin-to-cyrillic'))
    setSourceText(convertedText)
    setPrevConvertedText('')
  }

  const handleClear = () => {
    setSourceText('')
    setPrevConvertedText('')
  }

  const sourceLang = direction === 'latin-to-cyrillic' ? 'Lotin' : 'Kirill'
  const targetLang = direction === 'latin-to-cyrillic' ? 'Kirill' : 'Lotin'
  const sourcePlaceholder = direction === 'latin-to-cyrillic' ? 'Matn kiriting...' : 'Матн киритинг...'

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">Lotin-Kirill O'giruvchi</h1>
        <p className="text-lg text-zinc-400">O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'giring</p>
      </div>

      <DualTextPanel
        sourceText={sourceText}
        convertedText={convertedText}
        sourcePlaceholder={sourcePlaceholder}
        sourceLabel={sourceLang}
        targetLabel={targetLang}
        onSourceChange={setSourceText}
        onSwap={handleSwap}
        onClear={handleClear}
      />
    </div>
  )
}

export default LotinKirillConverter
