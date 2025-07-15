import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { ToolsMainPage } from '@/modules/tools'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ToolsPage.Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: '/tools',
      languages: {
        uz: '/tools',
        en: '/en/tools',
        'x-default': '/tools',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'uz' ? 'uz_UZ' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  }
}

const ToolsPage = () => {
  return <ToolsMainPage />
}

export default ToolsPage
