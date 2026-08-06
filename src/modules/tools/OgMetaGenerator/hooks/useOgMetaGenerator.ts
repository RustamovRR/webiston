"use client"

import { useMemo } from "react"

import { useOgDraftStore } from "../stores/ogDraftStore"
import type { MetaDraft } from "../types"
import { buildTags, renderHtml, renderNextMetadata } from "../utils/meta"
import { validateDraft } from "../utils/validate"
import { useImageProbe } from "./useImageProbe"

/**
 * The tool's state and everything derived from it.
 *
 * The whole of what this replaces was 601 lines, and its shape was the
 * problem. The output lived in `useState` and was written by a
 * `setTimeout(…, 0)` fired from every field update — which closed over the
 * PREVIOUS `metaData`, so the generated tags trailed one keystroke behind
 * what was on screen. A `useEffect` on the same state then regenerated them a
 * second time, which is what hid the lag well enough to ship. Output is
 * derived here, so there is no second copy of the truth to fall behind.
 *
 * Also gone: `t?: any` — the translator was passed INTO the hook (the
 * `t: any` pattern already removed from the password generator), which is how
 * five templates of hardcoded Uzbek marketing copy ended up living in a hook.
 */
export function useOgMetaGenerator() {
  // Field by field, then assembled in a memo. A selector that RETURNS an
  // object builds a new one on every store read, and `useSyncExternalStore`
  // compares snapshots by identity — that is an infinite render loop, not a
  // style preference.
  const title = useOgDraftStore((state) => state.title)
  const description = useOgDraftStore((state) => state.description)
  const image = useOgDraftStore((state) => state.image)
  const imageAlt = useOgDraftStore((state) => state.imageAlt)
  const url = useOgDraftStore((state) => state.url)
  const siteName = useOgDraftStore((state) => state.siteName)
  const type = useOgDraftStore((state) => state.type)
  const locale = useOgDraftStore((state) => state.locale)
  const twitterCard = useOgDraftStore((state) => state.twitterCard)
  const twitterSite = useOgDraftStore((state) => state.twitterSite)

  const draft = useMemo<MetaDraft>(
    () => ({
      title,
      description,
      image,
      imageAlt,
      url,
      siteName,
      type,
      locale,
      twitterCard,
      twitterSite
    }),
    [
      title,
      description,
      image,
      imageAlt,
      url,
      siteName,
      type,
      locale,
      twitterCard,
      twitterSite
    ]
  )

  const platform = useOgDraftStore((state) => state.platform)
  const output = useOgDraftStore((state) => state.output)
  const setField = useOgDraftStore((state) => state.setField)
  const setPlatform = useOgDraftStore((state) => state.setPlatform)
  const setOutput = useOgDraftStore((state) => state.setOutput)
  const loadSample = useOgDraftStore((state) => state.loadSample)
  const applyImport = useOgDraftStore((state) => state.applyImport)
  const clear = useOgDraftStore((state) => state.clear)

  const probe = useImageProbe(draft.image)

  const groups = useMemo(() => buildTags(draft), [draft])

  const code = useMemo(
    () =>
      output === "next" ? renderNextMetadata(draft) : renderHtml(draft, groups),
    [draft, groups, output]
  )

  const issues = useMemo(() => validateDraft(draft, probe), [draft, probe])

  const tagCount =
    groups.basic.length + groups.og.length + groups.twitter.length

  return {
    draft,
    platform,
    output,
    probe,
    issues,
    code,
    /** Tags, not lines: the comments and blank lines are not meta tags. */
    tagCount,
    hasContent: Boolean(draft.title || draft.description || draft.image),
    setField,
    setPlatform,
    setOutput,
    loadSample,
    applyImport,
    clear
  }
}
