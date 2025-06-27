import { Metadata } from 'next'
import { ScreenResolution } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Ekran O'lchami - Screen Resolution Detector | Webiston",
  description:
    "Ekran o'lchami, rezolutsiya va displey ma'lumotlarini real vaqtda ko'rish vositasi. Monitor testi, viewport o'lchami va qurilma ma'lumotlari. Real-time screen resolution detector and display information tool.",
  keywords: [
    // O'zbek tilida
    "Ekran o'lchami",
    'Monitor testi',
    "Displey ma'lumotlari",
    "Viewport o'lchami",
    "Qurilma ma'lumotlari",
    'Fullscreen test',
    'Piksel nisbati',
    'Retina displey',

    // English
    'Screen resolution',
    'Display resolution',
    'Monitor resolution',
    'Screen size detector',
    'Display info',
    'Viewport size',
    'Screen dimensions',
    'Resolution checker',
    'Device resolution',
    'Browser viewport',
    'Responsive design',
    'Pixel ratio',
    'Retina display',

    // Tool related
    'Webiston tools',
    'Free online tools',
    'Web developer tools',
  ],
  openGraph: {
    title: "Ekran O'lchami - Screen Resolution Detector | Webiston",
    description:
      "Ekran o'lchami va rezolutsiya ma'lumotlarini real vaqtda ko'ring. Professional displey testi va qurilma ma'lumotlari.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Ekran O'lchami Detector - Webiston",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ekran O'lchami - Screen Resolution Detector",
    description: "Real vaqtda ekran o'lchami va displey ma'lumotlarini tekshiring.",
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
