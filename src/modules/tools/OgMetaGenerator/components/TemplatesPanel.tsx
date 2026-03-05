"use client"

import { Eye, Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

interface Template {
  label: string
  description: string
  data: any
}

interface TemplatesPanelProps {
  presetTemplates: Template[]
  onLoadTemplate: (data: any) => void
  onLoadSampleData: () => void
  onClearForm: () => void
}

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  presetTemplates,
  onLoadTemplate,
  onLoadSampleData,
  onClearForm
}) => {
  const t = useTranslations("OgMetaGeneratorPage.TemplatesPanel")

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("status")}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("readyTemplates")}
        </h3>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presetTemplates.map((template, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-zinc-100/50 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/70"
              onClick={() => onLoadTemplate(template.data)}
            >
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {template.label}
              </div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {template.description}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                {t("loadButton")}
              </Button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button onClick={onLoadSampleData} variant="outline" size="sm">
            <Eye size={14} className="mr-2" />
            {t("demoData")}
          </Button>
          <Button onClick={onClearForm} variant="outline" size="sm">
            <Zap size={14} className="mr-2" />
            {t("clear")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPanel
