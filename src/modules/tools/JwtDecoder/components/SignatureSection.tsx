import React from "react"
import { useTranslations } from "next-intl"
import {
  TerminalInput,
  type TerminalInputAction
} from "@/components/shared/TerminalInput"

interface SignatureSectionProps {
  signature: string
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ signature }) => {
  const t = useTranslations("JwtDecoderPage.SignatureSection")

  const actions: TerminalInputAction[] = [
    {
      type: "copy",
      text: signature
    }
  ]

  const customContent = (
    <div className="p-4 transition-all duration-200">
      <div className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {t("description")}
      </div>
      <pre className="rounded bg-zinc-100 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-800 transition-colors duration-200 dark:bg-zinc-800/50 dark:text-zinc-200">
        {signature}
      </pre>
    </div>
  )

  return (
    <TerminalInput
      title={t("title")}
      readOnly={true}
      actions={actions}
      customContent={customContent}
      minHeight="120px"
      showShadow={true}
      animate={true}
      className="animate-in slide-in-from-top-2 fade-in transition-all duration-300 hover:shadow-md"
    />
  )
}

export default SignatureSection
