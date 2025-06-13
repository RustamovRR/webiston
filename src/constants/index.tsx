import { TelegramIcon, LinkedInIcon, TwitterIcon, EmailIcon } from '@/assets/icons'

export const REACT_CHAPTERS = [
  {
    href: '/books/react/entry-level-stuff',
    title: 'React asoslari',
    description: "React paydo bo'lgunga qadar bosqich haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/jsx',
    title: 'JSX',
    description: "JSX qanday ichki ishlashi haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/virtual-dom',
    title: 'Virtual DOM',
    description: "Virtual DOM qanday ichki ishlashi haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/inside-reconciliation',
    title: 'Reconciliation',
    description: "Reconciliation mexanizmi qanday ishlashi haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/common-questions',
    title: 'Umumiy savollar va javoblar',
    description: "React.memo, useMemo va useCallback kabi texnikalarni to'g'ri ishlatish haqida ma'lumot.",
  },
  {
    href: '/books/react/powerful-patterns',
    title: "Kuchli pattern'lar",
    description: "Mashhur va kuchli pattern'lar haqida ma'lumot va ularning ahamiyati haqida ma'lumot.",
  },
  {
    href: '/books/react/server-side-react',
    title: 'Server tomonda React',
    description: "React'ning server tomonda qanday ishlashi haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/concurrent-react',
    title: 'React Concurrent',
    description: "React'ning bir vaqtda ishlashlik texnikalari haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/frameworks',
    title: 'React freymvorklari',
    description: "Next.js va Remix kabi React freymvorklari haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/react-server-components',
    title: 'React server komponentlari',
    description: "React server komponentlari qanday ishlashi haqida batafsil ma'lumot.",
  },
  {
    href: '/books/react/react-alternatives',
    title: 'React alternativlari',
    description: "Vue, Angular, Svelte va Solid kabi React alternativlari va texnikasi haqida ma'lumot.",
  },
]

export const socialLinks = [
  {
    id: 1,
    href: 'https://t.me/webiston_uz',
    icon: <TelegramIcon />,
    label: 'Telegram',
  },
  {
    id: 2,
    href: 'https://linkedin.com/company/webiston',
    icon: <LinkedInIcon />,
    label: 'LinkedIn',
  },
  {
    id: 3,
    href: 'https://x.com/webiston_uz',
    icon: <TwitterIcon />,
    label: 'X(Twitter)',
  },
  {
    id: 4,
    href: 'mailto:webiston.uz@gmail.com',
    icon: <EmailIcon />,
    label: 'Email',
  },
]
