import React from 'react'
import { Download, Upload, FileJson, Eye, EyeOff, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShimmerButton } from '@/components/ui'

interface ControlPanelProps {
  indentation: string
  setIndentation: (value: string) => void
  showLineNumbers: boolean
  isMinified: boolean
  isValid: boolean
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  loadSampleJson: () => void
  clearInput: () => void
  toggleMinify: () => void
  toggleLineNumbers: () => void
  downloadResult: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  indentation,
  setIndentation,
  showLineNumbers,
  isMinified,
  isValid,
  handleFileUpload,
  loadSampleJson,
  clearInput,
  toggleMinify,
  toggleLineNumbers,
  downloadResult,
}) => {
  const t = useTranslations('JsonFormatterPage.ControlPanel')

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-none dark:bg-zinc-900/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('actions')}</span>
          <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={16} className="mr-2" />
              {t('fileUpload')}
            </label>
          </Button>
          <ShimmerButton
            onClick={loadSampleJson}
            variant="outline"
            size="sm"
            className="border-input border !bg-white !text-zinc-700 hover:!bg-zinc-50 dark:!border-zinc-700 dark:!bg-zinc-800 dark:!text-zinc-300 dark:hover:!bg-zinc-700"
          >
            <FileJson size={16} className="mr-2" />
            {t('sampleJson')}
          </ShimmerButton>
          <Button variant="ghost" size="sm" onClick={clearInput}>
            <X size={16} className="mr-2" />
            {t('clear')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{t('indentation')}</span>
            <Select value={indentation} onValueChange={setIndentation}>
              <SelectTrigger className="w-20 border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLineNumbers}
            className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            title={showLineNumbers ? t('hideLineNumbers') : t('showLineNumbers')}
          >
            {showLineNumbers ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="ml-2 hidden sm:inline">{t('lineNumbers')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMinify}
            className={`text-sm transition-colors ${
              isMinified
                ? 'text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300'
                : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
            title={isMinified ? t('formattedView') : t('minifiedView')}
          >
            {isMinified ? t('formatted') : t('minified')}
          </Button>

          <ShimmerButton
            onClick={downloadResult}
            disabled={!isValid}
            variant={isValid ? 'default' : 'outline'}
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
