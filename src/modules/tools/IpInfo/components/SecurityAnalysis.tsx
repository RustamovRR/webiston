"use client"

import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Server,
  Shield,
  XCircle
} from "lucide-react"
import { useTranslations } from "next-intl"

interface SecurityAnalysisProps {
  ipInfo: any
}

interface SecurityMetric {
  label: string
  value: string
  status: "safe" | "warning" | "danger" | "unknown"
  icon: any
  description: string
}

export default function SecurityAnalysis({ ipInfo }: SecurityAnalysisProps) {
  const t = useTranslations("IpInfoPage.SecurityAnalysis")

  if (!ipInfo) return null

  // Enhanced Security analysis logic
  const getSecurityMetrics = (): SecurityMetric[] => {
    const metrics: SecurityMetric[] = []

    // VPN/Proxy Detection - Enhanced logic
    const isProxy = ipInfo.security?.is_proxy || false
    const usageType = ipInfo.connection?.usage_type?.toLowerCase() || ""
    const isp = ipInfo.connection?.isp?.toLowerCase() || ""

    // Additional VPN/Proxy indicators
    const vpnIndicators = [
      "vpn",
      "proxy",
      "tor",
      "anonymous",
      "private",
      "tunnel",
      "hide",
      "mask",
      "secure",
      "protect",
      "shield"
    ]
    const hasVpnKeywords = vpnIndicators.some(
      (keyword) => isp.includes(keyword) || usageType.includes(keyword)
    )

    const isVpnProxy = isProxy || hasVpnKeywords || usageType.includes("proxy")

    metrics.push({
      label: t("metrics.vpnProxy.label"),
      value: isVpnProxy
        ? t("metrics.vpnProxy.detected")
        : t("metrics.vpnProxy.notDetected"),
      status: isVpnProxy ? "warning" : "safe",
      icon: Eye,
      description: isVpnProxy
        ? t("metrics.vpnProxy.descDetected")
        : t("metrics.vpnProxy.descNotDetected")
    })

    // ISP Type Analysis - Enhanced logic
    const dataenterKeywords = [
      "datacenter",
      "hosting",
      "server",
      "cloud",
      "aws",
      "google",
      "microsoft",
      "digital ocean",
      "linode",
      "vultr",
      "hetzner"
    ]
    const isDataCenter =
      dataenterKeywords.some(
        (keyword) => isp.includes(keyword) || usageType.includes(keyword)
      ) ||
      usageType.includes("datacenter") ||
      usageType.includes("hosting")

    metrics.push({
      label: t("metrics.serverType.label"),
      value: isDataCenter
        ? t("metrics.serverType.dataCenter")
        : t("metrics.serverType.isp"),
      status: isDataCenter ? "warning" : "safe",
      icon: Server,
      description: isDataCenter
        ? t("metrics.serverType.descDataCenter")
        : t("metrics.serverType.descIsp")
    })

    // Bot/Crawler Detection - Enhanced logic
    const isCrawler = ipInfo.security?.is_crawler || false
    const crawlerKeywords = ["bot", "crawler", "spider", "scraper", "automated"]
    const hasCrawlerKeywords = crawlerKeywords.some(
      (keyword) => isp.includes(keyword) || usageType.includes(keyword)
    )

    const isBot = isCrawler || hasCrawlerKeywords

    metrics.push({
      label: t("metrics.botCrawler.label"),
      value: isBot ? t("metrics.botCrawler.yes") : t("metrics.botCrawler.no"),
      status: isBot ? "warning" : "safe",
      icon: Shield,
      description: isBot
        ? t("metrics.botCrawler.descBot")
        : t("metrics.botCrawler.descNotBot")
    })

    return metrics
  }

  const getOverallSecurityScore = (): {
    score: number
    level: string
    color: string
  } => {
    const metrics = getSecurityMetrics()
    const safeCount = metrics.filter((m) => m.status === "safe").length
    const _warningCount = metrics.filter((m) => m.status === "warning").length
    const _dangerCount = metrics.filter((m) => m.status === "danger").length

    const score = Math.round((safeCount / metrics.length) * 100)

    if (score >= 80)
      return {
        score,
        level: t("levels.high"),
        color: "text-success"
      }
    if (score >= 60)
      return {
        score,
        level: t("levels.medium"),
        color: "text-warning"
      }
    return {
      score,
      level: t("levels.low"),
      color: "text-destructive"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case "danger":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-success/10 border-success/30"
      case "warning":
        return "bg-warning/10 border-warning/30"
      case "danger":
        return "bg-destructive/10 border-destructive/30"
      default:
        return "bg-muted border-border"
    }
  }

  const securityMetrics = getSecurityMetrics()
  const securityScore = getOverallSecurityScore()

  return (
    <div className="space-y-4">
      {/* Security Score */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-info" />
            <span className="font-semibold text-foreground">
              {t("securityRating")}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {securityScore.score}%
            </div>
            <div className={`text-sm font-medium ${securityScore.color}`}>
              {securityScore.level}
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="space-y-3">
        {securityMetrics.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <div
              key={index}
              className={`rounded-lg border p-3 ${getStatusBg(metric.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      {metric.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {metric.value}
                  </span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Security Info */}
      {ipInfo.security && (
        <div className="rounded-lg border border-info/50 bg-info/30 p-3">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 text-info" />
            <div className="text-sm">
              <div className="mb-1 font-medium text-info">
                {t("additionalInfo")}
              </div>
              <div className="space-y-1 text-info">
                {ipInfo.security?.proxy_type && (
                  <div>
                    {t("additionalDetails.proxyType")}{" "}
                    <span className="font-medium">
                      {ipInfo.security.proxy_type}
                    </span>
                  </div>
                )}
                {ipInfo.security?.crawler_name && (
                  <div>
                    {t("additionalDetails.crawlerName")}{" "}
                    <span className="font-medium">
                      {ipInfo.security.crawler_name}
                    </span>
                  </div>
                )}
                {ipInfo.connection?.user_type && (
                  <div>
                    {t("additionalDetails.userType")}{" "}
                    <span className="font-medium">
                      {ipInfo.connection.user_type}
                    </span>
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
