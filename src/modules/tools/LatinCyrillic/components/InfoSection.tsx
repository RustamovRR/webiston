"use client"

import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { InfoCard } from "@/components/shared/InfoCard"
import SectionTitle from "@/components/shared/SectionTitle"
import { getInfoCardsData } from "../constants"

/**
 * Information section displaying alphabet details, rules, and tips
 * Pure presentational component - no business logic
 */
export function InfoSection() {
  const t = useTranslations("LatinCyrillicPage")
  const infoCards = getInfoCardsData(t)

  return (
    <section className="mt-12">
      <SectionTitle
        href=""
        icon={<FileText className="h-6 w-6" />}
        title={t("Info.title")}
        description={t("Info.description")}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {infoCards.map((card, index) => (
          <InfoCard
            key={index}
            icon={card.icon}
            title={card.title}
            description={card.description}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          >
            <ul className="list-disc list-inside space-y-1">
              {card.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </InfoCard>
        ))}
      </div>
    </section>
  )
}
