import type { ReactNode } from "react"

/**
 * What a visitor types, pastes, uploads or generates in a tool — kept out of
 * session replay.
 *
 * Every tool page promises the text never leaves the browser, and a replay
 * recorder is the one script on the page that would break that promise
 * without anyone noticing: Microsoft Clarity masks `<input>` and `<textarea>`
 * on its own, but a result rendered as text — a converted paragraph, a decoded
 * JWT, a generated password, an application letter with the writer's name in
 * it — is recorded verbatim unless an ancestor carries `data-clarity-mask`.
 * Masking happens in the browser, before anything is sent.
 *
 * Wrapped around a route's whole client island rather than each output, so a
 * new output inside an existing tool is covered without anyone remembering
 * to. `PrivateContent.test.ts` holds every tool route to it. The static chrome
 * inside the island (`ToolHeader`) opts back out with `data-clarity-unmask`;
 * the FAQ and tables outside it are never masked.
 *
 * A plain block `<div>`: on all 25 tool routes the island's parent is the
 * tools layout's block `<main className="min-h-screen py-8">` (checked
 * 2026-10-26), so a wrapper changes no layout. Inside a flex or grid parent
 * it would become the item instead of the island — check before reusing.
 */
export function PrivateContent({ children }: { children: ReactNode }) {
  return <div data-clarity-mask="True">{children}</div>
}
