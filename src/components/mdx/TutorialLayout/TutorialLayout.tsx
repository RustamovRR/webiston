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
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] w-full">
      {/* Left Sidebar */}
      <aside className="sticky top-[3.5rem] left-0 z-30 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto max-lg:hidden">
        <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} />
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 overflow-y-auto', className)}>
        <div className="max-w-[1600px] py-6">
          <TutorialLayoutContent>{children}</TutorialLayoutContent>
        </div>
      </main>

      {/* Right Navigation */}
      <nav className="sticky top-[3.5rem] hidden h-[calc(100vh-3.5rem)] w-64 flex-shrink-0 max-lg:hidden lg:block">
        <div className="h-full py-4 pr-4">
          <TableOfContents slug={slug} />
        </div>
      </nav>
    </div>
  )
}
