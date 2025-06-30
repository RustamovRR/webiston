import { Metadata } from 'next'
import { IpInfo } from '@/modules/tools'

export const metadata: Metadata = {
  title: "IP Ma'lumotlari - IP Address Geolocation Tool | Webiston",
  description:
    "IP manzil va geolokatsiya ma'lumotlarini professional tahlil qiling. IP address geolocation, ISP detection, security analysis. Real-time IP lookup tool.",
  keywords: [
    'IP address',
    "IP ma'lumotlari",
    'IP geolocation',
    'IP lookup',
    'My IP address',
    'IP checker',
    'IP analyzer',
    'Geolocation',
    'IP location',
    'ISP detection',
    'IP security',
    'Network analysis',
    'IP information',
    'Professional IP tools',
    'Webiston IP analyzer',
    'IP manzil tahlil',
    'Geolokatsiya tool',
  ],
  openGraph: {
    title: "IP Ma'lumotlari - IP Address Geolocation Tool | Webiston",
    description:
      'Professional IP manzil va geolokatsiya tahlil vositasi. Real-time IP lookup, ISP detection, security analysis.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
  },
  twitter: {
    card: 'summary_large_image',
    title: "IP Ma'lumotlari - IP Address Geolocation Tool",
    description: 'Professional IP address analysis va geolocation tool.',
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
