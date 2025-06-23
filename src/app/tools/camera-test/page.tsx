import { Metadata } from 'next'
import { CameraTest } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Kamera Test - Camera Test Tool | Webiston',
  description:
    "Kamerangizni sinab ko'ring, video yozing va screenshot oling. Test your camera, record videos and take screenshots. Free online camera testing tool.",
  keywords: [
    'Camera test',
    'Kamera test',
    'Video test',
    'Camera tester',
    'Webcam test',
    'Video recording',
    'Screenshot tool',
    'Camera quality test',
    'Video quality test',
    'Webcam tester',
    'Online camera test',
    'Browser camera test',
    'Video capture',
    'Camera permissions',
    'Device camera',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Kamera Test - Camera Test Tool | Webiston',
    description:
      "Kamerangizni sinab ko'ring, video yozing va screenshot oling. Test your camera, record videos and take screenshots.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kamera Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kamera Test - Camera Test Tool',
    description: "Kamerangizni sinab ko'ring, video yozing va screenshot oling.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/camera-test',
    languages: {
      'uz-UZ': '/tools/camera-test',
      'en-US': '/tools/camera-test',
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

const CameraTestPage = () => {
  return <CameraTest />
}

export default CameraTestPage
