'use client'

import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

interface ValidationPanelProps {
  metaData: MetaData
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ metaData }) => {
  const t = useTranslations('OgMetaGeneratorPage.ValidationPanel')

  // Calculate SEO Score
  const calculateSeoScore = () => {
    let score = 0
    let maxScore = 100

    // Title validation (30 points)
    if (metaData.title) {
      if (metaData.title.length >= 30 && metaData.title.length <= 60) {
        score += 30
      } else if (metaData.title.length > 0) {
        score += 15
      }
    }

    // Description validation (25 points)
    if (metaData.description) {
      if (metaData.description.length >= 120 && metaData.description.length <= 160) {
        score += 25
      } else if (metaData.description.length > 0) {
        score += 12
      }
    }

    // Image validation (20 points)
    if (metaData.image) {
      if (metaData.image.startsWith('https://')) {
        score += 20
      } else if (metaData.image.startsWith('http://')) {
        score += 10
      }
    }

    // URL validation (15 points)
    if (metaData.url) {
      if (metaData.url.startsWith('https://')) {
        score += 15
      } else if (metaData.url.startsWith('http://')) {
        score += 7
      }
    }

    // Site name validation (10 points)
    if (metaData.siteName && metaData.siteName.length > 0) {
      score += 10
    }

    return Math.round(score)
  }

  const seoScore = calculateSeoScore()

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={20} className="text-green-500" />
    if (score >= 60) return <AlertTriangle size={20} className="text-yellow-500" />
    return <XCircle size={20} className="text-red-500" />
  }

  const validationChecks = [
    {
      label: 'Title Length',
      status:
        metaData.title.length >= 30 && metaData.title.length <= 60
          ? 'perfect'
          : metaData.title.length > 0
            ? 'warning'
            : 'error',
      message:
        metaData.title.length >= 30 && metaData.title.length <= 60
          ? 'Perfect length (30-60 chars)'
          : metaData.title.length > 60
            ? 'Too long (over 60 chars)'
            : metaData.title.length > 0
              ? 'Too short (under 30 chars)'
              : 'Title required',
    },
    {
      label: 'Description Length',
      status:
        metaData.description.length >= 120 && metaData.description.length <= 160
          ? 'perfect'
          : metaData.description.length > 0
            ? 'warning'
            : 'error',
      message:
        metaData.description.length >= 120 && metaData.description.length <= 160
          ? 'Perfect length (120-160 chars)'
          : metaData.description.length > 160
            ? 'Too long (over 160 chars)'
            : metaData.description.length > 0
              ? 'Too short (under 120 chars)'
              : 'Description required',
    },
    {
      label: 'Image URL',
      status: metaData.image.startsWith('https://')
        ? 'perfect'
        : metaData.image.startsWith('http://')
          ? 'warning'
          : metaData.image.length > 0
            ? 'warning'
            : 'error',
      message: metaData.image.startsWith('https://')
        ? 'Secure HTTPS image'
        : metaData.image.startsWith('http://')
          ? 'Use HTTPS for better security'
          : metaData.image.length > 0
            ? 'Invalid URL format'
            : 'Image URL required',
    },
    {
      label: 'Page URL',
      status: metaData.url.startsWith('https://')
        ? 'perfect'
        : metaData.url.startsWith('http://')
          ? 'warning'
          : metaData.url.length > 0
            ? 'warning'
            : 'error',
      message: metaData.url.startsWith('https://')
        ? 'Secure HTTPS URL'
        : metaData.url.startsWith('http://')
          ? 'Use HTTPS for better SEO'
          : metaData.url.length > 0
            ? 'Invalid URL format'
            : 'Page URL required',
    },
  ]

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Smart Validation</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-500">SEO Analysis</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* SEO Score */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getScoreIcon(seoScore)}
              <div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">SEO Score</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">Meta tag optimization</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(seoScore)}`}>{seoScore}/100</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                {seoScore >= 80 ? 'Excellent' : seoScore >= 60 ? 'Good' : 'Needs work'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className={`h-2 rounded-full transition-all ${
                seoScore >= 80 ? 'bg-green-500' : seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${seoScore}%` }}
            />
          </div>
        </div>

        {/* Validation Checks */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Validation Checks</h4>
          <div className="space-y-2">
            {validationChecks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-zinc-50/50 p-3 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  {check.status === 'perfect' && <CheckCircle size={16} className="text-green-500" />}
                  {check.status === 'warning' && <AlertTriangle size={16} className="text-yellow-500" />}
                  {check.status === 'error' && <XCircle size={16} className="text-red-500" />}
                  <div>
                    <div className="teext-zin-700 text-sm font-medium dark:text-zinc-300">{check.label}</div>
                    <div
                      className={`text-xs ${
                        check.status === 'perfect'
                          ? 'text-green-600 dark:text-green-400'
                          : check.status === 'warning'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {check.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="rounded-lg bg-blue-50/50 p-4 dark:bg-blue-900/20">
          <div className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">💡 Quick Tips</div>
          <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
            <li>• Title: 30-60 characters for optimal display</li>
            <li>• Description: 120-160 characters for best results</li>
            <li>• Image: Use 1200x630px for perfect social sharing</li>
            <li>• Always use HTTPS URLs for better security</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ValidationPanel
