import { Hash } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"
import { CopyButton } from "@/components/shared/CopyButton"
import { TerminalInput } from "@/components/shared/TerminalInput"
import type { HashAlgorithm } from "../hooks/useHashGenerator"

interface HashResult {
  algorithm: string
  hash: string
  length: number
  status: "deprecated" | "weak" | "secure" | "recommended"
}

interface AlgorithmInfo {
  status: "deprecated" | "weak" | "secure" | "recommended"
  recommendation: string
  description: string
}

interface DetailedResultsProps {
  hashResults: HashResult[]
  getAlgorithmInfo: (algorithm: HashAlgorithm) => AlgorithmInfo
}

const DetailedResults: React.FC<DetailedResultsProps> = ({
  hashResults,
  getAlgorithmInfo
}) => {
  const t = useTranslations("HashGeneratorPage.DetailedResults")
  const tInfo = useTranslations("HashGeneratorPage.Info")

  if (hashResults.length === 0) return null

  const customContent = (
    <div className="p-6">
      <div className="space-y-4">
        {hashResults.map((result) => {
          const _info = getAlgorithmInfo(result.algorithm as HashAlgorithm)
          return (
            <div
              key={result.algorithm}
              className="rounded-lg border border-border bg-muted/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash size={20} className="text-muted-foreground" />
                  <span className="text-lg font-semibold text-foreground">
                    {result.algorithm}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({result.length} {t("characters") || "belgi"})
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      result.status === "deprecated"
                        ? "bg-destructive text-destructive"
                        : result.status === "weak"
                          ? "bg-warning text-warning"
                          : result.status === "secure"
                            ? "bg-info text-info"
                            : "bg-success text-success"
                    }`}
                  >
                    {tInfo(`descriptions.${result.status}`)}
                  </span>
                </div>
                <CopyButton text={result.hash} />
              </div>
              <div className="rounded bg-muted p-3 font-mono text-sm text-foreground">
                {result.hash}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <TerminalInput
      title={t("title") || "Batafsil Hash Natijalari"}
      customContent={customContent}
      variant="info"
      showShadow={true}
      animate={true}
    />
  )
}

export default DetailedResults
