"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { IpLocation } from "../types"
import { placeLabel } from "../utils/present"

/**
 * The answer, at the size of the question.
 *
 * "What is my IP" is the whole reason anyone opens this page, so the address
 * is the largest thing on it and it is copyable in one click. The layout this
 * replaces put the address in a 31-line `CurrentIpPanel` next to a "control
 * panel" of buttons, at the same weight as the zip code.
 *
 * Renders before the lookup returns, with an em dash where the address goes:
 * the labels are real content, the values are pending, and reserving the
 * layout means the page does not jump when the answer arrives.
 */

const PENDING = "—"

interface IpHeadlineProps {
  data: IpLocation | null
  isLoading: boolean
}

export function IpHeadline({ data, isLoading }: IpHeadlineProps) {
  const t = useTranslations("IpInfoPage.headline")

  const place = data ? placeLabel(data) : null

  return (
    <ToolCard
      title={t("title")}
      actions={
        <CopyButton
          text={data?.ip ?? ""}
          disabled={!data}
          label={t("copyIp")}
        />
      }
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="break-all font-mono text-3xl text-foreground sm:text-4xl">
          {data?.ip ?? PENDING}
        </span>
        {data?.flagEmoji ? (
          <span aria-hidden="true" className="text-2xl">
            {data.flagEmoji}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-muted-foreground">
        {place ?? (isLoading ? t("looking") : PENDING)}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Fact label={t("isp")} value={data?.isp ?? PENDING} />
        <Fact
          label={t("asn")}
          value={
            data?.asn === null || data === null ? PENDING : `AS${data.asn}`
          }
        />
        <Fact label={t("type")} value={data?.type ?? PENDING} />
        <Fact label={t("timezone")} value={data?.timezone ?? PENDING} />
      </dl>
    </ToolCard>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 wrap-break-word font-mono text-foreground text-sm">
        {value}
      </dd>
    </div>
  )
}
