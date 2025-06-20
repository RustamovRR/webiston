'use client'

import { toCyrillic, toLatin } from '@/lib/transliteration'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Check, Copy, X } from 'lucide-react'
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useCopyToClipboard, useDebounceValue } from 'usehooks-ts'
import { countWords } from '@/lib/utils'

type Direction = 'latin-to-cyrillic' | 'cyrillic-to-latin'

const LotinKirillConverter = () => {
  const [direction, setDirection] = useState<Direction>('latin-to-cyrillic')
  const [sourceText, setSourceText] = useState('')
  const [copied, setCopied] = useState(false)
  const [prevConvertedText, setPrevConvertedText] = useState('')

  const [debouncedText] = useDebounceValue(sourceText, 150)
  const [_, copy] = useCopyToClipboard()

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value)
  }

  const handleSwap = () => {
    setDirection((prev) => (prev === 'latin-to-cyrillic' ? 'cyrillic-to-latin' : 'latin-to-cyrillic'))
    setSourceText(convertedText)
    setPrevConvertedText('')
  }

  const handleCopy = async () => {
    if (!convertedText) return
    try {
      await copy(convertedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleClear = () => {
    setSourceText('')
    setPrevConvertedText('')
  }

  const sourceLang = direction === 'latin-to-cyrillic' ? 'Lotin' : 'Kirill'
  const targetLang = direction === 'latin-to-cyrillic' ? 'Kirill' : 'Lotin'
  const sourcePlaceholder = direction === 'latin-to-cyrillic' ? 'Matn kiriting...' : 'Матн киритинг...'

  const renderTextarea = (type: 'source' | 'target') => {
    const isSource = type === 'source'
    const text = isSource ? sourceText : convertedText
    const lang = isSource ? sourceLang : targetLang

    const characterCount = text.length
    const wordCount = countWords(text)

    return (
      <motion.div layout className="relative flex w-full flex-col rounded-xl bg-zinc-900/80 shadow-inner">
        <section className="flex items-center justify-between border-b border-zinc-800 p-4">
          <span className="text-lg font-semibold text-zinc-100">{lang}</span>
          {isSource ? (
            <AnimatePresence>
              {sourceText && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Tozalash"
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          ) : (
            <motion.button
              onClick={handleCopy}
              disabled={!convertedText}
              className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Nusxalash"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </motion.button>
          )}
        </section>

        <section className="relative flex-grow" style={{ minHeight: '400px', maxHeight: '400px' }}>
          {isSource ? (
            <textarea
              value={sourceText}
              onChange={handleInputChange}
              className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 text-lg text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
              placeholder={sourcePlaceholder}
              autoFocus
            />
          ) : (
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4 whitespace-pre-wrap">
              <div className="text-lg text-zinc-50">
                {prevConvertedText && <span>{prevConvertedText}</span>}
                {newText && prevConvertedText && convertedText.length > prevConvertedText.length && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {newText}
                  </motion.span>
                )}
                {!prevConvertedText && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {convertedText}
                  </motion.span>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="flex justify-end space-x-4 border-t border-zinc-800 px-4 py-2 text-sm text-zinc-500">
          <div className="flex items-center gap-1.5">
            {characterCount > 0 ? <NumberTicker value={characterCount} /> : <span>0</span>}
            <span>belgi</span>
          </div>
          <div className="flex items-center gap-1.5">
            {wordCount > 0 ? <NumberTicker value={wordCount} /> : <span>0</span>}
            <span>so'z</span>
          </div>
        </section>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">Lotin-Kirill O'giruvchi</h1>
        <p className="text-lg text-zinc-400">O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'giring</p>
      </div>

      <div className="relative flex flex-col gap-4 md:flex-row md:gap-6">
        {renderTextarea('source')}

        {/* Switch button - ikkala input o'rtasida */}
        <div className="flex justify-center md:self-start md:pt-16">
          <motion.button
            layout
            onClick={handleSwap}
            className="group cursor-pointer rounded-full border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white"
            aria-label="Yo'nalishni almashtirish"
          >
            <ArrowLeftRight size={18} className="transition-transform group-hover:scale-110" />
          </motion.button>
        </div>

        {renderTextarea('target')}
      </div>
    </div>
  )
}

export default LotinKirillConverter
