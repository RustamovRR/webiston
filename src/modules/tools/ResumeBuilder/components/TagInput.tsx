"use client"

import { Input } from "@webiston/ui/primitives/input"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

/**
 * Skills, as chips.
 *
 * A comma-separated text field would be less code and worse: the visitor
 * cannot see where one skill ends, cannot remove the third one without
 * editing a string, and every stray comma becomes an empty entry on the
 * paper. Enter or comma commits, Backspace on an empty box removes the last
 * chip — the interaction people already know from every tag field.
 */
export function TagInput({
  id,
  label,
  values,
  onChange,
  placeholder
}: {
  id: string
  /**
   * The input's accessible name.
   *
   * Here rather than a `Field` wrapper because this control is the ONLY thing
   * in its section: a visible `<label>` under a `<legend>` that says the same
   * word is noise, but an input with no name at all is a control a screen
   * reader announces as "edit text".
   */
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const t = useTranslations("ResumePage.form")
  const [draft, setDraft] = useState("")

  const commit = (raw: string) => {
    const value = raw.trim().replace(/,$/, "").trim()
    // Silently ignoring a duplicate beats an error message for something the
    // visitor almost certainly did by accident.
    if (!value || values.includes(value)) return
    onChange([...values, value])
  }

  return (
    <div className="flex flex-col gap-2">
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <li key={value}>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-foreground text-xs">
                {value}
                <button
                  type="button"
                  onClick={() =>
                    onChange(values.filter((_, at) => at !== index))
                  }
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`${value} — ${t("remove")}`}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          // A typed comma commits rather than entering the value — people
          // paste "a, b, c" and expect three chips.
          if (event.target.value.endsWith(",")) {
            commit(event.target.value)
            setDraft("")
            return
          }
          setDraft(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit(draft)
            setDraft("")
          }
          if (event.key === "Backspace" && !draft && values.length > 0) {
            onChange(values.slice(0, -1))
          }
        }}
        // The half-typed skill would otherwise be lost when focus moves on.
        onBlur={() => {
          commit(draft)
          setDraft("")
        }}
      />
    </div>
  )
}
