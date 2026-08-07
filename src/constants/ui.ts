import {
  Camera,
  FileText,
  FileType,
  Globe,
  Hash,
  Key,
  Link,
  Lock,
  MapPin,
  Mic,
  Monitor,
  Palette,
  QrCode,
  RotateCcw,
  Ruler,
  Share2,
  Shuffle
} from "lucide-react"

export interface Tool {
  tKey: string
  href: string
  icon: any
  color: string
  category: string
  audience: "general" | "developer"
}

export interface ToolCategory {
  id: string
  title: string
  description: string
  tools: Tool[]
}

/**
 * The tools, in the order they are shown.
 *
 * The rule is "how likely is someone to arrive looking for this", descending —
 * so the list stops being arbitrary:
 *
 * 1. The two the owner's analytics actually show traffic for.
 * 2. Tools a visitor comes to the site FOR — a formatter, a password, a colour.
 * 3. Tools a visitor happens to use once — what screen am I on, what is my IP,
 *    does my microphone work. Useful, but nobody searches for them twice.
 */
export const TOOLS_LIST: Tool[] = [
  {
    tKey: "latinCyrillic",
    href: "/tools/latin-cyrillic",
    icon: RotateCcw,
    color: "bg-blue-500/20",
    category: "converters",
    audience: "general"
  },
  {
    tKey: "qrGenerator",
    href: "/tools/qr-generator",
    icon: QrCode,
    color: "bg-yellow-500/20",
    category: "generators",
    audience: "general"
  },
  {
    tKey: "jsonFormatter",
    href: "/tools/json-formatter",
    icon: FileText,
    color: "bg-green-500/20",
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "passwordGenerator",
    href: "/tools/password-generator",
    icon: Lock,
    color: "bg-cyan-500/20",
    category: "generators",
    audience: "general"
  },
  {
    tKey: "colorConverter",
    href: "/tools/color-converter",
    icon: Palette,
    color: "bg-pink-500/20",
    category: "converters",
    audience: "general"
  },
  {
    tKey: "base64Converter",
    href: "/tools/base64-converter",
    icon: Hash,
    color: "bg-purple-500/20",
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "jwtDecoder",
    href: "/tools/jwt-decoder",
    icon: Key,
    color: "bg-red-500/20",
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "urlEncoder",
    href: "/tools/url-encoder",
    icon: Link,
    color: "bg-orange-500/20",
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "hashGenerator",
    href: "/tools/hash-generator",
    icon: Hash,
    color: "bg-indigo-500/20",
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "uuidGenerator",
    href: "/tools/uuid-generator",
    icon: Shuffle,
    color: "bg-teal-500/20",
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "ogMetaGenerator",
    href: "/tools/og-meta-generator",
    icon: Share2,
    color: "bg-blue-500/20",
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "loremIpsum",
    href: "/tools/lorem-ipsum",
    icon: FileType,
    color: "bg-gray-500/20",
    category: "generators",
    audience: "general"
  },
  {
    tKey: "deviceInfo",
    href: "/tools/device-info",
    icon: Monitor,
    color: "bg-slate-500/20",
    category: "analyzers",
    audience: "general"
  },
  {
    tKey: "screenResolution",
    href: "/tools/screen-resolution",
    icon: Ruler,
    color: "bg-purple-600/20",
    category: "analyzers",
    audience: "general"
  },
  {
    tKey: "ipInfo",
    href: "/tools/ip-info",
    icon: MapPin,
    color: "bg-red-600/20",
    category: "analyzers",
    audience: "general"
  },
  {
    tKey: "cameraRecorder",
    href: "/tools/camera-recorder",
    icon: Camera,
    color: "bg-emerald-500/20",
    category: "utilities",
    audience: "general"
  },
  {
    tKey: "microphoneTest",
    href: "/tools/microphone-test",
    icon: Mic,
    color: "bg-blue-600/20",
    category: "utilities",
    audience: "general"
  }
  // The four parked tools stay commented here, not deleted: a `__` route
  // folder is a deliberate parking, not dead code. See the backlog.
  // {
  //   tKey: 'keycodeInfo',
  //   href: '/tools/keycode-info',
  //   icon: Keyboard,
  //   color: 'bg-violet-500/20',
  //   category: 'utilities',
  //   audience: 'developer',
  // },

  // {
  //   tKey: 'userAgentAnalyzer',
  //   href: '/tools/user-agent-analyzer',
  //   icon: User,
  //   color: 'bg-orange-600/20',
  //   category: 'analyzers',
  //   audience: 'developer',
  // },
  // {
  //   tKey: 'websiteStatus',
  //   href: '/tools/website-status',
  //   icon: Globe2,
  //   color: 'bg-green-600/20',
  //   category: 'analyzers',
  //   audience: 'developer',
  // },
  // {
  //   tKey: 'httpStatus',
  //   href: '/tools/http-status',
  //   icon: Server,
  //   color: 'bg-slate-600/20',
  //   category: 'analyzers',
  //   audience: 'developer',
  // },
]

export const TOOL_CATEGORIES: Omit<ToolCategory, "title" | "description">[] = [
  {
    id: "converters",
    tools: TOOLS_LIST.filter((tool) => tool.category === "converters")
  },
  {
    id: "generators",
    tools: TOOLS_LIST.filter((tool) => tool.category === "generators")
  },
  {
    id: "analyzers",
    tools: TOOLS_LIST.filter((tool) => tool.category === "analyzers")
  },
  {
    id: "utilities",
    tools: TOOLS_LIST.filter((tool) => tool.category === "utilities")
  }
]

// Filter options for the UI
export const FILTER_OPTIONS = [
  { value: "all", icon: Globe },
  { value: "converters", icon: RotateCcw },
  { value: "generators", icon: Shuffle },
  { value: "analyzers", icon: Monitor },
  { value: "utilities", icon: FileText }
]

export const AUDIENCE_FILTERS = [
  { value: "all" },
  { value: "general" },
  { value: "developer" }
]
