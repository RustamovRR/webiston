"use client"

import { useTranslations } from "next-intl"
import { type RefObject, useEffect, useRef } from "react"

import { FFT_SIZE } from "../constants"
import type { ScopeMode } from "../types"

/**
 * The signal, drawn.
 *
 * Two views of the same analyser, because they answer different questions:
 * the **waveform** shows whether the microphone is producing a signal at all
 * and what shape it is — a flat line is a mute switch, a square-topped wave is
 * clipping. The **spectrum** shows where the energy sits, which is how you see
 * a fan, a hum, or a microphone that has no high end.
 *
 * Drawn on a canvas from the animation-frame loop rather than from React
 * state: this is sixty frames a second of a thousand values, and pushing that
 * through a re-render is how a level display becomes the most expensive thing
 * on a page.
 *
 * **Colours are read from the stylesheet**, not hardcoded. Canvas cannot take
 * a class, so the alternative is a hex literal per theme, and the two would
 * drift the moment a token changed. Re-read whenever the theme flips, so the
 * scope follows dark mode the way everything else does.
 */

interface ScopeProps {
  analyserRef: RefObject<AnalyserNode | null>
  mode: ScopeMode
  /** Paused: the canvas clears rather than freezing on the last frame. */
  idle: boolean
}

export function Scope({ analyserRef, mode, idle }: ScopeProps) {
  const t = useTranslations("MicrophoneTestPage.scope")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let frame = 0
    let palette = readPalette(canvas)

    // The theme toggle swaps a class on <html>; nothing else tells a canvas.
    const observer = new MutationObserver(() => {
      palette = readPalette(canvas)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    const timeDomain = new Uint8Array(FFT_SIZE)
    const frequency = new Uint8Array(FFT_SIZE / 2)

    const draw = () => {
      frame = requestAnimationFrame(draw)

      // A canvas sized in CSS pixels is blurry on every laptop sold this
      // decade; the backing store has to match the device.
      const ratio = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio
        canvas.height = height * ratio
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      const analyser = analyserRef.current
      if (!analyser || idle) {
        // The centre line, so an idle scope reads as "ready" rather than
        // "broken".
        context.strokeStyle = palette.muted
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(0, height / 2)
        context.lineTo(width, height / 2)
        context.stroke()
        return
      }

      if (mode === "waveform") {
        analyser.getByteTimeDomainData(timeDomain)
        context.lineWidth = 2
        context.strokeStyle = palette.primary
        context.beginPath()

        const step = width / timeDomain.length
        for (let i = 0; i < timeDomain.length; i++) {
          // Bytes are centred on 128 and span 0–255, so this is the -1..1
          // waveform mapped into the box.
          const value = (timeDomain[i] - 128) / 128
          const y = height / 2 - value * (height / 2 - 2)
          if (i === 0) context.moveTo(0, y)
          else context.lineTo(i * step, y)
        }
        context.stroke()
        return
      }

      analyser.getByteFrequencyData(frequency)
      // Only the lower half is drawn: above about 11kHz a speech microphone
      // has nothing to show, and stretching it across the box makes the part
      // that matters unreadably narrow.
      const bins = Math.floor(frequency.length / 2)
      const barWidth = width / bins
      context.fillStyle = palette.primary
      for (let i = 0; i < bins; i++) {
        const magnitude = frequency[i] / 255
        const barHeight = magnitude * height
        context.fillRect(
          i * barWidth,
          height - barHeight,
          Math.max(barWidth - 1, 1),
          barHeight
        )
      }
    }

    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [analyserRef, mode, idle])

  return (
    <canvas
      ref={canvasRef}
      // Named rather than hidden: a canvas carrying fallback content is
      // focusable, and `aria-hidden` on a focusable element leaves a keyboard
      // user on a control screen readers refuse to describe. The name says
      // what the picture is; the numbers live in the meter beside it.
      role="img"
      aria-label={t(mode)}
      className="h-40 w-full rounded-lg bg-muted/40"
    />
  )
}

/**
 * Token values, resolved through a probe rather than read as variables.
 *
 * Reading `--color-primary` off `getComputedStyle` looks simpler and is a trap:
 * in this build it is declared as `var(--primary)`, so what comes back depends
 * on how far the engine substitutes a custom property at computed-value time —
 * and canvas cannot paint the string `var(--primary)`. Applying the Tailwind
 * class to a throwaway element and reading its `color` asks the cascade the
 * same question the rest of the page asks, and the answer is always a colour.
 *
 * The same trick `device-info` uses to read theme values it cannot know
 * statically. Cheap enough to redo on a theme change and never in a frame loop.
 */
function readPalette(host: HTMLElement) {
  const probe = document.createElement("span")
  probe.style.position = "absolute"
  probe.style.visibility = "hidden"
  probe.style.pointerEvents = "none"
  host.parentElement?.appendChild(probe)

  const colorOf = (className: string, fallback: string) => {
    probe.className = className
    const value = getComputedStyle(probe).color
    return value && !value.includes("var(") ? value : fallback
  }

  const palette = {
    primary: colorOf("text-primary", "currentColor"),
    muted: colorOf("text-border", "currentColor")
  }

  probe.remove()
  return palette
}
