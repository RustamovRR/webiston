"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { Button } from "@webiston/ui/primitives/button"
import { Download, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { ToolHeader } from "@/components/shared/ToolHeader"

import { InfoGroupCard } from "./components/InfoGroupCard"
import { useDeviceInfo } from "./hooks/useDeviceInfo"

/**
 * What this browser says about itself.
 *
 * Six groups in a grid instead of six full-width cards stacked down the page —
 * the facts are short, and a 1,536px row holding one label and one value is
 * mostly empty. What this replaces also put its actions in a bordered
 * "ControlPanel" card of their own, and every panel wore three fake macOS
 * window buttons.
 *
 * There is no loading state and no skeleton: reading `navigator` takes
 * microseconds, so the only frame without data is the server-rendered one,
 * and the empty grid it produces is replaced on the first client tick.
 */
const DeviceInfo = () => {
  const t = useTranslations("DeviceInfoPage")
  const { groups, json, refresh, download } = useDeviceInfo()

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={refresh}>
          <RefreshCw aria-hidden="true" />
          {t("controls.refresh")}
        </Button>
        <CopyButton
          text={json}
          variant="outline"
          label={t("controls.copyAll")}
        />
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups?.map((group) => (
          <InfoGroupCard key={group.key} group={group} />
        ))}
      </div>
    </div>
  )
}

export default DeviceInfo
export { DeviceInfo }
