"use client"

import type { ReactNode } from "react"

interface FieldProps {
  id: string
  label: string
  /** Already translated. The composer holds KEYS; this holds sentences. */
  error?: string
  hint?: string
  children: ReactNode
}

/**
 * One labelled input with its error line — the unit every document form is
 * built from, so the error never renders in a different place on a different
 * page.
 */
export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

/** A group of fields under one caption, matching the document's own order. */
export function FieldSet({
  legend,
  children
}: {
  legend: string
  children: ReactNode
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1.5 font-medium text-foreground text-sm">
        {legend}
      </legend>
      {children}
    </fieldset>
  )
}
