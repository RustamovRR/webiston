import { useTranslations } from "next-intl"
import type React from "react"
import type { HashAlgorithm } from "../hooks/useHashGenerator"

interface AlgorithmInfo {
  status: "deprecated" | "weak" | "secure" | "recommended"
  recommendation: string
  description: string
}

interface AlgorithmSelectorProps {
  availableAlgorithms: HashAlgorithm[]
  selectedAlgorithms: HashAlgorithm[]
  onToggleAlgorithm: (algorithm: HashAlgorithm) => void
  getAlgorithmInfo: (algorithm: HashAlgorithm) => AlgorithmInfo
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  availableAlgorithms,
  selectedAlgorithms,
  onToggleAlgorithm,
  getAlgorithmInfo
}) => {
  const t = useTranslations("HashGeneratorPage.AlgorithmSelector")
  const tInfo = useTranslations("HashGeneratorPage.Info")

  return (
    <div className="mb-6 rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("title") || "Hash Algoritmlari"}
        </span>
      </div>

      {/* Algorithm Buttons */}
      <div className="flex flex-wrap gap-3">
        {availableAlgorithms.map((algorithm) => {
          const info = getAlgorithmInfo(algorithm)
          const isActive = selectedAlgorithms.includes(algorithm)
          return (
            <button
              key={algorithm}
              onClick={() => onToggleAlgorithm(algorithm)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-500/20 text-info"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-zinc-400 hover:text-foreground dark:hover:border-zinc-600"
              }`}
            >
              <span>{algorithm}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  info.status === "deprecated"
                    ? "bg-destructive text-destructive"
                    : info.status === "weak"
                      ? "bg-warning text-warning"
                      : info.status === "secure"
                        ? "bg-info text-info"
                        : "bg-success text-success"
                }`}
              >
                {tInfo(`recommendations.${info.status}`)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AlgorithmSelector
