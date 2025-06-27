'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface Language {
  code: 'uz' | 'en'
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState<'uz' | 'en'>('uz')

  // Detect current locale from URL
  useEffect(() => {
    console.log('LanguageSelector: pathname =', pathname)
    if (pathname.startsWith('/en')) {
      console.log('LanguageSelector: Setting locale to EN')
      setCurrentLocale('en')
    } else {
      console.log('LanguageSelector: Setting locale to UZ')
      setCurrentLocale('uz')
    }
  }, [pathname])

  const currentLanguage = languages.find((lang) => lang.code === currentLocale)

  const handleLanguageChange = (newLocale: 'uz' | 'en') => {
    console.log('LanguageSelector: Changing language to', newLocale, 'from pathname', pathname)
    if (newLocale === 'uz') {
      // For Uzbek (default), remove /en prefix if exists
      const newPath = pathname.replace(/^\/en/, '') || '/'
      console.log('LanguageSelector: Pushing to UZ path', newPath)
      router.push(newPath)
    } else {
      // For English, add /en prefix
      const newPath = pathname.startsWith('/en') ? pathname : `/en${pathname}`
      console.log('LanguageSelector: Pushing to EN path', newPath)
      router.push(newPath)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex cursor-pointer items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Globe size={16} />
          <span className="font-medium">{currentLocale}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex cursor-pointer items-center gap-2 ${currentLocale === language.code ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
          >
            <span className="text-sm">{language.flag}</span>
            <span className="font-medium">{language.code}</span>
            {currentLocale === language.code && (
              <span className="ml-auto text-xs text-green-600 dark:text-green-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
