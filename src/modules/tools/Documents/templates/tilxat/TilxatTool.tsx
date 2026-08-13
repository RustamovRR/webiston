"use client"

import type { ReactNode } from "react"

import { Documents } from "../../Documents"
import { TILXAT_TEMPLATE } from "./index"

/**
 * The client entry point for `/tools/tilxat`.
 *
 * The template object carries FUNCTIONS — `compose`, `validate`, `buildSample`
 * — and a component, none of which can cross the server/client boundary as a
 * prop ("Functions cannot be passed directly to Client Components"). So the
 * route renders this, and the template is picked here, on the client side of
 * the line, with nothing serialised at all.
 */
export function TilxatTool({ children }: { children?: ReactNode }) {
  return <Documents template={TILXAT_TEMPLATE}>{children}</Documents>
}
