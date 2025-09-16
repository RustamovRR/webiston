import React from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib'
import Logo from './Logo'
import MobileMenuButton from './MobileMenuButton'
import LanguageSelector from '../LanguageSelector/LanguageSelector'
import Search from '../Search'
import ThemeToggle from '../ThemeToggle'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface HeaderProps {
  showLanguageSelector?: boolean
}

export default function Header({ showLanguageSelector = true }: HeaderProps) {
  const t = useTranslations('Header')

  const books = [
    {
      id: 'fluent-react',
      title: 'Fluent React',
      description: "React.js bo'yicha chuqurlashtirilgan bilimlar va ilg'or patternlar.",
    },
    {
      id: 'javascript-definitive-guide',
      title: 'JavaScript The Definitive Guide',
      description: "JavaScript'ni chuqur o'rganish uchun to'liq qo'llanma.",
    },
    {
      id: 'ai-engineering',
      title: 'AI Engineering',
      description: "AI texnologiyalarini chuqur o'rganish uchun to'liq qo'llanma.",
    },
  ]

  return (
    <div className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm dark:border-zinc-800">
      <div className="mx-auto flex h-16 w-full max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <section className="flex items-center gap-6">
          <Logo />
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="relative cursor-pointer bg-transparent text-[#8A8A8E] dark:text-[#8D8D93]">
                  <Link href="/books">{t('books')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 max-md:max-w-[400px] max-md:!p-1 md:w-[500px]">
                    {books.map((book) => (
                      <ListItem key={book.id} href={`/books/${book.id}`} title={book.title}>
                        {book.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="relative cursor-pointer bg-transparent text-[#8A8A8E] dark:text-[#8D8D93]"
                >
                  <Link href="/tools">{t('tools')}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        <section className="flex items-center space-x-2">
          <div className="hidden items-center gap-2 md:flex">
            <Search />
            {showLanguageSelector && <LanguageSelector />}
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <MobileMenuButton />
          </div>
        </section>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none',
              className,
            )}
            {...props}
          >
            <div className="text-sm leading-none font-medium">{title}</div>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
