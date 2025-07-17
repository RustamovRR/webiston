import React from 'react'
import { Eye, EyeOff, FileText, ChevronDown, Upload, Key, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ControlPanelProps {
  viewMode: 'decoded' | 'raw'
  setViewMode: (mode: 'decoded' | 'raw') => void
  showSignature: boolean
  handleToggleSignature: () => void
  isProcessing: boolean
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  loadSampleText: (sample: string) => void
  samples: Array<{ key: string; label: string; value: string }>
  isValid: boolean
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  setViewMode,
  showSignature,
  handleToggleSignature,
  isProcessing,
  handleFileUpload,
  loadSampleText,
  samples,
  isValid,
}) => {
  const t = useTranslations('JwtDecoderPage.ControlPanel')

  const viewModeOptions = [
    { value: 'decoded', label: t('decoded'), icon: <Eye size={16} /> },
    { value: 'raw', label: t('raw'), icon: <EyeOff size={16} /> },
  ]

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* View Mode Tabs */}
          <GradientTabs
            options={viewModeOptions}
            value={viewMode}
            onChange={(value) => setViewMode(value as 'decoded' | 'raw')}
            toolCategory="converters"
          />

          {/* Sample Data Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                {t('sampleJwt')}
                <ChevronDown size={14} className="ml-1" />
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

          {/* File Upload */}
          <div>
            <input
              type="file"
              accept=".txt,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="jwt-file-upload"
              disabled={isProcessing}
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="jwt-file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                {isProcessing ? t('uploading') : t('fileUpload')}
              </label>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {isValid && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
              <CheckCircle size={16} />
              <span className="text-sm">{t('validJwt')}</span>
            </div>
          )}

          {/* Signature Toggle */}
          {isValid && (
            <Button onClick={handleToggleSignature} variant={showSignature ? 'default' : 'outline'} size="sm">
              <Key size={16} className="mr-2" />
              {showSignature ? t('hideSignature') : t('showSignature')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
