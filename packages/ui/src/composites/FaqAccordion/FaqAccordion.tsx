"use client"

import type * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../../primitives/accordion"
import { cn } from "../../utils/cn"

/**
 * A question-and-answer card, built on the shared Radix `Accordion`.
 *
 * Shared rather than tool-local because a FAQ is not a Latin↔Cyrillic idea —
 * every tool page that wants one wants exactly this: a bordered card, one row
 * per question, one open at a time, and an answer that slides.
 *
 * The padding lives on the TRIGGER, not on the item. Put it on the item and
 * the trigger is inset from the card edges, so its hover background stops
 * short of them and the row looks half-lit — the whole row has to light up for
 * the pointer to say which question it is on.
 *
 * Content is passed in as data, so the component that reads the translations
 * can stay on the server and only the open/close behaviour ships as JS.
 */

export interface FaqEntry {
  id: string
  question: string
  answer: React.ReactNode
}

export interface FaqAccordionProps {
  items: readonly FaqEntry[]
  /** Which question starts open. Leave unset for an all-closed card. */
  defaultOpenId?: string
  className?: string
}

export function FaqAccordion({
  items,
  defaultOpenId,
  className
}: FaqAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenId}
      className={cn(
        "divide-y divide-border overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-b-0">
          <AccordionTrigger className="rounded-none px-5 py-4 text-base text-foreground transition-colors hover:bg-accent/40 hover:no-underline data-[state=open]:bg-accent/25">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-5 pr-10 text-pretty text-muted-foreground leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
