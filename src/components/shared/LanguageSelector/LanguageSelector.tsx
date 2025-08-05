'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { Globe, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useIsMounted } from 'usehooks-ts'

interface Language {
  code: 'uz' | 'en'
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

function LanguageSelectorContent() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLanguageChange = (newLocale: 'uz' | 'en') => {
    router.push(pathname, { locale: newLocale })
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
          <span className="font-medium">{locale.toUpperCase()}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex cursor-pointer items-center gap-2 ${locale === language.code ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
          >
            <span className="text-sm">{language.flag}</span>
            <span className="font-medium">{language.code}</span>
            {locale === language.code && <span className="ml-auto text-xs text-green-600 dark:text-green-400">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function LanguageSelector() {
  const isMounted = useIsMounted()

  if (!isMounted()) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex cursor-pointer items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        disabled
      >
        <Globe size={16} />
        <span className="font-medium">--</span>
        <ChevronDown size={14} />
      </Button>
    )
  }

  return <LanguageSelectorContent />
}
