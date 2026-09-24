"use client"

import type { ReactNode } from "react"

import { Documents } from "../../Documents"
import { TATIL_TEMPLATE } from "./index"

/** The client entry point for `/tools/tatil-arizasi`. See `TilxatTool`. */
export function TatilTool({ children }: { children?: ReactNode }) {
  return <Documents template={TATIL_TEMPLATE}>{children}</Documents>
}
