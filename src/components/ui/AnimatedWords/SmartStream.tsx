"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib"
import { useEffect, useRef } from "react"

const PASTE_THRESHOLD = 25

interface SmartStreamProps {
  text: string
  className?: string
}

function SmartStream({ text, className }: SmartStreamProps) {
  const prevTextRef = useRef(text)

  useEffect(() => {
    prevTextRef.current = text
  }, [text])

  const changeLength = Math.abs(text.length - prevTextRef.current.length)
  const isPaste = changeLength > PASTE_THRESHOLD

  if (isPaste) {
    return (
      <motion.p
        key={text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn("whitespace-pre-wrap", className)}
      >
        {text}
      </motion.p>
    )
  } else {
    const words = text.split(/(\s+)/)
    return (
      <p className={cn("whitespace-pre-wrap", className)}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: i * 0.02 }}
          >
            {word}
          </motion.span>
        ))}
      </p>
    )
  }
}

export default SmartStream
