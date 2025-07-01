'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

const TOGGLE_CLASSES = 'relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors'
const THUMB_CLASSES = 'absolute h-6 w-6 rounded-full bg-white flex items-center justify-center'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={`${TOGGLE_CLASSES} ${theme === 'light' ? 'bg-zinc-300' : 'bg-zinc-700'}`} onClick={handleToggle}>
      <div className="relative flex w-full justify-between">
        <Sun size={14} className="z-10 text-yellow-500" />
        <Moon size={14} className="z-10 text-slate-300" />
      </div>
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`${THUMB_CLASSES} ${theme === 'dark' ? 'left-[30px]' : 'left-1'}`}
      />
    </div>
  )
}
