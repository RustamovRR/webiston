'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative h-9 w-9 cursor-pointer overflow-hidden"
      aria-label="Mavzuni o'zgartirish"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={theme === 'light' ? 'sun' : 'moon'}
          initial={{ y: 10, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}
