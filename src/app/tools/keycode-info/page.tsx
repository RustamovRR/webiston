import { Metadata } from 'next'
import { KeycodeInfo } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Keycode Ma'lumotlari - Keyboard Key Info Tool | Webiston",
  description:
    "Klaviatura tugmalarining kodlarini va ma'lumotlarini ko'rish tool. Get keyboard key codes and information. Free online keycode detector and analyzer.",
  keywords: [
    'Keycode info',
    'Keyboard codes',
    'Key codes',
    'Klaviatura kodlari',
    'Keycode detector',
    'Key events',
    'Keyboard events',
    'ASCII codes',
    'Key bindings',
    'Keyboard tester',
    'Key press detector',
    'Event codes',
    'JavaScript keycode',
    'Keyboard shortcuts',
    'Key mapping',
    'Input events',
    'Developer tools',
    'Dasturlash vositalari',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: "Keycode Ma'lumotlari - Keyboard Key Info Tool | Webiston",
    description:
      "Klaviatura tugmalarining kodlarini va ma'lumotlarini ko'rish tool. Get keyboard key codes and information.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Keycode Ma'lumotlari",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Keycode Ma'lumotlari - Keyboard Key Info Tool",
    description: "Klaviatura tugmalarining kodlarini va ma'lumotlarini ko'rish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/keycode-info',
    languages: {
      'uz-UZ': '/tools/keycode-info',
      'en-US': '/tools/keycode-info',
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

const KeycodeInfoPage = () => {
  return <KeycodeInfo />
}

export default KeycodeInfoPage
