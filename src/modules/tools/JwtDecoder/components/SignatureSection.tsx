import { useTranslations } from "next-intl"
import type React from "react"
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
      <div className="mb-3 text-xs font-medium text-muted-foreground">
        {t("description")}
      </div>
      <pre className="rounded bg-muted p-3 font-mono text-sm break-all whitespace-pre-wrap text-foreground transition-colors duration-200">
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
