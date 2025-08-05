'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useIsMounted } from 'usehooks-ts'
import { socialLinks } from '@/constants'

const SocialMedia = () => {
  const { theme } = useTheme()
  const isMounted = useIsMounted()

  const icons = [
    {
      link: 'https://linkedin.com',
      darkIcon: '/linkedin-dark.svg',
      lightIcon: '/linkedin-white.svg',
    },
    {
      link: 'https://t.me/nolbir_io',
      darkIcon: '/telegram-dark.svg',
      lightIcon: '/telegram-white.svg',
    },
    {
      link: 'https://github.com/nolbir-io',
      darkIcon: '/github-dark.svg',
      lightIcon: '/github-white.svg',
    },
  ]

  if (!isMounted())
    return (
      <>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="skeleton bg-foreground/10 h-[30px] w-[30px] animate-pulse rounded-full"></div>
        ))}
      </>
    )

  return (
    <>
      {socialLinks.map(({ id, href, icon, label }) => (
        <a
          key={id}
          href={href}
          aria-label={label}
          title={label}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-current transition-colors hover:text-gray-900 dark:hover:text-gray-100"
        >
          {icon}
        </a>
      ))}
    </>
  )
}

export default SocialMedia
