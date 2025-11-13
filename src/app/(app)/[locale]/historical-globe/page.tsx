import { Metadata } from 'next'
import HistoricalGlobe from '@/modules/historical-globe/HistoricalGlobe'

export const metadata: Metadata = {
  title: 'Historical Globe | Webiston',
  description: 'Explore historical borders and territories on an interactive 3D globe from 123,000 BC to present day',
  keywords: 'historical maps, 3D globe, CesiumJS, world history, historical borders, interactive map',
}

export default function HistoricalGlobePage() {
  return <HistoricalGlobe />
}
