"use client"

import { useRef } from "react"
import { useNavigationStore } from "@/stores/navigationStore"
import type { TutorialNavigation } from "@/lib/mdx"

interface NavigationStoreInitializerProps {
  tutorialId: string
  navigationItems: TutorialNavigation[]
}

function NavigationStoreInitializer({
  tutorialId,
  navigationItems
}: NavigationStoreInitializerProps) {
  const initialized = useRef(false)
  if (!initialized.current) {
    useNavigationStore.setState({
      navigationItems: {
        ...useNavigationStore.getState().navigationItems,
        [tutorialId]: navigationItems
      }
    })
    initialized.current = true
  }
  return null
}

export default NavigationStoreInitializer
