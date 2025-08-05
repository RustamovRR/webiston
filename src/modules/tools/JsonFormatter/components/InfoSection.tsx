import React from 'react'
import { FileJson, Database } from 'lucide-react'
import { useTranslations } from 'next-intl'

const InfoSection: React.FC = () => {
  const t = useTranslations('JsonFormatterPage.Info')

  // JSON examples
  const simpleJson = `{
  "name": "John",
  "age": 30,
  "city": "New York"
}`

  const nestedJson = `{
  "person": {
    "name": "John",
    "contacts": {
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  },
  "isActive": true
}`

  return (
    <>
      {/* Examples Section */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <FileJson size={20} className="text-indigo-400" />
          {t('formatExample.title')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-300/30 bg-zinc-100/50 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t('formatExample.simpleObject')}
            </div>
            <pre className="block rounded bg-zinc-200/50 p-2 font-mono text-sm text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
              {simpleJson}
            </pre>
          </div>
          <div className="rounded-lg border border-zinc-300/30 bg-zinc-100/50 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
            <div className="mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t('formatExample.nestedObject')}
            </div>
            <pre className="block rounded bg-zinc-200/50 p-2 font-mono text-sm text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
              {nestedJson}
            </pre>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Database size={20} className="text-indigo-400" />
          {t('title')}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              {t('whatIsJson.title')}
            </h4>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t('whatIsJson.description')}</p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              {t('features.title')}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{t('features.feature1')}</li>
              <li>{t('features.feature2')}</li>
              <li>{t('features.feature3')}</li>
              <li>{t('features.feature4')}</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              {t('usage.title')}
            </h4>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{t('usage.usage1')}</li>
              <li>{t('usage.usage2')}</li>
              <li>{t('usage.usage3')}</li>
              <li>{t('usage.usage4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfoSection
