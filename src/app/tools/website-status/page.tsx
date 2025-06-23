import { Metadata } from 'next'
import { WebsiteStatus } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Website Status - Sayt Holati Tekshirish Tool | Webiston',
  description:
    'Websaytlarning status kodini tekshirish va ishlash holatini aniqlash tool. Check website status codes and uptime. Free online website status checker.',
  keywords: [
    'Website status',
    'Site status checker',
    'Website holati',
    'HTTP status checker',
    'Website uptime',
    'Site monitor',
    'Website availability',
    'HTTP response checker',
    'Website ping',
    'Site health check',
    'Website test',
    'Server status',
    'Website down checker',
    'Site availability',
    'HTTP status codes',
    'Website monitoring',
    'Online status checker',
    'Web tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Website Status - Sayt Holati Tekshirish Tool | Webiston',
    description:
      'Websaytlarning status kodini tekshirish va ishlash holatini aniqlash tool. Check website status codes and uptime.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Website Status',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Status - Sayt Holati Tekshirish Tool',
    description: 'Websaytlarning status kodini tekshirish va ishlash holatini aniqlash tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/website-status',
    languages: {
      'uz-UZ': '/tools/website-status',
      'en-US': '/tools/website-status',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const WebsiteStatusPage = () => {
  return <WebsiteStatus />
}

export default WebsiteStatusPage
