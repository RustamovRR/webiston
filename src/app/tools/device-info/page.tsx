import type { Metadata } from 'next'
import { DeviceInfo } from '@/modules/tools'

export const metadata: Metadata = {
  title: "Qurilma Ma'lumotlari - Device Information Tool | Webiston",
  description:
    "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Get detailed information about your browser, device and operating system.",
  keywords: [
    'device info',
    'browser info',
    'system information',
    "qurilma ma'lumotlari",
    "brauzer ma'lumotlari",
    "tizim ma'lumotlari",
    'screen resolution',
    'user agent',
    'platform details',
    'webiston tools',
    'foydali qurollar',
  ],
  openGraph: {
    title: "Qurilma Ma'lumotlari - Device Information Tool | Webiston",
    description:
      "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Get detailed device information.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: "Qurilma Ma'lumotlari Tool",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Qurilma Ma'lumotlari - Device Information Tool",
    description: "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling.",
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/device-info',
    languages: { 'uz-UZ': '/tools/device-info', 'en-US': '/tools/device-info' },
  },
  robots: { index: true, follow: true },
}

const DeviceInfoPage = () => {
  return <DeviceInfo />
}

export default DeviceInfoPage
