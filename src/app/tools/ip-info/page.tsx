import { Metadata } from 'next'
import { IpInfo } from '@/modules/tools'

export const metadata: Metadata = {
  title: "IP Ma'lumotlari - IP Address Information Tool | Webiston",
  description:
    "IP manzilingiz va geolokatsiya ma'lumotlarini ko'rish tool. Get your IP address and geolocation information. Free IP address lookup tool.",
  keywords: [
    'IP address',
    "IP ma'lumotlari",
    'IP geolocation',
    'IP lookup',
    'My IP address',
    'IP checker',
    'IP info',
    'Geolocation',
    'IP location',
    'Public IP',
    'External IP',
    'IP address finder',
    'IP detector',
    'What is my IP',
    'IP country',
    'IP city',
    'ISP information',
    'Internet provider',
    'Network tools',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: "IP Ma'lumotlari - IP Address Information Tool | Webiston",
    description:
      "IP manzilingiz va geolokatsiya ma'lumotlarini ko'rish tool. Get your IP address and geolocation information.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "IP Ma'lumotlari",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "IP Ma'lumotlari - IP Address Information Tool",
    description: "IP manzilingiz va geolokatsiya ma'lumotlarini ko'rish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/ip-info',
    languages: {
      'uz-UZ': '/tools/ip-info',
      'en-US': '/tools/ip-info',
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

const IpInfoPage = () => {
  return <IpInfo />
}

export default IpInfoPage
