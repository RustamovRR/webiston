import { RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui'

interface MetaData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  locale: string
  twitterCard: string
  twitterSite: string
  twitterCreator: string
}

interface TemplateData {
  label: string
  data: Partial<MetaData>
}

interface TemplatesPanelProps {
  presetTemplates: TemplateData[]
  loadTemplate: (data: Partial<MetaData>) => void
  loadSampleData: () => void
  clearForm: () => void
}

export const TemplatesPanel = ({ presetTemplates, loadTemplate, loadSampleData, clearForm }: TemplatesPanelProps) => {
  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-300">Shablonlar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500">Tez Tanlov</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Tayyor shablonlar:</h3>

        {/* Templates Grid */}
        <div className="grid gap-3 md:grid-cols-3">
          {presetTemplates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => loadTemplate(template.data)}
              className="h-auto flex-col items-start gap-2 border-zinc-700 bg-zinc-800/50 p-4 text-left hover:bg-zinc-700/50"
            >
              <span className="text-sm font-medium text-zinc-200">{template.label}</span>
              <span className="text-xs text-zinc-400">
                {template.data.type} | {template.data.twitterCard}
              </span>
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-4">
          <ShimmerButton onClick={loadSampleData} variant="outline" size="sm" className="flex items-center gap-2">
            <Zap size={14} />
            Namuna Ma'lumot
          </ShimmerButton>

          <Button
            onClick={clearForm}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw size={14} />
            Tozalash
          </Button>
        </div>
      </div>
    </div>
  )
}
