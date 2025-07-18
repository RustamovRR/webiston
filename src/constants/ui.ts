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
  Server,
} from 'lucide-react'

export interface Tool {
  title: string
  description: string
  href: string
  icon: any
  color: string
  category: string
  audience: 'general' | 'developer'
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
    color: 'bg-blue-500/20',
    category: 'converters',
    audience: 'general',
  },
  {
    title: 'JSON Formatlash',
    description: "JSON ma'lumotlarni formatlash va tasdiqlash vositasi",
    href: '/tools/json-formatter',
    icon: FileText,
    color: 'bg-green-500/20',
    category: 'converters',
    audience: 'developer',
  },
  {
    title: "Base64 O'giruvchi",
    description: "Matn va fayllarni Base64 formatiga o'girish va aksincha",
    href: '/tools/base64-converter',
    icon: Hash,
    color: 'bg-purple-500/20',
    category: 'converters',
    audience: 'developer',
  },
  {
    title: 'URL Kodlash',
    description: 'URL va matnlarni kodlash va dekodlash vositasi',
    href: '/tools/url-encoder',
    icon: Link,
    color: 'bg-orange-500/20',
    category: 'converters',
    audience: 'developer',
  },
  {
    title: 'JWT Dekoder',
    description: 'JSON Web Token (JWT) larni dekodlash va tahlil qilish',
    href: '/tools/jwt-decoder',
    icon: Key,
    color: 'bg-red-500/20',
    category: 'converters',
    audience: 'developer',
  },
  {
    title: "Rang O'giruvchi",
    description: 'HEX, RGB, HSL formatlar orasida rang konvertatsiyasi',
    href: '/tools/color-converter',
    icon: Palette,
    color: 'bg-pink-500/20',
    category: 'converters',
    audience: 'general',
  },
  {
    title: 'Hash Yaratuvchi',
    description: 'MD5, SHA1, SHA256, SHA512 hash yaratish vositasi',
    href: '/tools/hash-generator',
    icon: Hash,
    color: 'bg-indigo-500/20',
    category: 'generators',
    audience: 'developer',
  },
  {
    title: 'UUID Yaratuvchi',
    description: 'Noyob identifikatorlar (UUID) yaratish vositasi',
    href: '/tools/uuid-generator',
    icon: Shuffle,
    color: 'bg-teal-500/20',
    category: 'generators',
    audience: 'developer',
  },
  {
    title: 'QR Kod Yaratuvchi',
    description: 'Matn va URL lar uchun QR kodlar yaratish',
    href: '/tools/qr-generator',
    icon: QrCode,
    color: 'bg-yellow-500/20',
    category: 'generators',
    audience: 'general',
  },
  {
    title: 'Parol Yaratuvchi',
    description: 'Xavfsiz va kuchli parollar yaratish vositasi',
    href: '/tools/password-generator',
    icon: Lock,
    color: 'bg-cyan-500/20',
    category: 'generators',
    audience: 'general',
  },
  {
    title: "Qurilma Ma'lumotlari",
    description: "Brauzer, qurilma va tizim haqida batafsil ma'lumot",
    href: '/tools/device-info',
    icon: Monitor,
    color: 'bg-slate-500/20',
    category: 'analyzers',
    audience: 'general',
  },
  {
    title: 'Kamera Yozib Oluvchi',
    description: "Kamerangizni sinab ko'ring va video yozing",
    href: '/tools/camera-recorder',
    icon: Camera,
    color: 'bg-emerald-500/20',
    category: 'utilities',
    audience: 'general',
  },
  {
    title: 'Mikrofon Test',
    description: "Mikrofonni sinab ko'ring va ovoz yozing",
    href: '/tools/microphone-test',
    icon: Mic,
    color: 'bg-blue-600/20',
    category: 'utilities',
    audience: 'general',
  },
  {
    title: 'Klaviatura Kodlari',
    description: 'Klaviatura tugmalari kodlarini aniqlang',
    href: '/tools/keycode-info',
    icon: Keyboard,
    color: 'bg-violet-500/20',
    category: 'utilities',
    audience: 'developer',
  },
  {
    title: 'Open Graph Meta',
    description: 'Ijtimoiy tarmoqlar uchun meta taglar yarating',
    href: '/tools/og-meta-generator',
    icon: Share2,
    color: 'bg-blue-500/20',
    category: 'generators',
    audience: 'developer',
  },
  {
    title: 'Lorem Ipsum',
    description: 'Placeholder matn va paragraflar yarating',
    href: '/tools/lorem-ipsum',
    icon: FileType,
    color: 'bg-gray-500/20',
    category: 'generators',
    audience: 'general',
  },
  {
    title: "Ekran O'lchami",
    description: "Ekran o'lchami va resolution ma'lumotlari",
    href: '/tools/screen-resolution',
    icon: Ruler,
    color: 'bg-purple-600/20',
    category: 'analyzers',
    audience: 'general',
  },
  {
    title: 'User Agent Tahlil',
    description: "Brauzer User Agent ma'lumotlarini tahlil qiling",
    href: '/tools/user-agent-analyzer',
    icon: User,
    color: 'bg-orange-600/20',
    category: 'analyzers',
    audience: 'developer',
  },
  {
    title: "IP Ma'lumotlari",
    description: "IP manzil va joylashuv ma'lumotlari",
    href: '/tools/ip-info',
    icon: MapPin,
    color: 'bg-red-600/20',
    category: 'analyzers',
    audience: 'general',
  },
  {
    title: 'Website Status',
    description: 'Website mavjudligi va holatini tekshiring',
    href: '/tools/website-status',
    icon: Globe2,
    color: 'bg-green-600/20',
    category: 'analyzers',
    audience: 'developer',
  },
  {
    title: 'HTTP Status Kodlari',
    description: "Barcha HTTP status kodlari va ularning ma'nolari",
    href: '/tools/http-status',
    icon: Server,
    color: 'bg-slate-600/20',
    category: 'analyzers',
    audience: 'developer',
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
    title: 'Generatorlar',
    description: "Turli ma'lumotlar va kodlar yaratish vositalari",
    tools: TOOLS_LIST.filter((tool) => tool.category === 'generators'),
  },
  {
    id: 'analyzers',
    title: 'Tahlilchilar',
    description: "Ma'lumotlarni tahlil qilish va tekshirish vositalari",
    tools: TOOLS_LIST.filter((tool) => tool.category === 'analyzers'),
  },
  {
    id: 'utilities',
    title: 'Yordamchilar',
    description: 'Qurilma test va boshqa foydali vositalar',
    tools: TOOLS_LIST.filter((tool) => tool.category === 'utilities'),
  },
]

// Filter options for the UI
export const FILTER_OPTIONS = [
  { value: 'all', label: 'Barcha vositalar', icon: Globe },
  { value: 'converters', label: "O'giruvchilar", icon: RotateCcw },
  { value: 'generators', label: 'Generatorlar', icon: Shuffle },
  { value: 'analyzers', label: 'Tahlilchilar', icon: Monitor },
  { value: 'utilities', label: 'Yordamchilar', icon: FileText },
]

export const AUDIENCE_FILTERS = [
  { value: 'all', label: 'Barcha' },
  { value: 'general', label: 'Umumiy' },
  { value: 'developer', label: 'Dasturchilar' },
]
