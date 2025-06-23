import { Metadata } from 'next'
import { PasswordGenerator } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Parol Generatori - Secure Password Generator | Webiston',
  description:
    'Xavfsiz va kuchli parollar yaratish tool. Generate secure and strong passwords with customizable options. Free online password generator.',
  keywords: [
    'Password generator',
    'Parol generatori',
    'Secure password',
    'Strong password',
    'Random password',
    'Password creator',
    'Xavfsiz parol',
    'Kuchli parol',
    'Password maker',
    'Parol yaratish',
    'Cryptographically secure',
    'Password security',
    'Strong passwords',
    'Secure passwords',
    'Random generator',
    'Password tool',
    'Security tools',
    'Cybersecurity',
    'Webiston tools',
    'Foydali qurollar',
  ],
  openGraph: {
    title: 'Parol Generatori - Secure Password Generator | Webiston',
    description:
      'Xavfsiz va kuchli parollar yaratish tool. Generate secure and strong passwords with customizable options.',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Parol Generatori',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parol Generatori - Secure Password Generator',
    description: 'Xavfsiz va kuchli parollar yaratish tool.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/tools/password-generator',
    languages: {
      'uz-UZ': '/tools/password-generator',
      'en-US': '/tools/password-generator',
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

const PasswordGeneratorPage = () => {
  return <PasswordGenerator />
}

export default PasswordGeneratorPage
