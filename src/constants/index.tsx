import { TelegramIcon, LinkedInIcon, TwitterIcon, EmailIcon } from '@/assets/icons'
import {
  RotateCcw,
  FileText,
  Hash,
  Key,
  QrCode,
  Palette,
  Lock,
  Link,
  Globe,
  Shuffle,
  Monitor,
  Camera,
  Mic,
  Keyboard,
  Share2,
  FileType,
  Ruler,
  User,
  MapPin,
  Globe2,
} from 'lucide-react'

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

export interface Tool {
  title: string
  description: string
  href: string
  icon: any
  color: string
  category: string
}

export interface ToolCategory {
  id: string
  title: string
  description: string
  tools: Tool[]
}

export const TOOLS_LIST: Tool[] = [
  {
    title: "Lotin-Kirill O'giruvchi",
    description: "O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'giring",
    href: '/tools/latin-cyrillic',
    icon: RotateCcw,
    color: 'bg-blue-500',
    category: 'converters',
  },
  {
    title: 'JSON Formatlash',
    description: "JSON ma'lumotlarni formatlash va tasdiqlash vositasi",
    href: '/tools/json-formatter',
    icon: FileText,
    color: 'bg-green-500',
    category: 'converters',
  },
  {
    title: "Base64 O'giruvchi",
    description: "Matn va fayllarni Base64 formatiga o'girish va aksincha",
    href: '/tools/base64-converter',
    icon: Hash,
    color: 'bg-purple-500',
    category: 'converters',
  },
  {
    title: 'URL Kodlash',
    description: 'URL va matnlarni kodlash va dekodlash vositasi',
    href: '/tools/url-encoder',
    icon: Link,
    color: 'bg-orange-500',
    category: 'converters',
  },
  {
    title: 'JWT Dekoder',
    description: 'JSON Web Token (JWT) larni dekodlash va tahlil qilish',
    href: '/tools/jwt-decoder',
    icon: Key,
    color: 'bg-red-500',
    category: 'converters',
  },
  {
    title: "Rang O'giruvchi",
    description: 'HEX, RGB, HSL formatlar orasida rang konvertatsiyasi',
    href: '/tools/color-converter',
    icon: Palette,
    color: 'bg-pink-500',
    category: 'converters',
  },
  {
    title: 'Hash Yaratuvchi',
    description: 'MD5, SHA1, SHA256, SHA512 hash yaratish vositasi',
    href: '/tools/hash-generator',
    icon: Hash,
    color: 'bg-indigo-500',
    category: 'generators',
  },
  {
    title: 'UUID Yaratuvchi',
    description: 'Noyob identifikatorlar (UUID) yaratish vositasi',
    href: '/tools/uuid-generator',
    icon: Shuffle,
    color: 'bg-teal-500',
    category: 'generators',
  },
  {
    title: 'QR Kod Yaratuvchi',
    description: 'Matn va URL lar uchun QR kodlar yaratish',
    href: '/tools/qr-generator',
    icon: QrCode,
    color: 'bg-yellow-500',
    category: 'generators',
  },
  {
    title: 'Parol Yaratuvchi',
    description: 'Xavfsiz va kuchli parollar yaratish vositasi',
    href: '/tools/password-generator',
    icon: Lock,
    color: 'bg-cyan-500',
    category: 'generators',
  },
  {
    title: "Qurilma Ma'lumotlari",
    description: "Brauzer, qurilma va tizim haqida batafsil ma'lumot",
    href: '/tools/device-info',
    icon: Monitor,
    color: 'bg-slate-500',
    category: 'utilities',
  },
  {
    title: 'Kamera Test',
    description: "Kamerangizni sinab ko'ring va video yozing",
    href: '/tools/camera-test',
    icon: Camera,
    color: 'bg-emerald-500',
    category: 'utilities',
  },
  {
    title: 'Mikrofon Test',
    description: "Mikrofonni sinab ko'ring va ovoz yozing",
    href: '/tools/microphone-test',
    icon: Mic,
    color: 'bg-blue-600',
    category: 'utilities',
  },
  {
    title: 'Klaviatura Kodlari',
    description: 'Klaviatura tugmalari kodlarini aniqlang',
    href: '/tools/keycode-info',
    icon: Keyboard,
    color: 'bg-violet-500',
    category: 'utilities',
  },
  {
    title: 'Open Graph Meta',
    description: 'Ijtimoiy tarmoqlar uchun meta taglar yarating',
    href: '/tools/og-meta-generator',
    icon: Share2,
    color: 'bg-blue-500',
    category: 'generators',
  },
  {
    title: 'Lorem Ipsum',
    description: 'Placeholder matn va paragraflar yarating',
    href: '/tools/lorem-ipsum',
    icon: FileType,
    color: 'bg-gray-500',
    category: 'generators',
  },
  {
    title: "Ekran O'lchami",
    description: "Ekran o'lchami va resolution ma'lumotlari",
    href: '/tools/screen-resolution',
    icon: Ruler,
    color: 'bg-purple-600',
    category: 'utilities',
  },
  {
    title: 'User Agent Tahlil',
    description: "Brauzer User Agent ma'lumotlarini tahlil qiling",
    href: '/tools/user-agent-analyzer',
    icon: User,
    color: 'bg-orange-600',
    category: 'utilities',
  },
  {
    title: "IP Ma'lumotlari",
    description: "IP manzil va joylashuv ma'lumotlari",
    href: '/tools/ip-info',
    icon: MapPin,
    color: 'bg-red-600',
    category: 'utilities',
  },
  {
    title: 'Website Status',
    description: 'Website mavjudligi va holatini tekshiring',
    href: '/tools/website-status',
    icon: Globe2,
    color: 'bg-green-600',
    category: 'utilities',
  },
]

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'converters',
    title: "O'giruvchilar",
    description: "Turli formatlar orasida ma'lumot o'girish vositalari",
    tools: TOOLS_LIST.filter((tool) => tool.category === 'converters'),
  },
  {
    id: 'generators',
    title: 'Yaratuvchilar',
    description: "Turli ma'lumotlar va kodlar yaratish vositalari",
    tools: TOOLS_LIST.filter((tool) => tool.category === 'generators'),
  },
  {
    id: 'utilities',
    title: 'Foydali Vositalar',
    description: "Qurilma va tizim ma'lumotlari, test vositalari",
    tools: TOOLS_LIST.filter((tool) => tool.category === 'utilities'),
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
