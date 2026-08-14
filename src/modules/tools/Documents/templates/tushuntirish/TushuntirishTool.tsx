"use client"

import type { ReactNode } from "react"

import { Documents } from "../../Documents"
import { TUSHUNTIRISH_TEMPLATE } from "./index"

/** The client entry point for `/tools/tushuntirish-xati`. See `TilxatTool`. */
export function TushuntirishTool({ children }: { children?: ReactNode }) {
  return <Documents template={TUSHUNTIRISH_TEMPLATE}>{children}</Documents>
}
