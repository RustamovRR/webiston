import type { Metadata } from 'next'
import { CameraRecorderClient } from './CameraRecorderClient'

export const metadata: Metadata = {
  title: 'Kamera Yozuvchi - Camera Recorder Tool | Webiston',
  description:
    "Kamerangizni sinab ko'ring, video yozing va screenshot oling. Test your camera, record videos and take screenshots.",
  keywords: [
    'camera recorder',
    'kamera yozuvchi',
    'video recorder',
    'webcam recorder',
    'screen recorder',
    'camera test',
    'video capture',
    'screenshot tool',
    'online recorder',
    'webiston tools',
    'foydali qurollar',
  ],
  openGraph: {
    title: 'Kamera Yozuvchi - Camera Recorder Tool | Webiston',
    description: "Kamerangizni sinab ko'ring, video yozing va screenshot oling. Professional camera recorder tool.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Kamera Yozuvchi Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kamera Yozuvchi - Camera Recorder Tool',
    description: "Kamerangizni sinab ko'ring, video yozing va screenshot oling.",
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/tools/camera-recorder',
    languages: { 'uz-UZ': '/tools/camera-recorder', 'en-US': '/tools/camera-recorder' },
  },
  robots: { index: true, follow: true },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kamera Yozuvchi - Camera Recorder',
  description: "Kamerangizni sinab ko'ring, video yozing va screenshot oling",
  url: 'https://webiston.uz/tools/camera-recorder',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  permissions: 'camera, microphone',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Webiston',
    url: 'https://webiston.uz',
  },
  featureList: [
    'Camera Testing',
    'Video Recording',
    'Screenshot Capture',
    'Multiple Camera Support',
    'Real-time Preview',
    'Professional Interface',
  ],
}

const CameraRecorderPage = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CameraRecorderClient />
    </>
  )
}

export default CameraRecorderPage
