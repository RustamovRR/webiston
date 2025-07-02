import { TutorialLayout } from '@/components/mdx'

export default async function TutorialsLayout({ children, params }: any) {
  return (
    <TutorialLayout className="px-8 max-lg:px-4" params={await params}>
      {children}
    </TutorialLayout>
  )
}
