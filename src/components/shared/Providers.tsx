"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

// Get the props type from the provider itself
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  )
}
