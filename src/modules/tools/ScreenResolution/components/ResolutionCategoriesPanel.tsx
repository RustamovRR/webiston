"use client"

import { useTranslations } from "next-intl"

interface ResolutionCategory {
  name: string
  resolution: string
}

interface ResolutionCategoriesPanelProps {
  categories: ResolutionCategory[]
  currentCategory?: string
}

const ResolutionCategoriesPanel: React.FC<ResolutionCategoriesPanelProps> = ({
  categories,
  currentCategory
}) => {
  const t = useTranslations("ScreenResolutionPage.ResolutionCategories")

  return (
    <div className="rounded-lg border border-border bg-card/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("title")}
      </h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
              currentCategory === category.name
                ? "border border-info/30 bg-info/20"
                : "bg-muted/50"
            }`}
          >
            <div>
              <div className="font-medium text-zinc-700 dark:text-zinc-300">
                {category.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                {category.resolution}
              </div>
            </div>
            {currentCategory === category.name && (
              <div className="h-2 w-2 rounded-full bg-info"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResolutionCategoriesPanel
