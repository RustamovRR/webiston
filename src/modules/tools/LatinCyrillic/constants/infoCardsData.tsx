import React from 'react'
import { FileText, ArrowLeftRight } from 'lucide-react'

export const getInfoCardsData = (t: any) => [
  {
    icon: <FileText />,
    title: t('Info.latinAlphabet.title'),
    description: t('Info.latinAlphabet.description'),
    iconBgColor: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    content: (
      <>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong>{t('Info.latinAlphabet.letterCount')}:</strong> 29 ta
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong>{t('Info.latinAlphabet.specialChars')}:</strong> o', g', sh, ch, ng
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong>{t('Info.latinAlphabet.feature')}:</strong> {t('Info.latinAlphabet.featureDesc')}
        </p>
      </>
    ),
  },
  {
    icon: <FileText />,
    title: t('Info.cyrillicAlphabet.title'),
    description: t('Info.cyrillicAlphabet.description'),
    iconBgColor: 'bg-green-500/20',
    iconColor: 'text-green-400',
    content: (
      <>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong>{t('Info.cyrillicAlphabet.letterCount')}:</strong> 35 ta
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong>{t('Info.cyrillicAlphabet.specialChars')}:</strong> ў, ғ, қ, ҳ
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong>{t('Info.cyrillicAlphabet.feature')}:</strong> {t('Info.cyrillicAlphabet.featureDesc')}
        </p>
      </>
    ),
  },
  {
    icon: <ArrowLeftRight />,
    title: t('Info.rules.title'),
    description: '',
    iconBgColor: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    content: (
      <div className="space-y-3 leading-relaxed">
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-300">{t('Info.rules.latinToCyrillic')}</p>
          <p className="text-zinc-600 dark:text-zinc-400">o' → ў, g' → ғ, sh → ш, ch → ч</p>
        </div>
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-300">{t('Info.rules.cyrillicToLatin')}</p>
          <p className="text-zinc-600 dark:text-zinc-400">ў → o', ғ → g', ш → sh, ч → ch</p>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t('Info.rules.accuracy')}</p>
      </div>
    ),
  },
  {
    icon: <FileText />,
    title: t('Info.history.title'),
    description: '',
    iconBgColor: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    content: (
      <>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-800 dark:text-zinc-300">{t('Info.history.period1')}</strong>
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-800 dark:text-zinc-300">{t('Info.history.period2')}</strong>
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-800 dark:text-zinc-300">{t('Info.history.period3')}</strong>
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t('Info.history.note')}</p>
      </>
    ),
  },
  {
    icon: <FileText />,
    title: t('Info.usage.title'),
    description: '',
    iconBgColor: 'bg-red-500/20',
    iconColor: 'text-red-400',
    content: (
      <>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-800 dark:text-zinc-300">{t('Info.usage.latin')}</strong>{' '}
          {t('Info.usage.latinDesc')}
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-800 dark:text-zinc-300">{t('Info.usage.cyrillic')}</strong>{' '}
          {t('Info.usage.cyrillicDesc')}
        </p>
        <p className="text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-800 dark:text-zinc-300">{t('Info.usage.mixed')}</strong>{' '}
          {t('Info.usage.mixedDesc')}
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t('Info.usage.note')}</p>
      </>
    ),
  },
  {
    icon: <FileText />,
    title: t('Info.tips.title'),
    description: '',
    iconBgColor: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    content: (
      <>
        <p className="text-zinc-700 dark:text-zinc-300">{t('Info.tips.tip1')}</p>
        <p className="text-zinc-700 dark:text-zinc-300">{t('Info.tips.tip2')}</p>
        <p className="text-zinc-700 dark:text-zinc-300">{t('Info.tips.tip3')}</p>
        <p className="text-zinc-700 dark:text-zinc-300">{t('Info.tips.tip4')}</p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t('Info.tips.note')}</p>
      </>
    ),
  },
]
