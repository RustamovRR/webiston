"use client"

import { MAX_USER_TERM_LENGTH, MAX_USER_TERMS } from "@webiston/transliteration"
import {
  BaseModal,
  BaseModalBody,
  BaseModalDescription,
  BaseModalHeader,
  BaseModalTitle
} from "@webiston/ui/composites/BaseModal"
import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { cn } from "@webiston/ui/utils"
import { Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

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
 *
 * Everything the store does SILENTLY is surfaced here instead. `normaliseUserTerms`
 * drops duplicates and stops at the cap, which from the outside looks exactly
 * like a broken button: you type, you press add, nothing happens, no reason
 * given. Both conditions are now checked before the call and reported.
 */

/** How long a rejection stays on screen before the field looks normal again. */
const NOTICE_MS = 2600

/** How long the destructive action stays armed before it disarms itself. */
const CONFIRM_MS = 4000

type Notice = "duplicate" | "full" | null

interface ExceptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  exceptions: readonly string[]
  onAdd: (term: string) => void
  onRemove: (term: string) => void
  onClear: () => void
}

export function ExceptionsDialog({
  isOpen,
  onClose,
  exceptions,
  onAdd,
  onRemove,
  onClear
}: ExceptionsDialogProps) {
  const t = useTranslations("LatinCyrillicPage.exceptions")
  const [draft, setDraft] = useState("")
  const [notice, setNotice] = useState<Notice>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isFull = exceptions.length >= MAX_USER_TERMS
  const trimmed = draft.trim()

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice])

  // Disarms itself. A destructive button left armed is one stray click away
  // from wiping a list the reader spent real time building.
  useEffect(() => {
    if (!confirmingClear) return
    const timer = setTimeout(() => setConfirmingClear(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [confirmingClear])

  // Reopening must not resume a half-finished interaction from last time.
  useEffect(() => {
    if (isOpen) return
    setDraft("")
    setNotice(null)
    setConfirmingClear(false)
  }, [isOpen])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!trimmed) return

    if (isFull) return setNotice("full")

    const isDuplicate = exceptions.some(
      (entry) => entry.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) return setNotice("duplicate")

    onAdd(trimmed)
    setDraft("")
    setNotice(null)
    // Focus stays put: a list is typed in bursts, and hunting for the field
    // again between every word is the difference between adding three and
    // adding thirty.
    inputRef.current?.focus()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Radix Title/Description, not a bare h2/p: without them the dialog
          has no accessible name and Radix logs a warning on every open. */}
      <BaseModalHeader>
        <BaseModalTitle>{t("title")}</BaseModalTitle>
        <BaseModalDescription className="mt-1.5 text-pretty leading-relaxed">
          {t("description")}
        </BaseModalDescription>
      </BaseModalHeader>

      <BaseModalBody className="space-y-5">
        <div>
          {/* A form, not a button with a click handler: Enter is how anyone
              types a list, and a bare input swallows it. */}
          <form onSubmit={submit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                if (notice) setNotice(null)
              }}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              aria-invalid={notice !== null}
              aria-describedby={notice ? "exceptions-notice" : undefined}
              maxLength={MAX_USER_TERM_LENGTH}
              disabled={isFull}
              autoFocus
            />
            <Button type="submit" disabled={!trimmed || isFull}>
              <Plus aria-hidden="true" />
              {t("add")}
            </Button>
          </form>

          {/* Reserved height, so a rejection does not shove the list down and
              back up again. */}
          <p
            id="exceptions-notice"
            role={notice ? "alert" : undefined}
            className={cn(
              "mt-2 min-h-5 text-xs transition-opacity duration-200",
              notice ? "text-destructive opacity-100" : "opacity-0"
            )}
          >
            {notice === "duplicate" && t("duplicate", { term: trimmed })}
            {notice === "full" && t("full", { max: MAX_USER_TERMS })}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-border border-t pt-4">
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            {t("count", { count: exceptions.length, max: MAX_USER_TERMS })}
          </span>

          {exceptions.length > 0 &&
            (confirmingClear ? (
              // Two steps, in place. A confirmation DIALOG on top of a dialog
              // is a stack the Escape key can only unwind one layer of, and it
              // hides the very list it is asking about.
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {t("clearConfirm")}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onClear()
                    setConfirmingClear(false)
                  }}
                >
                  {t("clearYes")}
                </Button>
              </span>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmingClear(true)}
              >
                {t("clearAll")}
              </Button>
            ))}
        </div>

        {exceptions.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            {t("empty")}
          </p>
        ) : (
          // Capped and scrollable. 200 entries is a legal list, and without a
          // ceiling the modal grows past the viewport and the last rows — plus
          // the close button — end up somewhere nobody can reach.
          <ul className="-mx-1 flex max-h-[38vh] flex-wrap gap-2 overflow-y-auto px-1 py-1">
            {exceptions.map((term) => (
              <li key={term} className="max-w-full">
                <button
                  type="button"
                  onClick={() => onRemove(term)}
                  className="group inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted py-1 pr-2 pl-3 font-mono text-foreground text-xs transition-colors hover:border-destructive/40 hover:bg-destructive/10"
                  aria-label={t("remove", { term })}
                >
                  {/* A 64-character entry is legal; without this it pushes the
                      chip past the modal edge. */}
                  <span className="truncate">{term}</span>
                  <X
                    className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive"
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
