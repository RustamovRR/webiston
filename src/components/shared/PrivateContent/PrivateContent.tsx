import { cn } from "@webiston/ui"
import type { ReactNode } from "react"

/**
 * A result that holds a visitor's data, kept out of session replay.
 *
 * Both recorders on the site skip form FIELDS on their own — Clarity masks
 * every `<input>` and `<textarea>`, and Yandex Session Replay records a field
 * only when it is marked `ym-record-keys` ("Record all fields" is off on the
 * counter). A result rendered as TEXT is another matter: a decoded JWT, a
 * generated password, an application letter with the writer's name in it is
 * ordinary DOM, and both record it verbatim. This hides it from both, in the
 * browser, before anything is sent:
 *
 * - `data-clarity-mask` — Clarity replaces the text with placeholder blocks.
 * - `ym-hide-content` — Yandex Session Replay leaves the element out.
 *
 * Wrap the RESULT, not the tool. Masking a whole tool island hid every button
 * and label as well, and a recording nobody can read is worth nothing
 * (tried 2026-10-26, rolled back the same day). `DualTextPanel` applies the
 * same two attributes itself, so tools built on it need nothing extra.
 *
 * Renders a `<div>` by default; pass `as="span"` inside inline content.
 */
export function PrivateContent({
  children,
  as: Tag = "div",
  className
}: {
  children: ReactNode
  as?: "div" | "span"
  className?: string
}) {
  return (
    <Tag data-clarity-mask="True" className={cn("ym-hide-content", className)}>
      {children}
    </Tag>
  )
}
