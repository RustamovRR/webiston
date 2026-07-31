"use client"

import {
  BaseModal,
  BaseModalBody,
  BaseModalHeader
} from "@webiston/ui/composites/BaseModal"
import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

/**
 * The words this reader told the converter to leave alone.
 *
 * No engine knows every proper noun. Ours protects ~740 technical terms and
 * every link, address and code span it can see, but a company, a village or a
 * colleague's surname it has never met comes back transliterated and the reader
 * has no way to say otherwise. This is that way.
 *
 * The list never leaves the browser — see the note in the store for why that is
 * the point and not a shortcut.
 */

interface ExceptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  exceptions: readonly string[]
  onAdd: (term: string) => void
  onRemove: (term: string) => void
}

export function ExceptionsDialog({
  isOpen,
  onClose,
  exceptions,
  onAdd,
  onRemove
}: ExceptionsDialogProps) {
  const t = useTranslations("LatinCyrillicPage.exceptions")
  const [draft, setDraft] = useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const term = draft.trim()
    if (!term) return
    onAdd(term)
    setDraft("")
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="md">
      <BaseModalHeader>
        <h2 className="font-semibold text-foreground text-lg">{t("title")}</h2>
        <p className="mt-1 text-pretty text-muted-foreground text-sm">
          {t("description")}
        </p>
      </BaseModalHeader>

      <BaseModalBody>
        {/* A form, not a button with a click handler: Enter is how anyone
            types a list, and a bare input swallows it. */}
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            maxLength={64}
            autoFocus
          />
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2 max-sm:sr-only">{t("add")}</span>
          </Button>
        </form>

        {exceptions.length === 0 ? (
          <p className="mt-6 text-muted-foreground text-sm">{t("empty")}</p>
        ) : (
          <ul className="mt-5 flex flex-wrap gap-2">
            {exceptions.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  onClick={() => onRemove(term)}
                  className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted py-1 pr-2 pl-3 font-mono text-foreground text-xs transition-colors hover:border-destructive/40 hover:bg-destructive/10"
                  aria-label={t("remove", { term })}
                >
                  {term}
                  <X
                    className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-destructive"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </BaseModalBody>
    </BaseModal>
  )
}
