"use client"

import { cn } from "@webiston/ui"
import { Button } from "@webiston/ui/primitives/button"
import { Volume2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"

import { canPlayTestTone, playTestTone, type ToneChannel } from "../utils/tone"

/**
 * The other half of "my audio is broken".
 *
 * A microphone test can only ever prove the input half, and most people who
 * arrive here cannot tell input from output — the call went wrong, that is all
 * they know. Very often the microphone was fine and the system output was
 * still pointed at an HDMI monitor, or at a Bluetooth headset that had walked
 * out of range.
 *
 * It renders **before and after** permission, on purpose: it needs none, so it
 * is the one thing on this page that still works for somebody who blocked the
 * microphone and cannot get it back.
 *
 * Left and right separately, because a dead channel is a real and common
 * fault — one earbud not charged, a jack half-inserted — and it is invisible to
 * a test that plays through both.
 */

const CHANNELS: readonly ToneChannel[] = ["left", "both", "right"]

export function SpeakerTestCard() {
  const t = useTranslations("MicrophoneTestPage.speakers")
  const [playing, setPlaying] = useState<ToneChannel | null>(null)
  const [supported, setSupported] = useState(true)

  // Checked after mount: `AudioContext` does not exist during the prerender,
  // and a card that renders "unsupported" on the server would flash.
  useEffect(() => {
    setSupported(canPlayTestTone())
  }, [])

  const play = async (channel: ToneChannel) => {
    if (playing) return
    setPlaying(channel)
    try {
      await playTestTone(channel)
    } finally {
      setPlaying(null)
    }
  }

  return (
    <ToolCard title={t("title")} tone="muted">
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("intro")}
      </p>

      {supported ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHANNELS.map((channel) => (
              <Button
                key={channel}
                type="button"
                variant={playing === channel ? "default" : "outline"}
                disabled={playing !== null}
                onClick={() => {
                  void play(channel)
                }}
                className="gap-2"
              >
                <Volume2
                  aria-hidden="true"
                  className={cn(
                    "size-4",
                    playing === channel && "animate-pulse"
                  )}
                />
                {t(`channels.${channel}`)}
              </Button>
            ))}
          </div>

          {/* Said before the first press, not after. The tone is quiet by
              design, but headphones are already on for half the people who
              open this page. */}
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
            {t("volumeNote")}
          </p>

          <p role="status" className="mt-1 text-muted-foreground text-xs">
            {playing
              ? t("playing", { channel: t(`channels.${playing}`) })
              : " "}
          </p>
        </>
      ) : (
        <p className="mt-4 text-muted-foreground text-sm">{t("unsupported")}</p>
      )}
    </ToolCard>
  )
}
