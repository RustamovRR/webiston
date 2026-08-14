import {
  Camera,
  Code2,
  Coins,
  FileSignature,
  FileText,
  FileType,
  Globe,
  Hash,
  IdCard,
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
    category: "converters",
    audience: "general"
  },
  {
    tKey: "numberToWords",
    href: "/tools/number-to-words",
    icon: Coins,
    // A TOKEN, not a palette class like the 22 entries above it — and the
    // value is `chart-1` because that is what `CATEGORY_ACCENTS.converters`
    // actually paints this card with. The field has no consumer left: the
    // card reads `accentFor(tool.category)`, so every `color` here is dead
    // data the token ratchet still counts. Adding a 23rd raw class to a field
    // nobody reads is not a trade worth making.
    category: "converters",
    audience: "general"
  },
  {
    // ONE card for the whole document family, not one per document. Routes
    // and cards are independent: each document keeps its own keyword-exact
    // URL for search, while /tools stays a list a person can read. The
    // in-page switcher is how a visitor moves between them.
    tKey: "documents",
    href: "/tools/tilxat",
    icon: FileSignature,
    category: "generators",
    audience: "general"
  },
  {
    // Its own card, NOT part of the documents switcher: a tilxat and an ariza
    // are one errand, a CV is a different one — and "rezyume" is a head term
    // that deserves its own entry on /tools.
    tKey: "rezyume",
    href: "/tools/rezyume",
    icon: IdCard,
    category: "generators",
    audience: "general"
  },
  {
    tKey: "qrGenerator",
    href: "/tools/qr-generator",
    icon: QrCode,
    category: "generators",
    audience: "general"
  },
  {
    tKey: "codeSnapshot",
    href: "/tools/code-snapshot",
    icon: Code2,
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "jsonFormatter",
    href: "/tools/json-formatter",
    icon: FileText,
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "passwordGenerator",
    href: "/tools/password-generator",
    icon: Lock,
    category: "generators",
    audience: "general"
  },
  {
    tKey: "colorConverter",
    href: "/tools/color-converter",
    icon: Palette,
    category: "converters",
    audience: "general"
  },
  {
    tKey: "base64Converter",
    href: "/tools/base64-converter",
    icon: Hash,
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "jwtDecoder",
    href: "/tools/jwt-decoder",
    icon: Key,
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "urlEncoder",
    href: "/tools/url-encoder",
    icon: Link,
    category: "converters",
    audience: "developer"
  },
  {
    tKey: "hashGenerator",
    href: "/tools/hash-generator",
    icon: Hash,
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "uuidGenerator",
    href: "/tools/uuid-generator",
    icon: Shuffle,
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "ogMetaGenerator",
    href: "/tools/og-meta-generator",
    icon: Share2,
    category: "generators",
    audience: "developer"
  },
  {
    tKey: "loremIpsum",
    href: "/tools/lorem-ipsum",
    icon: FileType,
    category: "generators",
    audience: "general"
  },
  {
    tKey: "deviceInfo",
    href: "/tools/device-info",
    icon: Monitor,
    category: "analyzers",
    audience: "general"
  },
  {
    tKey: "screenResolution",
    href: "/tools/screen-resolution",
    icon: Ruler,
    category: "analyzers",
    audience: "general"
  },
  {
    tKey: "ipInfo",
    href: "/tools/ip-info",
    icon: MapPin,
    category: "analyzers",
    audience: "general"
  },
  {
    tKey: "cameraRecorder",
    href: "/tools/camera-recorder",
    icon: Camera,
    category: "utilities",
    audience: "general"
  },
  {
    tKey: "microphoneTest",
    href: "/tools/microphone-test",
    icon: Mic,
    category: "utilities",
    audience: "general"
  }
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
