"use client"

import { type RefObject, useLayoutEffect, useRef, useState } from "react"

interface UseFitToBox {
  /** Put this on the box the content has to fit inside. */
  boxRef: RefObject<HTMLDivElement | null>
  /** A `scale()` factor in (0, 1]. Exactly 1 when nothing has to shrink. */
  fit: number
}

/**
 * Shrink content until all of it is visible. Never enlarge it.
 *
 * carbon.now.sh, ray.so and codeimage all fit the preview to the panel, for the
 * reason this tool needs it too: you are composing a picture, so you have to be
 * able to see the picture. Before this, the "Slayd" preset drew a 972.8 CSS-px
 * card into a 708px panel and put the right-hand third behind a horizontal
 * scrollbar.
 *
 * Only ever downward: blowing a small snapshot up would be soft and would lie
 * about what the export looks like.
 */
export function useFitToBox(contentWidth: number | null): UseFitToBox {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [boxWidth, setBoxWidth] = useState(0)

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return

    const observer = new ResizeObserver(([entry]) => {
      setBoxWidth(entry.contentRect.width)
    })

    /**
     * Seed it synchronously, the SAME way the observer measures.
     *
     * Two mistakes were made here in one sitting and both are worth keeping.
     * The first version seeded from `clientWidth`, which INCLUDES the padding
     * while `contentRect` excludes it: the two disagreed by 32px and the wrong
     * one stood until the next resize, so a picture that needed 0.728 was
     * scaled to 0.761 and still overflowed. The second dropped the seed
     * entirely and trusted `ResizeObserver` to fire on `observe()` — which it
     * does, EXCEPT in a hidden tab, where it never delivered at all and the
     * fit stayed 1. So: seed it, and subtract the padding the same way.
     */
    // `|| 0`, because a computed style is not guaranteed to hand back a
    // number: an engine that reports an empty string for an unset property
    // turns this into NaN, NaN fails the `> 0` test below, and the picture
    // silently stops fitting instead of failing visibly.
    const style = getComputedStyle(box)
    const padding =
      (Number.parseFloat(style.paddingLeft) || 0) +
      (Number.parseFloat(style.paddingRight) || 0)
    setBoxWidth(Math.max(box.clientWidth - padding, 0))

    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const fit =
    contentWidth && boxWidth > 0 ? Math.min(1, boxWidth / contentWidth) : 1

  return { boxRef, fit }
}
