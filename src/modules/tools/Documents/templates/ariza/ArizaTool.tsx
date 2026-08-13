"use client"

import type { ReactNode } from "react"

import { Documents } from "../../Documents"
import { ARIZA_TEMPLATE } from "./index"

/** The client entry point for `/tools/ishdan-boshash-arizasi`. See `TilxatTool`. */
export function ArizaTool({ children }: { children?: ReactNode }) {
  return <Documents template={ARIZA_TEMPLATE}>{children}</Documents>
}
