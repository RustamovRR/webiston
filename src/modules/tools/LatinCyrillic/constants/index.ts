/**
 * LatinCyrillic module constants
 */

// Sample texts for testing
export const SAMPLE_TEXTS = {
  LATIN_GREETING: "Assalomu alaykum! O'zbekiston — go'zal mamlakat.",
  LATIN_PARAGRAPH:
    "O'zbek tili — turkiy tillar oilasiga mansub til. U O'zbekistonning davlat tili hisoblanadi. O'zbek tilida 30 milliondan ortiq kishi gaplashadi.",
  CYRILLIC_GREETING: "Ассалому алайкум! Ўзбекистон — гўзал мамлакат.",
  CYRILLIC_PARAGRAPH:
    "Ўзбек тили — туркий тиллар оиласига мансуб тил. У Ўзбекистоннинг давлат тили ҳисобланади. Ўзбек тилида 30 миллиондан ортиқ киши гаплашади.",
  RUSSIAN_GREETING: "Привет! Как дела?",
  RUSSIAN_PARAGRAPH:
    "Русский язык — один из восточнославянских языков. Он является государственным языком России."
} as const

// Info cards data for the info section
export const getInfoCardsData = (t: (key: string) => string) => [
  {
    icon: "Languages",
    title: t("info.latinTitle"),
    description: t("info.latinDescription"),
    items: [t("info.latinItem1"), t("info.latinItem2"), t("info.latinItem3")],
    iconBgColor: "bg-blue-500/20",
    iconColor: "text-blue-400",
    dotColor: "bg-blue-400"
  },
  {
    icon: "Type",
    title: t("info.cyrillicTitle"),
    description: t("info.cyrillicDescription"),
    items: [
      t("info.cyrillicItem1"),
      t("info.cyrillicItem2"),
      t("info.cyrillicItem3")
    ],
    iconBgColor: "bg-purple-500/20",
    iconColor: "text-purple-400",
    dotColor: "bg-purple-400"
  },
  {
    icon: "History",
    title: t("info.historyTitle"),
    description: t("info.historyDescription"),
    items: [
      t("info.historyItem1"),
      t("info.historyItem2"),
      t("info.historyItem3")
    ],
    iconBgColor: "bg-amber-500/20",
    iconColor: "text-amber-400",
    dotColor: "bg-amber-400"
  },
  {
    icon: "Globe",
    title: t("info.usageTitle"),
    description: t("info.usageDescription"),
    items: [t("info.usageItem1"), t("info.usageItem2"), t("info.usageItem3")],
    iconBgColor: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    dotColor: "bg-emerald-400"
  },
  {
    icon: "Zap",
    title: t("info.featuresTitle"),
    description: t("info.featuresDescription"),
    items: [
      t("info.featuresItem1"),
      t("info.featuresItem2"),
      t("info.featuresItem3")
    ],
    iconBgColor: "bg-green-500/20",
    iconColor: "text-green-400",
    dotColor: "bg-green-400"
  },
  {
    icon: "BarChart3",
    title: t("info.statisticsTitle"),
    description: t("info.statisticsDescription"),
    items: [
      t("info.statisticsItem1"),
      t("info.statisticsItem2"),
      t("info.statisticsItem3")
    ],
    iconBgColor: "bg-rose-500/20",
    iconColor: "text-rose-400",
    dotColor: "bg-rose-400"
  }
]
