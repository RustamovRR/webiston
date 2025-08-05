'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="bg-background flex items-center rounded-full border p-1">
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => setTheme('light')}
        className="h-8 w-8 rounded-full"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Set light theme</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => setTheme('dark')}
        className="h-8 w-8 rounded-full"
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Set dark theme</span>
      </Button>
    </div>
  )
}
