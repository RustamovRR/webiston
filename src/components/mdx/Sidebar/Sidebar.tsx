// import { getTutorialNavigation } from '@/api'
import SidebarClient from './SidebarClient'

interface SidebarProps {
  tutorialId: string
}

export default async function Sidebar({ tutorialId }: SidebarProps) {
  // Fetch navigation data server-side
  // const navigation = await getTutorialNavigation(tutorialId).catch((error) => {
  //   console.error('Error fetching navigation:', error)
  //   return { data: [] }
  // })

  // const navigationItems = navigation?.data || []

  return (
    <div className="h-[calc(100vh-3.5rem)] flex-shrink-0 border-r">
      <SidebarClient navigationItems={[]} tutorialId={tutorialId} defaultOpenItem="first" />
    </div>
  )
}
