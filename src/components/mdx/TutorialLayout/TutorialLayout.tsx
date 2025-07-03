import { cn } from '@/lib'
import { getTutorialNavigation } from '@/lib/mdx'
import Sidebar from '../Sidebar'
import TableOfContents from '../TableOfContents'
import TutorialLayoutContent from '../TutorialLayoutContent'

interface DocLayoutProps {
  children: React.ReactNode
  className?: string
  params: {
    slug: string[]
  }
}

export default async function DocLayout({ children, className, params }: DocLayoutProps) {
  const { slug } = await params

  const tutorialId = slug[0]

  // Load navigation on server side
  const navigationItems = await getTutorialNavigation(tutorialId)

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
      {/* Left Sidebar with border */}
      <aside className="border-border sticky top-[3.5rem] left-0 z-30 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto border-r max-lg:hidden">
        <div className="py-6 pl-4">
          <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} />
        </div>
      </aside>

      {/* Main Content - wider container */}
      <main className={cn('flex-1 overflow-y-auto', className)}>
        <div className="mx-auto max-w-5xl px-8 py-8">
          <TutorialLayoutContent>{children}</TutorialLayoutContent>
        </div>
      </main>

      {/* Right Navigation with border */}
      <nav className="sticky top-[3.5rem] hidden h-[calc(100vh-3.5rem)] w-64 flex-shrink-0 max-lg:hidden lg:block">
        <div className="h-full px-4 py-6">
          <TableOfContents slug={slug} />
        </div>
      </nav>
    </div>
  )
}
