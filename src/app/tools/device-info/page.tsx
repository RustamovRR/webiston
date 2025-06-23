import { Metadata } from 'next'
import { DeviceInfo } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Qurilma Ma'lumotlari - Device Information Tool | Webiston",
  description:
    "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Get detailed information about your browser, device and operating system. Device Information tool.",
  keywords: [
    'Device info',
    'Browser info',
    'System information',
    "Qurilma ma'lumotlari",
    "Brauzer ma'lumotlari",
    "Tizim ma'lumotlari",
    'Screen resolution',
    'Browser details',
    'User agent',
    'Operating system',
    'Device specifications',
    'Hardware information',
    'Browser capabilities',
    'Screen info',
    'Connection info',
    'Platform details',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: "Qurilma Ma'lumotlari - Device Information Tool | Webiston",
    description:
      "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Get detailed information about your browser, device and operating system.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Qurilma Ma'lumotlari",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Qurilma Ma'lumotlari - Device Information Tool",
    description: "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/device-info',
    languages: {
      'uz-UZ': '/tools/device-info',
      'en-US': '/tools/device-info',
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

const DeviceInfoPage = () => {
  return <DeviceInfo />
}

export default DeviceInfoPage
