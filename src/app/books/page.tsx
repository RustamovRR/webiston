// import { TutorialCard } from '@/components/shared'
import { Metadata } from 'next'
import { getAllTutorials } from '@/lib/mdx'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Kitoblar | Webiston',
  description: "Dasturlash bo'yicha keng qamrovli kitoblar to'plami",
  openGraph: {
    title: 'Tutorials | Nolbir',
    description: 'Browse through our comprehensive tutorials on programming and technology.',
    url: 'https://documentation-site-ui.vercel.app/tutorials',
    images: [
      {
        url: `/api/og?title=Tutorials&path=tutorials`,
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default async function BooksPage() {
  try {
    const tutorials = await getAllTutorials()

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Kitoblar</h1>
          <p className="text-muted-foreground text-lg">
            Dasturlash bo'yicha keng qamrovli kitoblar to'plami. Har bir kitob alohida mavzu bo'yicha chuqur bilim
            beradi.
          </p>
        </div>

        {tutorials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/books/${tutorial.id}`}>
                <Card className="h-full p-6 transition-all duration-200 hover:shadow-lg">
                  <h3 className="mb-2 text-xl font-semibold">{tutorial.title}</h3>
                  <p className="text-muted-foreground mb-4">{tutorial.description}</p>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {tutorial.navigation?.length || 0} ta bo'lim
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg">Hozircha kitoblar mavjud emas.</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading books:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">Xatolik yuz berdi</h1>
          <p className="text-muted-foreground">Kitoblarni yuklashda muammo bo'ldi. Keyinroq qayta urinib ko'ring.</p>
        </div>
      </div>
    )
  }
}
