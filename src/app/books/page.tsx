// import { TutorialCard } from '@/components/shared'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tutorials | Nolbir',
  description: 'Browse through our comprehensive tutorials on programming and technology.',
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

export default async function TutorialsPage() {
  // const tutorials = await getAllTutorials()

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Darsliklar</h1>
        <p className="text-muted-foreground text-lg">
          Dasturlash va texnologiya bo'yicha keng qamrovli darsliklarimizni ko'rib chiqing. O'rganishni boshlash uchun
          darslikni tanlang.
        </p>
      </div>

      {/* {tutorials.data.length === 0 ? (
        <div className="bg-muted rounded-md p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">Darsliklar mavjud emas</h3>
          <p className="text-muted-foreground">Yangi kontent mavjudligini keyinroq tekshirib ko'ring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.data.map(({ id, title, description }) => (
            <TutorialCard key={id} title={title} description={description} href={`/tutorials/${id}`} />
          ))}
        </div>
      )} */}
    </div>
  )
}
