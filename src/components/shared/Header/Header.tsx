'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search } from 'nextra/components'
import { cn } from '@/lib/utils'

const Header = () => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/books',
      label: 'Kitoblar',
      active: pathname?.startsWith('/books'),
    },
    {
      href: '/tools',
      label: 'Qurollar',
      active: pathname?.startsWith('/tools'),
    },
  ]

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Image src="/logo.png" alt="Webiston Logo" width={32} height={32} />
          <span className="hidden text-lg font-bold sm:inline">Webiston</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'hover:text-foreground/80 transition-colors',
                item.active ? 'text-foreground' : 'text-foreground/60',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search - o'ng tomonda */}
        <div className="flex flex-1 items-center justify-end">
          <Search placeholder="Qidirish..." />
        </div>
      </div>
    </header>
  )
}

export default Header
