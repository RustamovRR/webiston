import { Metadata } from 'next'
import { UserAgentAnalyzer } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'User Agent Analyzer - User Agent Tahlil Tool | Webiston',
  description:
    "User Agent stringlarini tahlil qilish va brauzer ma'lumotlarini olish tool. Analyze User Agent strings and extract browser information.",
  keywords: [
    'User Agent analyzer',
    'User Agent parser',
    'User Agent tahlil',
    'Browser detection',
    'User Agent string',
    'Browser analyzer',
    'Device detection',
    'Browser parser',
    'User Agent decoder',
    'Browser information',
    'User Agent checker',
    'Web crawler detection',
    'Bot detection',
    'Browser version',
    'Operating system detection',
    'Platform detection',
    'Developer tools',
    'Web analytics',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'User Agent Analyzer - User Agent Tahlil Tool | Webiston',
    description:
      "User Agent stringlarini tahlil qilish va brauzer ma'lumotlarini olish tool. Analyze User Agent strings and extract browser information.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'User Agent Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User Agent Analyzer - User Agent Tahlil Tool',
    description: "User Agent stringlarini tahlil qilish va brauzer ma'lumotlarini olish tool.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/user-agent-analyzer',
    languages: {
      'uz-UZ': '/tools/user-agent-analyzer',
      'en-US': '/tools/user-agent-analyzer',
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

const UserAgentAnalyzerPage = () => {
  return <UserAgentAnalyzer />
}

export default UserAgentAnalyzerPage
