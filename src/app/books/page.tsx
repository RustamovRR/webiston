import type { Metadata } from 'next'
import { getAllTutorials } from '@/lib/mdx'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: "Dasturlash Kitoblari - Bepul O'zbek Tilida IT Kitoblar | Webiston",
  description:
    "Eng yaxshi dasturlash kitoblari o'zbek tilida bepul. JavaScript, React, Node.js va boshqa IT texnologiyalar bo'yicha professional kitoblar to'plami.",
  keywords: [
    // O'zbek tilida eng ko'p qidirilgan
    'dasturlash kitoblari',
    "dasturlash kitoblari o'zbek tilida",
    'programming kitoblar',
    'it kitoblar',
    'javascript kitob',
    'react kitob',
    'nodejs kitob',
    'web development kitob',
    'frontend kitob',
    'backend kitob',
    "bepul dasturlash kitoblari o'zbek",
    "o'zbek dasturlash kitoblari",
    'programming books uzbek',
    'coding kitoblar',
    'software development kitob',
    'computer science kitob',
    'algoritm kitob',
    'data structure kitob',
    'database kitob',
    'html css kitob',
    'typescript kitob',
    'python kitob',
    'java kitob',
    'php kitob',
    'mobile development kitob',
    'android kitob',
    'ios kitob',
    'flutter kitob',
    'react native kitob',

    // Ingliz tilida
    'programming books uzbek',
    'uzbek programming books',
    'free programming books',
    'javascript books uzbek',
    'react books uzbek',
    'web development books',
    'coding books uzbek',
    'software engineering books',
    'computer programming books',
    'it books uzbek language',

    // Rus tilida
    'книги по программированию узбекский',
    'программирование книги узбекский язык',
    'javascript книги узбекский',
    'react книги узбекский',
    'веб разработка книги',
    'бесплатные книги программирование',
    'it книги узбекский',
    'книги по кодингу',

    // Long-tail keywords
    "o'zbek tilida dasturlash kitoblari bepul yuklab olish",
    'professional programming books uzbek language free',
    'книги по программированию на узбекском языке бесплатно',
    'webiston programming books',
    "javascript react nodejs kitoblar o'zbek tilida",
    'web development full course books uzbek',
  ],
  openGraph: {
    title: "Dasturlash Kitoblari - Bepul O'zbek Tilida IT Kitoblar | Webiston",
    description:
      "Eng yaxshi dasturlash kitoblari o'zbek tilida bepul. JavaScript, React, Node.js va boshqa IT texnologiyalar bo'yicha professional kitoblar to'plami.",
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Webiston',
    url: 'https://webiston.uz/books',
    images: [
      {
        url: 'https://webiston.uz/logo.png',
        width: 1200,
        height: 630,
        alt: "Dasturlash Kitoblari - Bepul O'zbek Tilida IT Kitoblar",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@webiston_uz',
    title: "Dasturlash Kitoblari - Bepul O'zbek IT Kitoblar",
    description: "Professional dasturlash kitoblari o'zbek tilida. JavaScript, React va boshqa IT kitoblar bepul!",
    images: ['https://webiston.uz/logo.png'],
  },
  alternates: {
    canonical: 'https://webiston.uz/books',
    languages: {
      uz: 'https://webiston.uz/books',
      'x-default': 'https://webiston.uz/books',
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
  category: 'education',
  classification: 'Books and Education',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': ['WebSite', 'EducationalOrganization'],
  name: "Dasturlash Kitoblari - Bepul O'zbek Tilida IT Kitoblar",
  alternateName: ['Programming Books Uzbek', 'IT Kitoblar', 'Webiston Books'],
  description:
    "Professional dasturlash kitoblari o'zbek tilida. JavaScript, React, Node.js va boshqa IT texnologiyalar bo'yicha bepul kitoblar to'plami.",
  url: 'https://webiston.uz/books',
  sameAs: ['https://webiston.uz/books'],
  publisher: {
    '@type': 'Organization',
    name: 'Webiston',
    url: 'https://webiston.uz',
    logo: {
      '@type': 'ImageObject',
      url: 'https://webiston.uz/logo.png',
      width: 512,
      height: 512,
    },
    sameAs: ['https://github.com/webiston', 'https://twitter.com/webiston_uz'],
  },
  mainEntity: {
    '@type': 'ItemList',
    name: "Dasturlash Kitoblari To'plami",
    description: "O'zbek tilida professional dasturlash kitoblari",
    numberOfItems: 1,
    itemListElement: [
      {
        '@type': 'Book',
        name: 'Fluent React',
        description: "React.js bo'yicha professional kitob",
        inLanguage: 'uz',
        isAccessibleForFree: true,
        publisher: {
          '@type': 'Organization',
          name: 'Webiston',
        },
      },
    ],
  },
  educationalLevel: 'Beginner to Advanced',
  teaches: [
    'JavaScript dasturlash',
    'React.js development',
    'Web development',
    'Frontend development',
    'Backend development',
    'Full-stack development',
    'Software engineering',
    'Computer programming',
  ],
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: ['student', 'developer', 'programmer'],
  },
  keywords: "dasturlash kitoblari, javascript kitob, react kitob, o'zbek programming books",
  inLanguage: 'uz',
  isAccessibleForFree: true,
  datePublished: '2024-01-01',
  dateModified: '2025-01-01',
}

// FAQ Schema for better SERP features
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Dasturlash kitoblari qanday o'qish mumkin?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Bizning saytdagi barcha dasturlash kitoblari bepul va onlayn o'qish uchun mavjud. Har bir kitobni bosqichma-bosqich o'qib chiqishingiz mumkin.",
      },
    },
    {
      '@type': 'Question',
      name: 'Qanday dasturlash kitoblari mavjud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Hozirda JavaScript, React.js va web development bo'yicha kitoblar mavjud. Keyinchalik Node.js, Python va boshqa texnologiyalar bo'yicha kitoblar qo'shiladi.",
      },
    },
    {
      '@type': 'Question',
      name: 'Kitoblar bepulmi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Ha, bizning barcha dasturlash kitoblari to'liq bepul. Hech qanday to'lov yoki ro'yxatdan o'tish talab qilinmaydi.",
      },
    },
    {
      '@type': 'Question',
      name: "Kitoblar qaysi darajadagi o'quvchilar uchun?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Kitoblarimiz boshlang'ich darajadan professional darajagacha mo'ljallangan. Har bir kitobda bosqichma-bosqich tushuntirishlar mavjud.",
      },
    },
  ],
}

// Breadcrumb Schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Bosh sahifa',
      item: 'https://webiston.uz',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Kitoblar',
      item: 'https://webiston.uz/books',
    },
  ],
}

export default async function BooksPage() {
  try {
    const tutorials = await getAllTutorials()

    return (
      <>
        {/* Structured Data Schemas */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold">Dasturlash Kitoblari</h1>
            <p className="text-muted-foreground text-lg">
              Dunyoning yetakchi mutaxassislari tomonidan yozilgan dasturlash kitoblarining professional o'zbekcha
              tarjimalari. Zamonaviy texnologiyalar, fundamental konsepsiyalar va amaliy yondashuvlar — barchasi bir
              joyda, to'liq bepul va yuqori sifatda.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                'AI Engineering',
                'JavaScript',
                'React.js',
                'Web Development',
                'Machine Learning',
                'Professional',
                'Bepul',
                "O'zbek tilida",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-300 bg-zinc-100/80 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {tutorials.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Mavjud Kitoblar ({tutorials.length})</h2>
                <p className="text-muted-foreground">
                  Dunyoning yetakchi dasturchilari tomonidan yozilgan kitoblarning o'zbek tilidagi tarjimalari
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tutorials?.map((tutorial) => (
                  <Link key={tutorial?.id} href={`/books/${tutorial?.id}`} className="group block h-full">
                    <Card className="relative flex h-full flex-col overflow-hidden border-zinc-200 bg-white/80 transition-all duration-200 group-hover:border-zinc-300 group-hover:bg-white group-hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80 dark:group-hover:border-zinc-600 dark:group-hover:bg-zinc-800/80">
                      <div className="relative w-full pt-[50%]">
                        {tutorial?.image && (
                          <Image
                            src={tutorial.image}
                            alt={`${tutorial.title} kitobi muqovasi`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col px-6">
                        <h3 className="mb-2 text-xl font-semibold">{tutorial?.title}</h3>
                        <p className="text-muted-foreground flex-grow pb-4">{tutorial?.description}</p>
                        <div className="mt-auto flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            📚 {tutorial?.navigation?.length || 0} ta bo'lim
                          </div>
                          <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                            Bepul
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Additional SEO Content */}
              <div className="prose prose-gray dark:prose-invert mt-12 max-w-none">
                <h2>Nima uchun bu resursdan foydalanish kerak?</h2>
                <div className="not-prose grid gap-6 md:grid-cols-2">
                  {[
                    {
                      icon: '🎯',
                      title: 'Ishonchli Manbalar',
                      text: 'Kitoblar xalqaro miqyosda tan olingan mualliflar tomonidan yozilgan va biz ularni sifatli tarjima qilamiz.',
                    },
                    {
                      icon: '💰',
                      title: "To'liq Bepul va Ochiq Kodli",
                      text: "Barcha materiallar bepul va ochiq kodli. Bilim olish hammaga ochiq bo'lishi kerak.",
                    },
                    {
                      icon: '🇺🇿',
                      title: "Ona Tilida O'rganish",
                      text: "Murakkab texnologiyalarni o'zbek tilida, tushunarli va izchil o'rganish imkoniyati.",
                    },
                    {
                      icon: '📱',
                      title: 'Eng So‘nggi Bilimlar',
                      text: "Dasturlash olamidagi eng so'nggi va dolzarb texnologiyalar bo'yicha qo'llanmalar.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.icon} {item.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4">
                <span className="text-6xl">📚</span>
              </div>
              <h2 className="mb-2 text-2xl font-semibold">Kitoblar tez orada qo'shiladi</h2>
              <p className="text-muted-foreground mb-4 text-lg">
                Hozircha kitoblar mavjud emas, lekin tez orada JavaScript, React va boshqa texnologiyalar bo'yicha
                professional kitoblar qo'shiladi.
              </p>
              <div className="text-muted-foreground text-sm">
                Yangiliklar uchun bizni kuzatib boring:
                <a href="https://twitter.com/webiston_uz" className="ml-1 text-blue-600 hover:underline">
                  @webiston_uz
                </a>
              </div>
            </div>
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading books:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4">
            <span className="text-6xl">⚠️</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold">Xatolik yuz berdi</h1>
          <p className="text-muted-foreground mb-4">
            Kitoblarni yuklashda muammo bo'ldi. Keyinroq qayta urinib ko'ring.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    )
  }
}
