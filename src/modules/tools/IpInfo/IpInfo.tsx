"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback } from "react"

import { ToolHeader } from "@/components/shared/ToolHeader"

import {
  DetailGroupCard,
  IpHeadline,
  LocationMap,
  LookupForm
} from "./components"
import { useIpLookup } from "./hooks/useIpLookup"
import { toGroups, toJson } from "./utils/present"

/**
 * Where an address is, and who runs it.
 *
 * Ordered by the question people arrive with: the address itself, then the way
 * to ask about a different one, then the detail, then the map. What this
 * replaces led with a "control panel" of buttons beside an output pane, and
 * gave a 282-line **fabricated** security score more room than the address.
 *
 * Every panel renders before the lookup returns, with an em dash where the
 * value goes. The labels are real content and the layout is reserved, so the
 * answer arriving does not shove the page around.
 */

/** Row keys per group, so the pending state has the same shape as the answer. */
const PLACEHOLDERS = {
  location: [
    "country",
    "region",
    "city",
    "postal",
    "continent",
    "coordinates",
    "isEu"
  ],
  network: ["ip", "type", "asn", "isp", "org", "domain"],
  time: ["timezone", "utcOffset", "localTime", "callingCode"]
} as const

const IpInfo = () => {
  const t = useTranslations("IpInfoPage")
  const { data, error, isLoading, lookup } = useIpLookup()

  const groups = data ? toGroups(data) : null
  const json = data ? toJson(data) : ""

  const download = useCallback(() => {
    if (!json || !data) return
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" })
    )
    const link = document.createElement("a")
    link.href = url
    // Named after the address, because someone comparing two lookups ends up
    // with two files.
    link.download = `ip-${data.ip.replace(/[.:]/g, "-")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [json, data])

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!json}
          onClick={download}
        >
          <Download aria-hidden="true" />
          {t("controls.download")}
        </Button>
        {data ? (
          <span className="text-muted-foreground text-xs">
            {t("controls.source", { source: data.source })}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <IpHeadline data={data} isLoading={isLoading} />
        <LookupForm onLookup={lookup} isLoading={isLoading} error={error} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="grid grid-cols-1 gap-4">
            <DetailGroupCard
              groupKey="location"
              group={groups?.[0] ?? null}
              placeholderKeys={PLACEHOLDERS.location}
            />
            <DetailGroupCard
              groupKey="time"
              group={groups?.[2] ?? null}
              placeholderKeys={PLACEHOLDERS.time}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <DetailGroupCard
              groupKey="network"
              group={groups?.[1] ?? null}
              placeholderKeys={PLACEHOLDERS.network}
            />
            <LocationMap
              latitude={data?.latitude ?? null}
              longitude={data?.longitude ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IpInfo
export { IpInfo }
