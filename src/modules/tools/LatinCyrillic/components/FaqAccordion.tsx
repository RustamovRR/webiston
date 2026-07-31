"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@webiston/ui/primitives/accordion"

/**
 * The interactive half of the FAQ.
 *
 * The shared Radix `Accordion`, not a hand-rolled `<details>`. The first
 * version used `<details>` to stay on the server, and paid for it: no
 * animation (the element has none), no `aria-expanded`/`aria-controls` pair,
 * and no single-open behaviour. Radix brings all three, and the height
 * transition now actually runs — the keyframes it has always referenced were
 * missing from the theme until this change.
 *
 * The SERVER component next door still owns the content: it reads the
 * messages and hands them down as plain data, so only the interaction ships
 * as JavaScript.
 */

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-b-0 px-5"
        >
          <AccordionTrigger className="py-4 text-foreground hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pr-6 text-pretty text-muted-foreground leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
