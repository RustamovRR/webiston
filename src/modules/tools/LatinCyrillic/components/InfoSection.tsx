"use client"

import { Card } from "@webiston/ui"
import {
  BarChart3,
  FileText,
  Globe,
  History,
  Languages,
  Type,
  Zap
} from "lucide-react"
import { useTranslations } from "next-intl"
import SectionTitle from "@/components/shared/SectionTitle"
import { getInfoCardsData } from "../constants"

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Languages,
  Type,
  History,
  Globe,
  Zap,
  BarChart3
}

/**
 * Information section displaying alphabet details, rules, and tips
 */
export function InfoSection() {
  const t = useTranslations("LatinCyrillicPage")
  const infoCards = getInfoCardsData(t)

  return (
    <section className="mt-16">
      <SectionTitle
        href=""
        icon={<FileText className="h-6 w-6" />}
        title="O'zbek Alifbosi Haqida"
        description="Lotin va kirill yozuvlari bo'yicha muhim ma'lumotlar"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {infoCards.map((card, index) => {
          const IconComponent = iconMap[card.icon]

          return (
            <Card
              key={index}
              className="group border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800/50 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div className="p-6">
                {/* Header: Icon + Title */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBgColor} transition-transform duration-300 group-hover:scale-110`}
                  >
                    {IconComponent && (
                      <IconComponent className={`h-5 w-5 ${card.iconColor}`} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {card.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="mb-5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {card.description}
                </p>

                {/* Items List */}
                <ul className="space-y-3 mt-3">
                  {card.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${card.dotColor}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
