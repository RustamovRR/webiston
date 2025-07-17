import React from 'react'
import { Download, Upload, FileText, ChevronDown, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ControlPanelProps {
  mode: 'encode' | 'decode'
  setMode: (mode: 'encode' | 'decode') => void
  isProcessing: boolean
  acceptedFileTypes: string
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  samples: Array<{ key: string; label: string; value: string }>
  loadSampleText: (value: string) => void
  handleClear: () => void
  canDownload: boolean
  downloadResult: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  isProcessing,
  acceptedFileTypes,
  handleFileUpload,
  samples,
  loadSampleText,
  handleClear,
  canDownload,
  downloadResult,
}) => {
  const tabOptions = [
    { value: 'encode', label: 'Kodlash (Encode)', icon: <Zap size={16} /> },
    { value: 'decode', label: 'Dekodlash (Decode)', icon: <FileText size={16} /> },
  ]

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-none dark:bg-zinc-900/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <GradientTabs
            options={tabOptions}
            value={mode}
            onChange={(value) => setMode(value as 'encode' | 'decode')}
            toolCategory="converters"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <Button variant="outline" size="sm" asChild disabled={isProcessing}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={16} className="mr-2" />
              Fayl yuklash
            </label>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                Namuna Base64
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
            Tozalash
          </Button>

          <ShimmerButton
            onClick={downloadResult}
            disabled={!canDownload || isProcessing}
            variant={canDownload ? 'default' : 'outline'}
            size="sm"
          >
            <Download size={16} className="mr-2" />
            Yuklab olish
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
