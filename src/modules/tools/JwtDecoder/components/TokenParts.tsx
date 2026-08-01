import { Download } from "lucide-react"
import { useTranslations } from "next-intl"
import type React from "react"
import {
  TerminalInput,
  type TerminalInputAction
} from "@/components/shared/TerminalInput"
import { CodeHighlight } from "@/components/ui"

interface TokenPartsProps {
  header: any
  payload: any
  viewMode: "decoded" | "raw"
  inputText: string
  handleDownloadHeader: () => void
  handleDownloadPayload: () => void
  formatJSON: (json: any) => string
}

const TokenParts: React.FC<TokenPartsProps> = ({
  header,
  payload,
  viewMode,
  inputText,
  handleDownloadHeader,
  handleDownloadPayload,
  formatJSON
}) => {
  const t = useTranslations("JwtDecoderPage.TokenParts")

  // Header actions
  const headerActions: TerminalInputAction[] = [
    {
      type: "custom",
      component: (
        <button
          onClick={handleDownloadHeader}
          className="cursor-pointer rounded-full p-2.5 text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground"
          aria-label="Download Header"
        >
          <Download size={18} />
        </button>
      )
    },
    {
      type: "copy",
      text: formatJSON(header)
    }
  ]

  // Payload actions
  const payloadActions: TerminalInputAction[] = [
    {
      type: "custom",
      component: (
        <button
          onClick={handleDownloadPayload}
          className="cursor-pointer rounded-full p-2.5 text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground"
          aria-label="Download Payload"
        >
          <Download size={18} />
        </button>
      )
    },
    {
      type: "copy",
      text: formatJSON(payload)
    }
  ]

  // Header custom content
  const headerCustomContent = (
    <div className="p-4 transition-all duration-200">
      {viewMode === "decoded" ? (
        <div className="animate-in fade-in duration-300">
          <CodeHighlight
            code={formatJSON(header)}
            language="json"
            showLineNumbers={false}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            {t("rawData")}
          </div>
          <pre className="rounded bg-muted p-3 font-mono text-sm break-all whitespace-pre-wrap text-foreground transition-colors duration-200">
            {inputText.split(".")[0]}
          </pre>
        </div>
      )}
    </div>
  )

  // Payload custom content
  const payloadCustomContent = (
    <div className="p-4 transition-all duration-200">
      {viewMode === "decoded" ? (
        <div className="animate-in fade-in duration-300">
          <CodeHighlight
            code={formatJSON(payload)}
            language="json"
            showLineNumbers={false}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            {t("rawData")}
          </div>
          <pre className="rounded bg-muted p-3 font-mono text-sm break-all whitespace-pre-wrap text-foreground transition-colors duration-200">
            {inputText.split(".")[1]}
          </pre>
        </div>
      )}
    </div>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Header Panel */}
      <TerminalInput
        title={t("header")}
        readOnly={true}
        actions={headerActions}
        customContent={headerCustomContent}
        minHeight="200px"
        showShadow={true}
        animate={true}
        className="transition-all duration-200 hover:shadow-md"
      />

      {/* Payload Panel */}
      <TerminalInput
        title={t("payload")}
        readOnly={true}
        actions={payloadActions}
        customContent={payloadCustomContent}
        minHeight="200px"
        showShadow={true}
        animate={true}
        className="transition-all duration-200 hover:shadow-md"
      />
    </div>
  )
}

export default TokenParts
