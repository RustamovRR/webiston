'use client'

import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Server } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SecurityAnalysisProps {
  ipInfo: any
}

interface SecurityMetric {
  label: string
  value: string
  status: 'safe' | 'warning' | 'danger' | 'unknown'
  icon: any
  description: string
}

export default function SecurityAnalysis({ ipInfo }: SecurityAnalysisProps) {
  const t = useTranslations('IpInfoPage.SecurityAnalysis')

  if (!ipInfo) return null

  // Enhanced Security analysis logic
  const getSecurityMetrics = (): SecurityMetric[] => {
    const metrics: SecurityMetric[] = []

    // VPN/Proxy Detection - Enhanced logic
    const isProxy = ipInfo.security?.is_proxy || false
    const usageType = ipInfo.connection?.usage_type?.toLowerCase() || ''
    const isp = ipInfo.connection?.isp?.toLowerCase() || ''

    // Additional VPN/Proxy indicators
    const vpnIndicators = [
      'vpn',
      'proxy',
      'tor',
      'anonymous',
      'private',
      'tunnel',
      'hide',
      'mask',
      'secure',
      'protect',
      'shield',
    ]
    const hasVpnKeywords = vpnIndicators.some((keyword) => isp.includes(keyword) || usageType.includes(keyword))

    const isVpnProxy = isProxy || hasVpnKeywords || usageType.includes('proxy')

    metrics.push({
      label: t('metrics.vpnProxy.label'),
      value: isVpnProxy ? t('metrics.vpnProxy.detected') : t('metrics.vpnProxy.notDetected'),
      status: isVpnProxy ? 'warning' : 'safe',
      icon: Eye,
      description: isVpnProxy ? t('metrics.vpnProxy.descDetected') : t('metrics.vpnProxy.descNotDetected'),
    })

    // ISP Type Analysis - Enhanced logic
    const dataenterKeywords = [
      'datacenter',
      'hosting',
      'server',
      'cloud',
      'aws',
      'google',
      'microsoft',
      'digital ocean',
      'linode',
      'vultr',
      'hetzner',
    ]
    const isDataCenter =
      dataenterKeywords.some((keyword) => isp.includes(keyword) || usageType.includes(keyword)) ||
      usageType.includes('datacenter') ||
      usageType.includes('hosting')

    metrics.push({
      label: t('metrics.serverType.label'),
      value: isDataCenter ? t('metrics.serverType.dataCenter') : t('metrics.serverType.isp'),
      status: isDataCenter ? 'warning' : 'safe',
      icon: Server,
      description: isDataCenter ? t('metrics.serverType.descDataCenter') : t('metrics.serverType.descIsp'),
    })

    // Bot/Crawler Detection - Enhanced logic
    const isCrawler = ipInfo.security?.is_crawler || false
    const crawlerKeywords = ['bot', 'crawler', 'spider', 'scraper', 'automated']
    const hasCrawlerKeywords = crawlerKeywords.some((keyword) => isp.includes(keyword) || usageType.includes(keyword))

    const isBot = isCrawler || hasCrawlerKeywords

    metrics.push({
      label: t('metrics.botCrawler.label'),
      value: isBot ? t('metrics.botCrawler.yes') : t('metrics.botCrawler.no'),
      status: isBot ? 'warning' : 'safe',
      icon: Shield,
      description: isBot ? t('metrics.botCrawler.descBot') : t('metrics.botCrawler.descNotBot'),
    })

    return metrics
  }

  const getOverallSecurityScore = (): { score: number; level: string; color: string } => {
    const metrics = getSecurityMetrics()
    const safeCount = metrics.filter((m) => m.status === 'safe').length
    const warningCount = metrics.filter((m) => m.status === 'warning').length
    const dangerCount = metrics.filter((m) => m.status === 'danger').length

    const score = Math.round((safeCount / metrics.length) * 100)

    if (score >= 80) return { score, level: t('levels.high'), color: 'text-green-600 dark:text-green-400' }
    if (score >= 60) return { score, level: t('levels.medium'), color: 'text-yellow-600 dark:text-yellow-400' }
    return { score, level: t('levels.low'), color: 'text-red-600 dark:text-red-400' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'danger':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'danger':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const securityMetrics = getSecurityMetrics()
  const securityScore = getOverallSecurityScore()

  return (
    <div className="space-y-4">
      {/* Security Score */}
      <div className="rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t('securityRating')}</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{securityScore.score}%</div>
            <div className={`text-sm font-medium ${securityScore.color}`}>{securityScore.level}</div>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="space-y-3">
        {securityMetrics.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <div key={index} className={`rounded-lg border p-3 ${getStatusBg(metric.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{metric.label}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{metric.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{metric.value}</span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Security Info */}
      {ipInfo.security && (
        <div className="rounded-lg border border-blue-200/50 bg-blue-50/30 p-3 dark:border-blue-800/50 dark:bg-blue-900/20">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
            <div className="text-sm">
              <div className="mb-1 font-medium text-blue-800 dark:text-blue-200">{t('additionalInfo')}</div>
              <div className="space-y-1 text-blue-700 dark:text-blue-300">
                {ipInfo.security?.proxy_type && (
                  <div>
                    {t('additionalDetails.proxyType')} <span className="font-medium">{ipInfo.security.proxy_type}</span>
                  </div>
                )}
                {ipInfo.security?.crawler_name && (
                  <div>
                    {t('additionalDetails.crawlerName')}{' '}
                    <span className="font-medium">{ipInfo.security.crawler_name}</span>
                  </div>
                )}
                {ipInfo.connection?.user_type && (
                  <div>
                    {t('additionalDetails.userType')} <span className="font-medium">{ipInfo.connection.user_type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
