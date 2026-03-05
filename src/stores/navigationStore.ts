import { create } from "zustand"
import type { TutorialNavigation } from "@/lib/mdx"

interface NavigationState {
  navigationItems: Record<string, TutorialNavigation[]>
  setNavigationItems: (tutorialId: string, items: TutorialNavigation[]) => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  navigationItems: {},
  setNavigationItems: (tutorialId, items) =>
    set((state) => ({
      navigationItems: {
        ...state.navigationItems,
        [tutorialId]: items
      }
    }))
}))
