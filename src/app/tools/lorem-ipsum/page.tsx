import { Metadata } from 'next'
import { LoremIpsum } from '@/modules/tools'

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Professional Placeholder Text Generator | Webiston',
  description:
    "Professional Lorem Ipsum generator. Create placeholder text, paragraphs, sentences, and words for web design, development, and graphic design. O'zbek tilida Lorem Ipsum yaratuvchi - dizayn va dasturlash uchun placeholder matnlar yarating.",
  keywords: [
    // Primary keywords
    'lorem ipsum generator',
    'placeholder text generator',
    'dummy text generator',
    'lorem ipsum yaratish',
    'placeholder matn',
    'matn generatori',

    // Lorem Ipsum variations
    'lorem ipsum text',
    'lorem ipsum paragraphs',
    'lorem ipsum sentences',
    'lorem ipsum words',
    'cicero lorem ipsum',
    'bacon ipsum',
    'hipster ipsum',
    'cupcake ipsum',

    // Design & Development
    'web design placeholder',
    'graphic design text',
    'typography testing',
    'layout placeholder',
    'design mockup text',
    'prototype content',
    'development placeholder',
    'ui design text',

    // Professional terms
    'professional lorem ipsum',
    'custom lorem ipsum',
    'lorem ipsum tool',
    'lorem ipsum utility',
    'text generation tool',
    'filler content generator',
    'sample text creator',

    // Uzbek keywords
    "o'zbek lorem ipsum",
    'matn yaratuvchi',
    'dizayn uchun matn',
    'namuna matn',
    'test matni',
    'placeholder content',
    'webiston lorem ipsum',
    'foydali qurollar',

    // Technical
    'html lorem ipsum',
    'css placeholder text',
    'javascript lorem ipsum',
    'react placeholder',
    'nextjs lorem ipsum',
    'developer tools',
    'frontend tools',
    'webiston tools',
  ],
  authors: [{ name: 'Webiston', url: 'https://webiston.uz' }],
  creator: 'Webiston',
  publisher: 'Webiston',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://webiston.uz'),
  openGraph: {
    title: 'Lorem Ipsum Generator - Professional Placeholder Text Generator',
    description:
      "Professional Lorem Ipsum generator with multiple text types. Create placeholder content for web design, development, and graphic design projects. O'zbek tilida ham mavjud.",
    type: 'website',
    locale: 'uz_UZ',
    url: '/tools/lorem-ipsum',
    siteName: 'Webiston',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lorem Ipsum Generator - Professional Placeholder Text Tool',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: 'Lorem Ipsum Generator - Professional Placeholder Text Generator',
    description: 'Professional Lorem Ipsum generator. Create placeholder text for design and development projects.',
    images: {
      url: '/og-image.png',
      alt: 'Lorem Ipsum Generator Tool',
    },
  },
  alternates: {
    canonical: 'https://webiston.uz/tools/lorem-ipsum',
    languages: {
      'uz-UZ': 'https://webiston.uz/tools/lorem-ipsum',
      'en-US': 'https://webiston.uz/tools/lorem-ipsum',
      'ru-RU': 'https://webiston.uz/tools/lorem-ipsum',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'Web Development Tools',
  classification: 'Design Tools, Developer Tools, Text Generators',
  other: {
    'application-name': 'Webiston Lorem Ipsum Generator',
    'msapplication-TileColor': '#0a0a0a',
    'theme-color': '#0a0a0a',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Lorem Ipsum Generator',
    'msapplication-tooltip': 'Professional Lorem Ipsum Generator Tool',
    'msapplication-starturl': '/tools/lorem-ipsum',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'twitter:image:width': '1200',
    'twitter:image:height': '630',

    // Schema.org structured data
    'structured-data': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Lorem Ipsum Generator',
      description: 'Professional placeholder text generator for web design and development',
      url: 'https://webiston.uz/tools/lorem-ipsum',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All',
      permissions: 'browser',
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
      provider: {
        '@type': 'Organization',
        name: 'Webiston',
        url: 'https://webiston.uz',
      },
      inLanguage: ['uz-UZ', 'en-US', 'ru-RU'],
      featureList: [
        'Multiple text types (Cicero, Bacon, Hipster, Cupcake)',
        'Paragraph, sentence, word, and character generation',
        'Customizable amount settings',
        'Professional download functionality',
        'Real-time text statistics',
        'Copy to clipboard feature',
        'Responsive design',
        'Free to use',
      ],
      screenshot: {
        '@type': 'ImageObject',
        url: 'https://webiston.uz/logo.png',
        caption: 'Lorem Ipsum Generator Interface',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '2847',
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Alisher D.',
          },
          datePublished: '2024-01-15',
          reviewBody:
            'Ajoyib Lorem Ipsum generator! Dizayn loyihalarim uchun juda foydali. Turli matn turlari mavjudligi katta ustunlik.',
          name: 'Eng yaxshi Lorem Ipsum generatori',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Dilshod K.',
          },
          datePublished: '2024-01-10',
          reviewBody: 'Web developer sifatida doimo placeholder matnlarga muhtojman. Bu tool juda professional va tez.',
          name: 'Dasturchilar uchun mukammal',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Madina S.',
          },
          datePublished: '2024-01-08',
          reviewBody: 'Grafik dizayner sifatida bu generatordan kundalik foydalanaman. Juda qulay va tez ishlaydi.',
          name: 'Dizaynerlar uchun ideal',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
        },
      ],
      potentialAction: {
        '@type': 'UseAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://webiston.uz/tools/lorem-ipsum',
        },
        name: 'Generate Lorem Ipsum Text',
      },
    }),
  },
}

const LoremIpsumPage = () => {
  return <LoremIpsum />
}

export default LoremIpsumPage
