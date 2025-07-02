import { Metadata } from 'next'
import { ToolsMainPage } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Developer Tools - Dasturlash Vositalari | Webiston',
  description:
    'Dasturchilar uchun 20+ foydali vositalar: JSON formatter, Base64 converter, Hash generator, UUID generator, Password generator va boshqalar.',
  keywords: [
    'developer tools',
    'dasturlash vositalari',
    'json formatter',
    'base64 converter',
    'hash generator',
    'uuid generator',
    'password generator',
    'webiston',
  ],
  openGraph: {
    title: 'Developer Tools - Dasturlash Vositalari | Webiston',
    description:
      'Dasturchilar uchun 20+ foydali vositalar: JSON formatter, Base64 converter, Hash generator va boshqalar',
    type: 'website',
    locale: 'uz_UZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Tools - Dasturlash Vositalari | Webiston',
    description: 'Dasturchilar uchun 20+ foydali vositalar',
  },
  alternates: {
    canonical: '/tools',
  },
}

const ToolsPage = () => {
  return <ToolsMainPage />
}

export default ToolsPage
