import { Metadata } from 'next'
import { ScreenResolution } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Ekran O'lchami - Screen Resolution Info Tool | Webiston",
  description:
    "Ekran o'lchami va rezolutsiya ma'lumotlarini ko'rish tool. Get detailed screen resolution and display information. Free screen resolution detector.",
  keywords: [
    'Screen resolution',
    'Display resolution',
    "Ekran o'lchami",
    'Monitor resolution',
    'Screen size',
    'Display info',
    'Resolution detector',
    'Screen info',
    'Viewport size',
    'Display dimensions',
    'Screen details',
    'Monitor info',
    'Resolution checker',
    'Screen test',
    'Display test',
    'Responsive design',
    'Device resolution',
    'Browser resolution',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: "Ekran O'lchami - Screen Resolution Info Tool | Webiston",
    description:
      "Ekran o'lchami va rezolutsiya ma'lumotlarini ko'rish tool. Get detailed screen resolution and display information.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Ekran O'lchami",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ekran O'lchami - Screen Resolution Info Tool",
    description: "Ekran o'lchami va rezolutsiya ma'lumotlarini ko'rish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/screen-resolution',
    languages: {
      'uz-UZ': '/tools/screen-resolution',
      'en-US': '/tools/screen-resolution',
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

const ScreenResolutionPage = () => {
  return <ScreenResolution />
}

export default ScreenResolutionPage
