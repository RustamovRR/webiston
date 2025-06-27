import { createCustomPanel } from '@/lib/panel-utils'
import { CopyButton } from '@/components/shared'
import { CodeHighlight } from '@/components/ui'
import type { PanelStatus } from '@/types/panel'

interface JsonOutputPanelProps {
  displayJson: string
  isValid: boolean
  showLineNumbers: boolean
  outputStats: Array<{ label: string; value: number | string }>
}

export const JsonOutputPanel = ({ displayJson, isValid, showLineNumbers, outputStats }: JsonOutputPanelProps) => {
  const status: PanelStatus = isValid ? { type: 'success' } : { type: 'ready' }

  const renderJsonDisplay = () => {
    if (!displayJson) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="text-zinc-500">
            <p className="text-sm">Formatlangan JSON bu yerda ko'rinadi...</p>
            <p className="mt-2 text-xs opacity-75">JSON ma'lumotlarini kiriting</p>
          </div>
        </div>
      )
    }

    return (
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <CodeHighlight language="json" code={displayJson} showLineNumbers={showLineNumbers} className="h-full" />
      </div>
    )
  }

  const actions = <CopyButton text={displayJson} disabled={!isValid} />

  return createCustomPanel('Formatlangan JSON', renderJsonDisplay(), status, outputStats, actions)
}
