"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@webiston/ui/primitives/select"
import { useId } from "react"

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
}

/**
 * A labelled dropdown.
 *
 * The control panel holds seven of these and they were about to be seven
 * copies of the same twelve lines — the second consumer is where a shared
 * component starts paying for itself (`CLAUDE.md`, "no over-engineering").
 *
 * The label is a real element tied to the trigger by `aria-labelledby` rather
 * than placeholder text: a placeholder disappears the moment a value is
 * chosen, which leaves a screen-reader user with an unnamed combobox.
 */
export function SelectField({
  label,
  value,
  options,
  onChange
}: SelectFieldProps) {
  const labelId = useId()

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={labelId} className="text-muted-foreground text-xs">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-labelledby={labelId} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
