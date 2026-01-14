import {
  TelegramIcon,
  LinkedInIcon,
  TwitterIcon,
  EmailIcon
} from "@/assets/icons"
import { HandHeartIcon } from "lucide-react"

export const REACT_CHAPTERS = [
  {
    href: "/books/fluent-react/entry-level-stuff",
    title: "React asoslari",
    description: "React paydo bo'lgunga qadar bosqich haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/jsx",
    title: "JSX",
    description: "JSX qanday ichki ishlashi haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/virtual-dom",
    title: "Virtual DOM",
    description: "Virtual DOM qanday ichki ishlashi haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/inside-reconciliation",
    title: "Reconciliation",
    description:
      "Reconciliation mexanizmi qanday ishlashi haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/common-questions",
    title: "Umumiy savollar va javoblar",
    description:
      "React.memo, useMemo va useCallback kabi texnikalarni to'g'ri ishlatish haqida ma'lumot."
  },
  {
    href: "/books/fluent-react/powerful-patterns",
    title: "Kuchli pattern'lar",
    description:
      "Mashhur va kuchli pattern'lar haqida ma'lumot va ularning ahamiyati haqida ma'lumot."
  },
  {
    href: "/books/fluent-react/server-side-react",
    title: "Server tomonda React",
    description:
      "React'ning server tomonda qanday ishlashi haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/concurrent-react",
    title: "React Concurrent",
    description:
      "React'ning bir vaqtda ishlashlik texnikalari haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/frameworks",
    title: "React freymvorklari",
    description:
      "Next.js va Remix kabi React freymvorklari haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/react-server-components",
    title: "React server komponentlari",
    description:
      "React server komponentlari qanday ishlashi haqida batafsil ma'lumot."
  },
  {
    href: "/books/fluent-react/react-alternatives",
    title: "React alternativlari",
    description:
      "Vue, Angular, Svelte va Solid kabi React alternativlari va texnikasi haqida ma'lumot."
  }
]

export const AI_ENGINEERING_CHAPTERS = [
  {
    href: "/books/ai-engineering/1-introduction-to-building-ai-applications-with-foundation-models",
    title: "Fundamental modellar asosida SI ilovalarini yaratish",
    description:
      "SI muhandisligining yuksalishi va fundamental modellar bilan ilovalar yaratish asoslari."
  },
  {
    href: "/books/ai-engineering/2-understanding-foundation-models",
    title: "Fundamental modellar mohiyati",
    description:
      "O'qitish ma'lumotlari, modellashtirish, yakuniy o'qitish va sampling jarayonlari."
  },
  {
    href: "/books/ai-engineering/3-evaluation-methodology",
    title: "Baholash metodologiyasi",
    description:
      "Fundamental modellarni baholash metodologiyasi, metrikalar va SI-baholovchi."
  },
  {
    href: "/books/ai-engineering/4-evaluate-ai-systems",
    title: "SI tizimlarini baholash",
    description:
      "Baholash mezonlari, model tanlash va baholash jarayonlar zanjirini loyihalash."
  },
  {
    href: "/books/ai-engineering/5-prompt-engineering",
    title: "Prompt muhandisligi",
    description:
      "Promptlar bilan tanishuv, eng yaxshi amaliyotlar va himoyaviy prompt muhandisligi."
  }
]

export const JAVASCRIPT_CHAPTERS = [
  {
    href: "/books/javascript-definitive-guide/1-introduction-to-javascript",
    title: "JavaScript'ga kirish",
    description: "JavaScript asoslari va uning veb-dasturlashdagi o'rni."
  },
  {
    href: "/books/javascript-definitive-guide/2-lexical-structure",
    title: "Leksik tuzilma",
    description:
      "JavaScript kodining leksik tuzilishi, o'zgaruvchilar, izohlar va boshqalar."
  },
  {
    href: "/books/javascript-definitive-guide/3-types-and-variables",
    title: "Tiplar va o'zgaruvchilar",
    description:
      "JavaScript'dagi ma'lumotlar turlari va o'zgaruvchilar bilan ishlash."
  },
  {
    href: "/books/javascript-definitive-guide/4-expressions-and-operators",
    title: "Ifodalar va operatorlar",
    description: "JavaScript'dagi arifmetik, mantiqiy va boshqa operatorlar."
  },
  {
    href: "/books/javascript-definitive-guide/5-statements",
    title: "Ko'rsatmalar",
    description:
      "JavaScript'dagi ko'rsatmalar va boshqaruv oqimi: if/else, switch, sikllar va boshqa konstruktsiyalar."
  },
  {
    href: "/books/javascript-definitive-guide/6-objects",
    title: "Obyektlar",
    description:
      "Obyektlar: xossalar, metodlar, prototipik merosxo'rlik va obyektlar bilan ishlash."
  },
  {
    href: "/books/javascript-definitive-guide/7-arrays",
    title: "Massivlar",
    description:
      "Massivlar: yaratish, indekslash, iteratsiya va keng tarqalgan metodlar."
  },
  {
    href: "/books/javascript-definitive-guide/8-functions",
    title: "Funksiyalar",
    description:
      "Funksiyalar: ta'riflash, chaqirish, parametrlar/argumentlar, closure va funksional usullar."
  }
]

export const socialLinks = [
  {
    id: 1,
    href: "https://t.me/webiston_uz",
    icon: <TelegramIcon />,
    label: "Telegram"
  },
  {
    id: 2,
    href: "https://linkedin.com/company/webiston",
    icon: <LinkedInIcon />,
    label: "LinkedIn"
  },
  {
    id: 3,
    href: "https://x.com/webiston_uz",
    icon: <TwitterIcon />,
    label: "X(Twitter)"
  },
  {
    id: 4,
    href: "mailto:webiston.uz@gmail.com",
    icon: <EmailIcon />,
    label: "Email"
  },
  {
    id: 5,
    href: "https://tirikchilik.uz/webiston",
    icon: <HandHeartIcon size={32} />,
    label: "Loyihani qo'llab-quvvatlash"
  }
]
