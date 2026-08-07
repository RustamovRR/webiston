"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { Button } from "@webiston/ui/primitives/button"
import { Download, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { DecodedJwt } from "../types"

/**
 * Header, payload and signature — the three segments, as the token has them.
 *
 * The three parts used to be tinted red / purple / blue after the jwt.io house
 * style. Those colours carry real information THERE, because jwt.io paints the
 * encoded token in the same three so you can see which run of characters is
 * which. We never render the tinted token, so the colours stood in for a
 * mapping that was not on the page.
 *
 * The signature stays behind a toggle and is never decoded. It is a MAC or a
 * curve point — bytes, not text — and it is the secret-adjacent half of a
 * token, so it should not sit on screen by default.
 */

interface TokenPartsProps {
  token: DecodedJwt
  showSignature: boolean
  onToggleSignature: (show: boolean) => void
  onDownload: (part: "header" | "payload") => void
}

function JsonBlock({ json }: { json: string }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-foreground text-xs leading-relaxed">
      <code>{json}</code>
    </pre>
  )
}

export function TokenParts({
  token,
  showSignature,
  onToggleSignature,
  onDownload
}: TokenPartsProps) {
  const t = useTranslations("JwtDecoderPage.Parts")

  return (
    <div className="space-y-6">
      {(["header", "payload"] as const).map((part) => {
        // Serialised ONCE. It was stringified twice per part per render — once
        // for the copy button's `text` and once for the block — over a payload
        // that can carry a large permission array.
        const json = JSON.stringify(token[part], null, 2)
        return (
          <ToolCard
            key={part}
            title={t(`${part}.title`)}
            actions={
              <>
                <CopyButton text={json} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(part)}
                  aria-label={t("download")}
                  title={t("download")}
                >
                  <Download aria-hidden="true" />
                </Button>
              </>
            }
            bodyClassName="space-y-3 p-5"
          >
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(`${part}.description`)}
            </p>
            <JsonBlock json={json} />
          </ToolCard>
        )
      })}

      <ToolCard
        tone="muted"
        title={t("signature.title")}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={showSignature}
            onClick={() => onToggleSignature(!showSignature)}
          >
            {showSignature ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
            {showSignature ? t("signature.hide") : t("signature.show")}
          </Button>
        }
        bodyClassName="space-y-3 p-5"
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("signature.description")}
        </p>
        {showSignature ? (
          <p className="break-all rounded-lg border border-border bg-muted/40 p-3 font-mono text-foreground text-xs">
            {token.signature}
          </p>
        ) : (
          <p className="rounded-lg border border-border border-dashed p-3 text-center text-muted-foreground text-xs">
            {t("signature.hidden")}
          </p>
        )}
      </ToolCard>
    </div>
  )
}
