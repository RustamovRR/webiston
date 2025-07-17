import React from 'react'
import { Download, Upload, Link, Globe, ChevronDown, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ControlPanelProps {
  mode: 'encode' | 'decode'
  setMode: (mode: 'encode' | 'decode') => void
  isProcessing: boolean
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  samples: Array<{ key: string; label: string; value: string }>
  loadSampleText: (value: string) => void
  handleClear: () => void
  canDownload: boolean
  downloadResult: () => void
  handleModeSwitch: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  isProcessing,
  handleFileUpload,
  samples,
  loadSampleText,
  handleClear,
  canDownload,
  downloadResult,
  handleModeSwitch,
}) => {
  const t = useTranslations('UrlEncoderPage.ControlPanel')

  const tabOptions = [
    { value: 'encode', label: t('encode'), icon: <Link size={16} /> },
    { value: 'decode', label: t('decode'), icon: <Globe size={16} /> },
  ]

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-none dark:bg-zinc-900/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <GradientTabs
            options={tabOptions}
            value={mode}
            onChange={(value) => {
              // Instead of directly setting mode, use handleModeSwitch to properly handle input/output swap
              if (value !== mode) {
                handleModeSwitch()
              }
            }}
            toolCategory="converters"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept=".txt,.json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <Button variant="outline" size="sm" asChild disabled={isProcessing}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={16} className="mr-2" />
              {t('fileUpload')}
            </label>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Link size={16} className="mr-2" />
                {t('sampleUrl')}
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {samples.map((sample) => (
                <DropdownMenuItem key={sample.key} onClick={() => loadSampleText(sample.value)}>
                  {sample.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X size={16} className="mr-2" />
            {t('clear')}
          </Button>

          <ShimmerButton
            onClick={downloadResult}
            disabled={!canDownload || isProcessing}
            variant={canDownload ? 'default' : 'outline'}
            size="sm"
          >
            <Download size={16} className="mr-2" />
            {t('download')}
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
