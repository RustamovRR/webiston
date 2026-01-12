"use strict"
var __defProp = Object.defineProperty
var __getOwnPropDesc = Object.getOwnPropertyDescriptor
var __getOwnPropNames = Object.getOwnPropertyNames
var __hasOwnProp = Object.prototype.hasOwnProperty
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true })
}
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        })
  }
  return to
}
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod)

// src/index.ts
var index_exports = {}
__export(index_exports, {
  APOSTROPHE_VARIANTS: () => APOSTROPHE_VARIANTS,
  NON_TRANSLITERATABLE_WORDS: () => NON_TRANSLITERATABLE_WORDS,
  UZBEK_SUFFIXES: () => UZBEK_SUFFIXES,
  isCyrillicText: () => isCyrillicText,
  toCyrillic: () => toCyrillic,
  toLatin: () => toLatin
})
module.exports = __toCommonJS(index_exports)

// src/constants/protected-words/brands.ts
var BRANDS_AND_PLATFORMS = [
  // Tech Giants
  "google",
  "microsoft",
  "apple",
  "amazon",
  "meta",
  "facebook",
  "instagram",
  "whatsapp",
  "twitter",
  "linkedin",
  "tiktok",
  "snapchat",
  "pinterest",
  // Dev Platforms
  "github",
  "gitlab",
  "bitbucket",
  "codeberg",
  "stackoverflow",
  "reddit",
  "hackernews",
  "devto",
  "medium",
  "hashnode",
  // Cloud Providers
  "aws",
  "azure",
  "gcp",
  "digitalocean",
  "linode",
  "vultr",
  "hetzner",
  "cloudflare",
  "akamai",
  // Hosting/Deploy
  "vercel",
  "netlify",
  "heroku",
  "railway",
  "render",
  "fly",
  // Databases
  "mongodb",
  "postgres",
  "postgresql",
  "mysql",
  "sqlite",
  "redis",
  "elasticsearch",
  "cassandra",
  "dynamodb",
  "firestore",
  "planetscale",
  "neon",
  "turso",
  "cockroachdb",
  // Services
  "stripe",
  "paypal",
  "twilio",
  "sendgrid",
  "mailchimp",
  "algolia",
  "meilisearch",
  "typesense",
  "sentry",
  "datadog",
  "newrelic",
  "grafana",
  // Communication
  "slack",
  "discord",
  "telegram",
  "zoom",
  "teams",
  // Design
  "figma",
  "sketch",
  "adobe",
  "canva",
  "framer",
  // AI/ML
  "openai",
  "chatgpt",
  "gpt",
  "claude",
  "anthropic",
  "gemini",
  "bard",
  "copilot",
  "midjourney",
  "dalle",
  "huggingface",
  "tensorflow",
  "pytorch",
  "keras",
  // Video
  "youtube",
  "vimeo",
  "twitch",
  "netflix",
  "spotify"
]

// src/constants/protected-words/frameworks.ts
var FRAMEWORKS_AND_TOOLS = [
  // JavaScript Frameworks
  "react",
  "vue",
  "angular",
  "svelte",
  "solid",
  "next",
  "nextjs",
  "nuxt",
  "nuxtjs",
  "gatsby",
  "remix",
  "astro",
  "qwik",
  "preact",
  // CSS Frameworks
  "tailwind",
  "tailwindcss",
  "bootstrap",
  "bulma",
  "chakra",
  "mui",
  "antd",
  "styled",
  // Backend Frameworks
  "express",
  "fastify",
  "nestjs",
  "koa",
  "hapi",
  "django",
  "flask",
  "fastapi",
  "rails",
  "laravel",
  "spring",
  "dotnet",
  "gin",
  "echo",
  "fiber",
  // Build Tools
  "webpack",
  "vite",
  "rollup",
  "esbuild",
  "parcel",
  "turbopack",
  "swc",
  "babel",
  "tsc",
  // Package Managers
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "deno",
  "pip",
  "cargo",
  "gem",
  "composer",
  "maven",
  "gradle",
  // Runtime
  "node",
  "nodejs",
  // Testing
  "jest",
  "vitest",
  "mocha",
  "chai",
  "cypress",
  "playwright",
  "puppeteer",
  "selenium",
  // Linting/Formatting
  "eslint",
  "prettier",
  "biome",
  "oxlint",
  "stylelint",
  // State Management
  "redux",
  "zustand",
  "mobx",
  "recoil",
  "jotai",
  "valtio",
  // Data Fetching
  "axios",
  "fetch",
  "swr",
  "tanstack",
  "trpc",
  "graphql",
  "apollo",
  "urql",
  "relay",
  // ORM/Database
  "prisma",
  "drizzle",
  "typeorm",
  "sequelize",
  "mongoose",
  "knex",
  "objection",
  // Auth
  "nextauth",
  "auth0",
  "clerk",
  "supabase",
  "firebase",
  // CMS
  "strapi",
  "sanity",
  "contentful",
  "ghost",
  "wordpress",
  // Deployment
  "docker",
  "kubernetes",
  "terraform",
  "ansible",
  "nginx",
  "apache",
  "caddy"
]

// src/constants/protected-words/international.ts
var INTERNATIONAL_ACRONYMS = [
  // Countries (common codes)
  "usa",
  "uae",
  "cis",
  // International Organizations
  "nato",
  "unesco",
  "unicef",
  "who",
  "wto",
  "imf",
  "ioc",
  "fifa",
  "uefa",
  "opec",
  "asean",
  "brics",
  "oecd",
  "apec",
  "nafta",
  "mercosur",
  // Standards Organizations
  "iso",
  "ietf",
  "w3c",
  "ecma",
  "ansi",
  "nist",
  "itu",
  "icann",
  // Common Abbreviations (excluding very short)
  "etc",
  "asap",
  "fyi",
  "btw",
  "imo",
  "imho",
  "tbh",
  "tbd",
  "wip",
  "eta",
  "eod",
  "eow",
  "diy",
  "faq",
  "tldr",
  "afaik",
  "iirc",
  // Units (excluding short: kb, mb, gb, tb, pb, ms, ns, us, hz, px, em, vh, vw, pt, cm, mm)
  "kbps",
  "mbps",
  "gbps",
  "khz",
  "mhz",
  "ghz",
  "rem",
  // Time zones
  "utc",
  "gmt",
  "est",
  "pst",
  "cet",
  "ist",
  // Currencies (codes)
  "usd",
  "eur",
  "gbp",
  "jpy",
  "cny",
  "rub",
  "btc",
  "eth",
  "usdt",
  "usdc"
]

// src/constants/protected-words/javascript.ts
var JAVASCRIPT_KEYWORDS = [
  // Declarations
  "var",
  "let",
  "const",
  "function",
  "class",
  "async",
  "await",
  "yield",
  "generator",
  // Control flow (excluding: if, do)
  "else",
  "switch",
  "case",
  "default",
  "for",
  "while",
  "break",
  "continue",
  "return",
  "throw",
  "try",
  "catch",
  "finally",
  // Operators (excluding: in, of)
  "typeof",
  "instanceof",
  "new",
  "delete",
  "void",
  // OOP
  "this",
  "super",
  "extends",
  "implements",
  "static",
  "public",
  "private",
  "protected",
  "abstract",
  "readonly",
  "override",
  // Modules (excluding: as)
  "import",
  "export",
  "from",
  "default",
  "module",
  "require",
  "exports",
  // TypeScript
  "type",
  "interface",
  "enum",
  "namespace",
  "declare",
  "keyof",
  "infer",
  "never",
  "unknown",
  "any",
  "string",
  "number",
  "boolean",
  "symbol",
  "bigint",
  "object",
  "array",
  // Built-in objects
  "Object",
  "Array",
  "String",
  "Number",
  "Boolean",
  "Function",
  "Symbol",
  "BigInt",
  "Date",
  "RegExp",
  "Error",
  "Promise",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "JSON",
  "Math",
  "Intl",
  "Reflect",
  "Proxy",
  // Global
  "window",
  "document",
  "navigator",
  "location",
  "localStorage",
  "sessionStorage",
  "console",
  "setTimeout",
  "setInterval",
  "fetch",
  "NaN",
  "Infinity",
  "undefined",
  "null",
  // React hooks
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useId",
  "useTransition",
  "useDeferredValue",
  "useLayoutEffect",
  "useImperativeHandle",
  // React terms
  "props",
  "state",
  "context",
  "ref",
  "key",
  "children",
  "component",
  "render",
  "mount",
  "unmount",
  "hook",
  "hooks",
  "hoc",
  "provider",
  "consumer",
  // SEO/HTML meta
  "title",
  "description",
  "keywords",
  "viewport",
  "charset"
]

// src/constants/protected-words/medical.ts
var MEDICAL_SCIENTIFIC = [
  // Diseases/Conditions
  "covid",
  "covid-19",
  "sars",
  "mers",
  "hiv",
  "aids",
  "adhd",
  "ptsd",
  "ocd",
  "asd",
  // Genetics/Biology
  "dna",
  "rna",
  "mrna",
  "pcr",
  "crispr",
  "gene",
  "genome",
  "protein",
  "enzyme",
  "cell",
  "virus",
  "bacteria",
  "antibody",
  "antigen",
  "vaccine",
  // Medical Terms
  "mri",
  "xray",
  "ecg",
  "ekg",
  "eeg",
  "prn",
  "bpm",
  "spo2",
  "bmi",
  "icu",
  "nicu",
  "picu",
  // Pharmaceuticals
  "fda",
  "ema",
  "cdc",
  "nih",
  "otc",
  "nsaid",
  // Chemistry
  "h2o",
  "co2",
  "nacl",
  "mmol",
  "mcg",
  // Physics
  "kev",
  "mev",
  "gev",
  "kpa",
  "mpa",
  "bar",
  "atm",
  // Math/Stats (excluding short: pi, ln, avg, std, var, min, max, sum, pdf, cdf, roc, auc)
  "phi",
  "sigma",
  "delta",
  "theta",
  "sin",
  "cos",
  "tan",
  "log",
  "exp",
  // Academic
  "phd",
  "msc",
  "bsc",
  "mba",
  "gpa",
  "sat",
  "gre",
  "gmat",
  "toefl",
  "ielts",
  "ieee",
  "acm",
  "arxiv",
  "doi",
  "isbn",
  "issn"
]

// src/constants/protected-words/programming.ts
var PROGRAMMING_TERMS = [
  // Common identifiers
  "uid",
  "uuid",
  "guid",
  "api",
  "url",
  "uri",
  "href",
  "src",
  "auth",
  "token",
  "key",
  "secret",
  "data",
  "info",
  "meta",
  "config",
  // HTTP/Network
  "http",
  "https",
  "ftp",
  "ssh",
  "ssl",
  "tls",
  "dns",
  "cdn",
  "cors",
  "csrf",
  "xss",
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "rest",
  "soap",
  "rpc",
  "grpc",
  // Git
  "git",
  "commit",
  "push",
  "pull",
  "merge",
  "branch",
  "checkout",
  "reset",
  "rebase",
  "stash",
  "clone",
  "fetch",
  "diff",
  // CLI Commands
  "run",
  "dev",
  "build",
  "start",
  "test",
  "lint",
  "format",
  "install",
  "uninstall",
  "deploy",
  "preview",
  "serve",
  "init",
  "add",
  "remove",
  "update",
  "upgrade",
  // Development
  "debug",
  "debugger",
  "breakpoint",
  "error",
  "warning",
  "log",
  "console",
  "terminal",
  "shell",
  "cli",
  // Architecture
  "mvc",
  "mvvm",
  "spa",
  "ssr",
  "ssg",
  "isr",
  "crud",
  "websocket",
  // Design Patterns
  "singleton",
  "factory",
  "observer",
  "decorator",
  "adapter",
  "facade",
  "proxy",
  "middleware",
  // Data Structures
  "array",
  "object",
  "map",
  "set",
  "list",
  "stack",
  "queue",
  "tree",
  "graph",
  "hash",
  // File names
  "readme",
  "license",
  "changelog",
  "contributing",
  "index",
  "main",
  "app",
  "root",
  // Auth
  "login",
  "logout",
  "signin",
  "signup",
  "signout",
  "register",
  "password",
  "email",
  "username",
  "oauth",
  "jwt",
  "session",
  "cookie",
  // Roles
  "admin",
  "user",
  "guest",
  "moderator",
  "owner",
  // Status (excluding short: ok, no)
  "success",
  "error",
  "pending",
  "loading",
  "active",
  "inactive",
  "enabled",
  "disabled",
  "fail",
  "failed",
  "done",
  "todo",
  // Actions
  "create",
  "read",
  "update",
  "delete",
  "save",
  "load",
  "cancel",
  "submit",
  "open",
  "close",
  "show",
  "hide",
  // Misc
  "null",
  "undefined",
  "void",
  "nan",
  "true",
  "false",
  "variable"
]

// src/constants/protected-words/technology.ts
var TECHNOLOGY_TERMS = [
  // Programming Languages (excluding single-letter and short)
  "javascript",
  "typescript",
  "python",
  "java",
  "kotlin",
  "swift",
  "rust",
  "golang",
  "ruby",
  "php",
  "csharp",
  "cpp",
  "scala",
  "elixir",
  "clojure",
  "haskell",
  "lua",
  "perl",
  "matlab",
  "julia",
  "dart",
  "objective-c",
  "assembly",
  "cobol",
  "fortran",
  // Query Languages
  "sql",
  "nosql",
  "graphql",
  "sparql",
  "xpath",
  "regex",
  // Markup/Style
  "html",
  "css",
  "xml",
  "json",
  "yaml",
  "markdown",
  "latex",
  "svg",
  "wasm",
  "webassembly",
  // Protocols
  "tcp",
  "udp",
  "ipv4",
  "ipv6",
  "smtp",
  "imap",
  "pop3",
  "mqtt",
  "amqp",
  "websocket",
  "webrtc",
  "http2",
  "http3",
  "quic",
  // Wireless
  "wifi",
  "wi-fi",
  "bluetooth",
  "nfc",
  "rfid",
  "lte",
  "3g",
  "4g",
  "5g",
  "6g",
  // Hardware
  "cpu",
  "gpu",
  "ram",
  "rom",
  "ssd",
  "hdd",
  "nvme",
  "usb",
  "hdmi",
  "displayport",
  "thunderbolt",
  "ethernet",
  "pcie",
  "sata",
  // Display
  "lcd",
  "led",
  "oled",
  "amoled",
  "ips",
  "fhd",
  "qhd",
  "uhd",
  "fps",
  "hdr",
  "dolby",
  // OS
  "windows",
  "macos",
  "linux",
  "unix",
  "ubuntu",
  "debian",
  "fedora",
  "centos",
  "alpine",
  "arch",
  "ios",
  "android",
  "chromeos",
  "freebsd",
  // Virtualization
  "container",
  "docker",
  "kubernetes",
  "vagrant",
  "virtualbox",
  "vmware",
  "hyperv",
  // Tech Acronyms (excluding very short)
  "seo",
  "nlp",
  "llm",
  "api",
  "sdk",
  "cli",
  "gui",
  "ide",
  "vcs",
  "devops",
  "mlops",
  "orm",
  "cms",
  "crm",
  "erp",
  "saas",
  "paas",
  "iaas",
  "b2b",
  "b2c",
  "p2p",
  "iot",
  // Security
  "ssl",
  "tls",
  "https",
  "ssh",
  "vpn",
  "pgp",
  "aes",
  "rsa",
  "sha",
  "md5",
  "bcrypt",
  "jwt",
  "oauth",
  "saml",
  "sso",
  "mfa",
  "otp",
  // Data
  "etl",
  "olap",
  "oltp",
  "dwh",
  "datalake",
  "hadoop",
  "spark",
  "kafka",
  "airflow",
  // Formats
  "utf8",
  "ascii",
  "unicode",
  "base64",
  "hex",
  "gzip",
  "brotli",
  "zstd",
  "qr"
]

// src/constants/protected-words/index.ts
var NON_TRANSLITERATABLE_WORDS = [
  ...FRAMEWORKS_AND_TOOLS,
  ...PROGRAMMING_TERMS,
  ...JAVASCRIPT_KEYWORDS,
  ...BRANDS_AND_PLATFORMS,
  ...TECHNOLOGY_TERMS,
  ...INTERNATIONAL_ACRONYMS,
  ...MEDICAL_SCIENTIFIC
]
var APOSTROPHE_VARIANTS = [
  "`",
  // ` Grave accent
  "\xB4",
  // ´ Acute accent
  "\u2019",
  // ' Right single quotation mark
  "\u2018",
  // ' Left single quotation mark
  "\u02BB",
  // ʻ Modifier letter turned comma
  "\u02BC",
  // ʼ Modifier letter apostrophe
  "\u02BF",
  // ʿ Modifier letter left half ring
  "\u02C8",
  // ˈ Modifier letter vertical line
  "\u2032",
  // ′ Prime
  "\u02B9",
  // ʹ Modifier letter prime
  "'"
  // ' Standard apostrophe (target)
]

// src/constants/uzbek-suffixes.ts
var UZBEK_SUFFIXES = [
  // Case suffixes (kelishik qo'shimchalari)
  "da",
  "dan",
  "ga",
  "ni",
  "ning",
  "ka",
  // Plural (ko'plik)
  "lar",
  "larni",
  "larda",
  "lardan",
  "larga",
  "larning",
  // Possessive (egalik)
  "i",
  "si",
  "im",
  "ing",
  "imiz",
  "ingiz",
  // Other common suffixes
  "dagi",
  "chi",
  "chilar",
  "siz",
  "li",
  "lik",
  "mi",
  "dir",
  "emas",
  // Combined
  "lari",
  "larini",
  "lariga"
]

// src/helpers.ts
function normalizeApostrophes(text) {
  let result = text
  for (const variant of APOSTROPHE_VARIANTS) {
    if (variant !== "'") {
      result = result.split(variant).join("'")
    }
  }
  return result
}
function isUpperCase(char) {
  return char === char.toUpperCase() && char !== char.toLowerCase()
}
function isLowerCase(char) {
  return char === char.toLowerCase() && char !== char.toUpperCase()
}
function preserveCase(source, target) {
  if (target.length === 0) return target
  if (source.length === 0) return target
  if (target.length === 1) {
    return isUpperCase(source[0]) ? target.toUpperCase() : target.toLowerCase()
  }
  const firstUpper = isUpperCase(source[0])
  const allUpper =
    source.length > 1 &&
    [...source].every((c) => isUpperCase(c) || !isLowerCase(c))
  if (allUpper) {
    return target.toUpperCase()
  }
  if (firstUpper) {
    return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase()
  }
  return target.toLowerCase()
}
function isLatinVowel(char) {
  return "aeiouAEIOU".includes(char)
}
function isCyrillicVowel(char) {
  return "\u0430\u0435\u0451\u0438\u043E\u0443\u045E\u044D\u044E\u044F\u044B\u0410\u0415\u0401\u0418\u041E\u0423\u040E\u042D\u042E\u042F\u042B".includes(
    char
  )
}
function isWordBoundary(text, index) {
  if (index === 0) return true
  if (index >= text.length) return true
  const prevChar = text[index - 1]
  return /[\s(\-"'«»„"".,!?;:[\]{}]/.test(prevChar)
}

// src/mappings/month-names.ts
var RUSSIAN_MONTHS_TO_UZBEK = {
  // Full month names (Russian → Uzbek Latin)
  \u044F\u043D\u0432\u0430\u0440\u044C: "yanvar",
  \u0444\u0435\u0432\u0440\u0430\u043B\u044C: "fevral",
  \u043C\u0430\u0440\u0442: "mart",
  \u0430\u043F\u0440\u0435\u043B\u044C: "aprel",
  \u043C\u0430\u0439: "may",
  \u0438\u044E\u043D\u044C: "iyun",
  \u0438\u044E\u043B\u044C: "iyul",
  \u0430\u0432\u0433\u0443\u0441\u0442: "avgust",
  \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C: "sentabr",
  \u043E\u043A\u0442\u044F\u0431\u0440\u044C: "oktabr",
  \u043D\u043E\u044F\u0431\u0440\u044C: "noyabr",
  \u0434\u0435\u043A\u0430\u0431\u0440\u044C: "dekabr",
  // Days of week
  \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A:
    "dushanba",
  \u0432\u0442\u043E\u0440\u043D\u0438\u043A: "seshanba",
  \u0441\u0440\u0435\u0434\u0430: "chorshanba",
  \u0447\u0435\u0442\u0432\u0435\u0440\u0433: "payshanba",
  \u043F\u044F\u0442\u043D\u0438\u0446\u0430: "juma",
  \u0441\u0443\u0431\u0431\u043E\u0442\u0430: "shanba",
  \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435:
    "yakshanba"
}
function getRussianTimeNameInUzbek(word) {
  return RUSSIAN_MONTHS_TO_UZBEK[word.toLowerCase()] || null
}

// src/mappings/russian-cyrillic-to-latin.ts
var RUSSIAN_CYRILLIC_TO_LATIN = {
  // Russian-specific vowels
  \u044B: "y",
  // Russian-specific consonants
  \u0449: "shch",
  // Signs (modify pronunciation)
  // ъ and ь are handled specially in transliterate.ts
  \u044A: "'",
  // Hard sign - apostrophe before е, ё, ю, я
  \u044C: "",
  // Soft sign - usually silent, apostrophe before vowels
  // These exist in both but may have different transliteration in Russian context
  \u0436: "zh",
  // Russian: zh (Uzbek: j)
  \u0445: "kh",
  // Russian: kh (Uzbek: x)
  \u0446: "ts",
  \u0447: "ch",
  \u0448: "sh",
  // Compound vowels
  \u0451: "yo",
  \u044E: "yu",
  \u044F: "ya"
  // Note: "е" is handled specially - "ye" at start/after vowel, "e" after consonant
}
var RUSSIAN_ONLY_CHARS = [
  "\u044B",
  "\u0449",
  "\u044C",
  "\u042B",
  "\u0429",
  "\u042C"
]
function isRussianOnlyChar(char) {
  return RUSSIAN_ONLY_CHARS.includes(char)
}

// src/mappings/uzbek-cyrillic-to-latin.ts
var UZBEK_CYRILLIC_TO_LATIN_SINGLE = {
  \u0430: "a",
  \u0431: "b",
  \u0432: "v",
  \u0433: "g",
  \u0434: "d",
  \u0435: "e",
  // Context-dependent: 'ye' at word start
  \u0436: "j",
  \u0437: "z",
  \u0438: "i",
  \u0439: "y",
  \u043A: "k",
  \u043B: "l",
  \u043C: "m",
  \u043D: "n",
  \u043E: "o",
  \u043F: "p",
  \u0440: "r",
  \u0441: "s",
  \u0442: "t",
  \u0443: "u",
  \u0444: "f",
  \u0445: "x",
  // Uzbek-specific characters
  \u049B: "q",
  \u0493: "g'",
  \u04B3: "h",
  \u045E: "o'"
}
var UZBEK_CYRILLIC_TO_LATIN_SPECIAL = {
  // Compound vowels
  \u0451: "yo",
  \u044E: "yu",
  \u044F: "ya",
  // Consonant clusters
  \u0448: "sh",
  \u0447: "ch",
  \u0446: "ts",
  // Hard/soft signs
  \u044A: "'",
  \u044D: "e"
  // Always 'e', context handled separately
}

// src/mappings/uzbek-latin-to-cyrillic.ts
var UZBEK_LATIN_TO_CYRILLIC_SINGLE = {
  a: "\u0430",
  b: "\u0431",
  c: "\u0441",
  // 'c' → 'с' (for foreign words like "practice")
  d: "\u0434",
  e: "\u0435",
  f: "\u0444",
  g: "\u0433",
  h: "\u04B3",
  i: "\u0438",
  j: "\u0436",
  k: "\u043A",
  l: "\u043B",
  m: "\u043C",
  n: "\u043D",
  o: "\u043E",
  p: "\u043F",
  q: "\u049B",
  r: "\u0440",
  s: "\u0441",
  t: "\u0442",
  u: "\u0443",
  v: "\u0432",
  w: "\u0432",
  // 'w' → 'в' (for foreign words)
  x: "\u0445",
  y: "\u0439",
  z: "\u0437"
}
var UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS = {
  // Special Uzbek digraphs with apostrophe
  "g'": "\u0493",
  "o'": "\u045E",
  // Standard digraphs
  sh: "\u0448",
  ch: "\u0447",
  ng: "\u043D\u0433",
  // Compound vowels (ya, yo, yu, ye)
  yo: "\u0451",
  yu: "\u044E",
  ya: "\u044F",
  ye: "\u0435"
  // Only at word beginning
}

// src/cyrillic-to-latin.ts
function extractCyrillicWord(text, startIndex) {
  let word = ""
  let i = startIndex
  while (i < text.length && /[\u0400-\u04FF]/.test(text[i])) {
    word += text[i]
    i++
  }
  return word
}
function shouldEBeYe(text, index) {
  if (isWordBoundary(text, index)) {
    return true
  }
  const prevChar = text[index - 1]
  if (isCyrillicVowel(prevChar)) {
    return true
  }
  if ("\u044A\u044C\u042A\u042C".includes(prevChar)) {
    return true
  }
  return false
}
function applyCaseAware(char, target, text, index) {
  if (!isUpperCase(char)) {
    return target.toLowerCase()
  }
  const nextChar = text[index + 1]
  if (nextChar && isUpperCase(nextChar)) {
    return target.toUpperCase()
  }
  const prevChar = text[index - 1]
  if (prevChar && isUpperCase(prevChar) && !/[\s-]/.test(prevChar)) {
    return target.toUpperCase()
  }
  return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase()
}
function transliterateCyrillicToLatin(text) {
  let result = ""
  let i = 0
  while (i < text.length) {
    const char = text[i]
    const nextChar = text[i + 1] || ""
    const lowerChar = char.toLowerCase()
    const lowerNext = nextChar.toLowerCase()
    if (/[\u0400-\u04FF]/.test(char) && isWordBoundary(text, i)) {
      const word = extractCyrillicWord(text, i)
      const uzbekEquivalent = getRussianTimeNameInUzbek(word)
      if (uzbekEquivalent) {
        if (word === word.toUpperCase()) {
          result += uzbekEquivalent.toUpperCase()
        } else if (isUpperCase(word[0])) {
          result +=
            uzbekEquivalent.charAt(0).toUpperCase() + uzbekEquivalent.slice(1)
        } else {
          result += uzbekEquivalent
        }
        i += word.length
        continue
      }
    }
    if (lowerChar === "\u043D" && lowerNext === "\u0433") {
      if (isUpperCase(char) && isUpperCase(nextChar)) {
        result += "NG"
      } else if (isUpperCase(char)) {
        result += "Ng"
      } else {
        result += "ng"
      }
      i += 2
      continue
    }
    if (lowerChar === "\u044A") {
      result += "'"
      i++
      continue
    }
    if (lowerChar === "\u0435") {
      if (shouldEBeYe(text, i)) {
        result += applyCaseAware(char, "ye", text, i)
      } else {
        result += preserveCase(char, "e")
      }
      i++
      continue
    }
    if (isRussianOnlyChar(char)) {
      if (lowerChar === "\u044C") {
        const nextLower = nextChar.toLowerCase()
        if ("\u0435\u0451\u044E\u044F".includes(nextLower)) {
          result += "'"
          i++
          continue
        }
        result += "'"
        i++
        continue
      }
      const latinChar2 = RUSSIAN_CYRILLIC_TO_LATIN[lowerChar]
      if (latinChar2) {
        result += applyCaseAware(char, latinChar2, text, i)
      } else {
        result += char
      }
      i++
      continue
    }
    const specialChar = UZBEK_CYRILLIC_TO_LATIN_SPECIAL[lowerChar]
    if (specialChar) {
      result += applyCaseAware(char, specialChar, text, i)
      i++
      continue
    }
    const latinChar = UZBEK_CYRILLIC_TO_LATIN_SINGLE[lowerChar]
    if (latinChar) {
      result += preserveCase(char, latinChar)
    } else {
      result += char
    }
    i++
  }
  return normalizeApostrophes(result)
}

// src/latin-to-cyrillic.ts
function transliterateLatinToCyrillic(text) {
  const normalized = normalizeApostrophes(text)
  let result = ""
  let i = 0
  while (i < normalized.length) {
    const char = normalized[i]
    const nextChar = normalized[i + 1] || ""
    const twoChars = char + nextChar
    const lowerChar = char.toLowerCase()
    const lowerTwo = twoChars.toLowerCase()
    const fourChars = normalized.substring(i, i + 4).toLowerCase()
    if (fourChars === "shch") {
      const original = normalized.substring(i, i + 4)
      if (original === original.toUpperCase()) {
        result += "\u0429"
      } else {
        result += preserveCase(char, "\u0449")
      }
      i += 4
      continue
    }
    if (lowerChar === "y") {
      const nextTwo = normalized.substring(i + 1, i + 3).toLowerCase()
      if (nextTwo === "o'") {
        result += preserveCase(char, "\u0439")
        i++
        continue
      }
      if (nextChar.toLowerCase() === "o") {
        result += preserveCase(char, "\u0451")
        i += 2
        continue
      }
      if (nextChar.toLowerCase() === "a") {
        result += preserveCase(char, "\u044F")
        i += 2
        continue
      }
      if (nextChar.toLowerCase() === "u") {
        result += preserveCase(char, "\u044E")
        i += 2
        continue
      }
      if (nextChar.toLowerCase() === "e") {
        result += preserveCase(char, "\u0435")
        i += 2
        continue
      }
      result += preserveCase(char, "\u0439")
      i++
      continue
    }
    if (lowerChar === "e" && isWordBoundary(normalized, i)) {
      result += preserveCase(char, "\u044D")
      i++
      continue
    }
    if (lowerTwo === "g'" || lowerTwo === "o'") {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
      result += preserveCase(char, cyrillic)
      i += 2
      continue
    }
    if (lowerTwo === "ng" && normalized[i + 2] === "'") {
      result += preserveCase(char, "\u043D")
      i++
      continue
    }
    if (["sh", "ch", "ng"].includes(lowerTwo)) {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
      if (isUpperCase(char) && isUpperCase(nextChar)) {
        result += cyrillic.toUpperCase()
      } else {
        result += preserveCase(char, cyrillic)
      }
      i += 2
      continue
    }
    if (char === "'") {
      const prevChar = i > 0 ? normalized[i - 1].toLowerCase() : ""
      const nextCharLower = nextChar.toLowerCase()
      if (nextCharLower === "h" && !isLatinVowel(prevChar)) {
        i++
        continue
      }
      const afterNext = normalized[i + 2]?.toLowerCase() || ""
      if (nextCharLower === "y" && "aeou".includes(afterNext)) {
        result += "\u044C"
        i++
        continue
      }
      if (isLatinVowel(prevChar)) {
        result += "\u044A"
        i++
        continue
      }
      const isEndOfWord = !nextChar || /[\s.,!?;:-]/.test(nextChar)
      if (isEndOfWord) {
        result += "\u044C"
        i++
        continue
      }
      if (!isLatinVowel(prevChar) && isLatinVowel(nextCharLower)) {
        result += "\u044C"
        i++
        continue
      }
      result += "'"
      i++
      continue
    }
    const cyrillicChar = UZBEK_LATIN_TO_CYRILLIC_SINGLE[lowerChar]
    if (cyrillicChar) {
      result += preserveCase(char, cyrillicChar)
    } else {
      result += char
    }
    i++
  }
  return result
}

// src/protection.ts
var PLACEHOLDER_PREFIX = "\0"
var PLACEHOLDER_SUFFIX = "\0"
function createPlaceholder(index) {
  return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`
}
function buildProtectedWordsPattern() {
  const sortedWords = [...NON_TRANSLITERATABLE_WORDS].sort(
    (a, b) => b.length - a.length
  )
  const suffixPattern = `(?:${UZBEK_SUFFIXES.join("|")})?`
  return `\\b(${sortedWords.join("|")})${suffixPattern}\\b`
}
function buildProtectionRegex() {
  const patterns = [
    // Code blocks (triple backticks)
    "```[\\s\\S]*?```",
    // Inline code (single backticks)
    "`[^`]+?`",
    // HTML tags: <tag>, </tag>, <tag attr="value">
    "<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*)?\\/?>",
    // Email addresses
    "\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b",
    // Social media handles (@username, @user_name, @user123)
    "@[a-zA-Z_][a-zA-Z0-9_]*",
    // URLs
    "\\b(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*",
    // File names with extensions (config.json, backup_v2.tar.gz)
    "\\b[a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9]+)+\\b",
    // Technical terms with hyphen+number at END (COVID-19, v2.3, NOT Tez-tibbiy)
    "\\b[A-Za-z]+-\\d+(?:\\.\\d+)*\\b",
    // HTML heading tags (h1-h6)
    "\\bh[1-6]\\b",
    // Protected words with optional Uzbek suffixes
    buildProtectedWordsPattern()
  ]
  return new RegExp(patterns.join("|"), "gi")
}
var protectionRegex = buildProtectionRegex()
function protectContent(text) {
  const protectedParts = []
  const maskedText = text.replace(protectionRegex, (match) => {
    const index = protectedParts.length
    protectedParts.push(match)
    return createPlaceholder(index)
  })
  return { maskedText, protectedParts }
}
function restoreContent(text, protectedParts) {
  const placeholderRegex = new RegExp(
    `${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}`,
    "g"
  )
  return text.replace(placeholderRegex, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)] || ""
  })
}

// src/transliterate.ts
function isCyrillicText(text) {
  if (!text || text.length < 2) return false
  const cyrillicRegex = /[\u0400-\u04FF]/g
  const latinRegex = /[a-zA-Z]/g
  const cyrillicMatches = text.match(cyrillicRegex) || []
  const latinMatches = text.match(latinRegex) || []
  return (
    cyrillicMatches.length > 0 && cyrillicMatches.length >= latinMatches.length
  )
}
function toCyrillic(text) {
  if (!text) return ""
  const { maskedText, protectedParts } = protectContent(text)
  const transliterated = transliterateLatinToCyrillic(maskedText)
  return restoreContent(transliterated, protectedParts)
}
function toLatin(text) {
  if (!text) return ""
  const { maskedText, protectedParts } = protectContent(text)
  const transliterated = transliterateCyrillicToLatin(maskedText)
  return restoreContent(transliterated, protectedParts)
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    APOSTROPHE_VARIANTS,
    NON_TRANSLITERATABLE_WORDS,
    UZBEK_SUFFIXES,
    isCyrillicText,
    toCyrillic,
    toLatin
  })
