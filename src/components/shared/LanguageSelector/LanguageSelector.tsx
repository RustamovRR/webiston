'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface Language {
  code: 'uz' | 'en' | 'ru'
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: 'uz', name: 'Uzbek', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
]

export function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('common')

  const currentLanguage = languages.find((lang) => lang.code === locale)

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(/^\/(uz|en|ru)/, '')
    const newPath = `/${newLocale}${pathWithoutLocale || ''}`
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe size={16} />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 ${locale === language.code ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-muted-foreground text-xs">{language.name}</span>
            </div>
            {locale === language.code && <span className="ml-auto text-xs text-green-600 dark:text-green-400">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
