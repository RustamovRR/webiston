'use client'

import { Globe, ImageIcon, Link2, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatsDisplay } from '@/components/shared'

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

interface FormPanelProps {
  metaData: MetaData
  inputStats: Array<{ label: string; value: number }>
  ogTypes: Array<{ value: string; label: string; description: string }>
  twitterCardTypes: Array<{ value: string; label: string; description: string }>
  onUpdateField: (field: keyof MetaData, value: string) => void
}

const FormPanel: React.FC<FormPanelProps> = ({ metaData, inputStats, ogTypes, twitterCardTypes, onUpdateField }) => {
  const t = useTranslations('OgMetaGeneratorPage.FormPanel')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Globe size={16} />
            {t('basicInfo')}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('titleLabel')}
              </label>
              <Input
                value={metaData.title}
                onChange={(e) => onUpdateField('title', e.target.value)}
                placeholder={t('titlePlaceholder')}
                className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                {metaData.title.length}/70 {t('titleCounter')}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('descLabel')}
              </label>
              <Textarea
                value={metaData.description}
                onChange={(e) => onUpdateField('description', e.target.value)}
                placeholder={t('descPlaceholder')}
                className="min-h-[100px] border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                {metaData.description.length}/200 {t('titleCounter')}
              </div>
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <ImageIcon size={16} />
                {t('imageLabel')}
              </label>
              <Input
                value={metaData.image}
                onChange={(e) => onUpdateField('image', e.target.value)}
                placeholder={t('imagePlaceholder')}
                className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Link2 size={16} />
                {t('urlLabel')}
              </label>
              <Input
                value={metaData.url}
                onChange={(e) => onUpdateField('url', e.target.value)}
                placeholder={t('urlPlaceholder')}
                className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('siteNameLabel')}
              </label>
              <Input
                value={metaData.siteName}
                onChange={(e) => onUpdateField('siteName', e.target.value)}
                placeholder={t('siteNamePlaceholder')}
                className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Settings size={16} />
            {t('systemSettings')}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('contentTypeLabel')}
              </label>
              <Select value={metaData.type} onValueChange={(value) => onUpdateField('type', value)}>
                <SelectTrigger className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ogTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('twitterCardLabel')}
              </label>
              <Select value={metaData.twitterCard} onValueChange={(value) => onUpdateField('twitterCard', value)}>
                <SelectTrigger className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {twitterCardTypes.map((card) => (
                    <SelectItem key={card.value} value={card.value}>
                      <div>
                        <div className="font-medium">{card.label}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{card.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('twitterSiteLabel')}
              </label>
              <Input
                value={metaData.twitterSite}
                onChange={(e) => onUpdateField('twitterSite', e.target.value)}
                placeholder={t('twitterSitePlaceholder')}
                className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('twitterCreatorLabel')}
              </label>
              <Input
                value={metaData.twitterCreator}
                onChange={(e) => onUpdateField('twitterCreator', e.target.value)}
                placeholder={t('twitterCreatorPlaceholder')}
                className="border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Display */}
      <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('inputStats')}</h4>
        <StatsDisplay stats={inputStats} />
      </div>
    </div>
  )
}

export default FormPanel
