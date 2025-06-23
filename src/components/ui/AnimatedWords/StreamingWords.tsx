'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib'
import { useEffect, useRef, useState } from 'react'

interface StreamingWordsProps {
  text: string
  className?: string
}

function StreamingWords({ text, className }: StreamingWordsProps) {
  const [displayedText, setDisplayedText] = useState(text)
  const prevTextRef = useRef(text)

  useEffect(() => {
    // Agar matn o'zgarmagan bo'lsa, hech narsa qilmaymiz
    if (text === prevTextRef.current) {
      return
    }

    // Eski va yangi matn orasidagi umumiy qismni topamiz
    let commonPrefixLength = 0
    while (
      commonPrefixLength < text.length &&
      commonPrefixLength < prevTextRef.current.length &&
      text[commonPrefixLength] === prevTextRef.current[commonPrefixLength]
    ) {
      commonPrefixLength++
    }

    const staticPart = text.slice(0, commonPrefixLength)
    const animatedPart = text.slice(commonPrefixLength)

    // Animatsiya uchun so'zlarga ajratamiz
    const animatedWords = animatedPart.split(/(\s+)/)

    const newDisplayedText = (
      <>
        {staticPart}
        {animatedWords.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: i * 0.03 }}
          >
            {word}
          </motion.span>
        ))}
      </>
    )

    // @ts-ignore
    setDisplayedText(newDisplayedText)
    prevTextRef.current = text
  }, [text])

  return <p className={cn('whitespace-pre-wrap', className)}>{displayedText}</p>
}

export default StreamingWords
