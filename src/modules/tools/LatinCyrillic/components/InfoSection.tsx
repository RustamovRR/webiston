import React from 'react'
import { FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import SectionTitle from '@/components/shared/SectionTitle'
import InfoCard from '@/components/shared/InfoCard/InfoCard'
import { getInfoCardsData } from '../constants/infoCardsData'

const InfoSection: React.FC = () => {
  const t = useTranslations('LatinCyrillicPage')
  const infoCards = getInfoCardsData(t)

  return (
    <div className="mt-12">
      <SectionTitle
        href=""
        icon={<FileText className="h-6 w-6" />}
        title={t('Info.title')}
        description={t('Info.description')}
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
            {card.content}
          </InfoCard>
        ))}
      </div>
    </div>
  )
}

export default InfoSection
