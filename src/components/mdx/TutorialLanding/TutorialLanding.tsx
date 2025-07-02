import { formatTutorialName } from '@/lib'

interface TutorialLandingProps {
  tutorialId: string
  tutorialData: {
    title?: string
    description?: string
  }
  navigationItems: any[]
}

export default function TutorialLanding({ tutorialId, tutorialData, navigationItems }: TutorialLandingProps) {
  const formattedTitle = formatTutorialName(tutorialId)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{tutorialData?.title || formattedTitle}</h1>
        {tutorialData?.description && <p className="text-muted-foreground text-lg">{tutorialData.description}</p>}
      </div>

      <div className="bg-card rounded-md border p-8">
        <h2 className="mb-4 text-xl font-semibold">Boshlash</h2>
        <p className="text-muted-foreground mb-4">
          Ushbu darslikka xush kelibsiz! O'rganishni boshlash uchun yon panel navigatsiyasidan mavzuni tanlang.
        </p>

        {navigationItems && navigationItems.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">Mavjud bo'limlar:</h3>
            <ul className="list-disc space-y-1 pl-5">
              {navigationItems.map((item, index) => (
                <li key={index} className="text-muted-foreground">
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-yellow-600 italic dark:text-yellow-400">
            Ushbu darslik uchun navigatsiya elementlari topilmadi.
          </p>
        )}
      </div>
    </div>
  )
}
