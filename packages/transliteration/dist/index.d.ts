/**
 * Protected words - barrel export
 * Words that should NOT be transliterated
 */

declare const NON_TRANSLITERATABLE_WORDS: readonly ["react", "vue", "angular", "svelte", "solid", "next", "nextjs", "nuxt", "nuxtjs", "gatsby", "remix", "astro", "qwik", "preact", "tailwind", "tailwindcss", "bootstrap", "bulma", "chakra", "mui", "antd", "styled", "express", "fastify", "nestjs", "koa", "hapi", "django", "flask", "fastapi", "rails", "laravel", "spring", "dotnet", "gin", "echo", "fiber", "webpack", "vite", "rollup", "esbuild", "parcel", "turbopack", "swc", "babel", "tsc", "npm", "pnpm", "yarn", "bun", "deno", "pip", "cargo", "gem", "composer", "maven", "gradle", "node", "nodejs", "jest", "vitest", "mocha", "chai", "cypress", "playwright", "puppeteer", "selenium", "eslint", "prettier", "biome", "oxlint", "stylelint", "redux", "zustand", "mobx", "recoil", "jotai", "valtio", "axios", "fetch", "swr", "tanstack", "trpc", "graphql", "apollo", "urql", "relay", "prisma", "drizzle", "typeorm", "sequelize", "mongoose", "knex", "objection", "nextauth", "auth0", "clerk", "supabase", "firebase", "strapi", "sanity", "contentful", "ghost", "wordpress", "docker", "kubernetes", "terraform", "ansible", "nginx", "apache", "caddy", "uid", "uuid", "guid", "api", "url", "uri", "href", "src", "auth", "token", "key", "secret", "data", "info", "meta", "config", "http", "https", "ftp", "ssh", "ssl", "tls", "dns", "cdn", "cors", "csrf", "xss", "get", "post", "put", "patch", "delete", "rest", "soap", "rpc", "grpc", "git", "commit", "push", "pull", "merge", "branch", "checkout", "reset", "rebase", "stash", "clone", "fetch", "diff", "run", "dev", "build", "start", "test", "lint", "format", "install", "uninstall", "deploy", "preview", "serve", "init", "add", "remove", "update", "upgrade", "debug", "debugger", "breakpoint", "error", "warning", "log", "console", "terminal", "shell", "cli", "mvc", "mvvm", "spa", "ssr", "ssg", "isr", "crud", "websocket", "singleton", "factory", "observer", "decorator", "adapter", "facade", "proxy", "middleware", "array", "object", "map", "set", "list", "stack", "queue", "tree", "graph", "hash", "readme", "license", "changelog", "contributing", "index", "main", "app", "root", "login", "logout", "signin", "signup", "signout", "register", "password", "email", "username", "oauth", "jwt", "session", "cookie", "admin", "user", "guest", "moderator", "owner", "success", "error", "pending", "loading", "active", "inactive", "enabled", "disabled", "fail", "failed", "done", "todo", "create", "read", "update", "delete", "save", "load", "cancel", "submit", "open", "close", "show", "hide", "null", "undefined", "void", "nan", "true", "false", "variable", "var", "let", "const", "function", "class", "async", "await", "yield", "generator", "else", "switch", "case", "default", "for", "while", "break", "continue", "return", "throw", "try", "catch", "finally", "typeof", "instanceof", "new", "delete", "void", "this", "super", "extends", "implements", "static", "public", "private", "protected", "abstract", "readonly", "override", "import", "export", "from", "default", "module", "require", "exports", "type", "interface", "enum", "namespace", "declare", "keyof", "infer", "never", "unknown", "any", "string", "number", "boolean", "symbol", "bigint", "object", "array", "Object", "Array", "String", "Number", "Boolean", "Function", "Symbol", "BigInt", "Date", "RegExp", "Error", "Promise", "Map", "Set", "WeakMap", "WeakSet", "JSON", "Math", "Intl", "Reflect", "Proxy", "window", "document", "navigator", "location", "localStorage", "sessionStorage", "console", "setTimeout", "setInterval", "fetch", "NaN", "Infinity", "undefined", "null", "useState", "useEffect", "useContext", "useReducer", "useCallback", "useMemo", "useRef", "useId", "useTransition", "useDeferredValue", "useLayoutEffect", "useImperativeHandle", "props", "state", "context", "ref", "key", "children", "component", "render", "mount", "unmount", "hook", "hooks", "hoc", "provider", "consumer", "title", "description", "keywords", "viewport", "charset", "google", "microsoft", "apple", "amazon", "meta", "facebook", "instagram", "whatsapp", "twitter", "linkedin", "tiktok", "snapchat", "pinterest", "github", "gitlab", "bitbucket", "codeberg", "stackoverflow", "reddit", "hackernews", "devto", "medium", "hashnode", "aws", "azure", "gcp", "digitalocean", "linode", "vultr", "hetzner", "cloudflare", "akamai", "vercel", "netlify", "heroku", "railway", "render", "fly", "mongodb", "postgres", "postgresql", "mysql", "sqlite", "redis", "elasticsearch", "cassandra", "dynamodb", "firestore", "planetscale", "neon", "turso", "cockroachdb", "stripe", "paypal", "twilio", "sendgrid", "mailchimp", "algolia", "meilisearch", "typesense", "sentry", "datadog", "newrelic", "grafana", "slack", "discord", "telegram", "zoom", "teams", "figma", "sketch", "adobe", "canva", "framer", "openai", "chatgpt", "gpt", "claude", "anthropic", "gemini", "bard", "copilot", "midjourney", "dalle", "huggingface", "tensorflow", "pytorch", "keras", "youtube", "vimeo", "twitch", "netflix", "spotify", "javascript", "typescript", "python", "java", "kotlin", "swift", "rust", "golang", "ruby", "php", "csharp", "cpp", "scala", "elixir", "clojure", "haskell", "lua", "perl", "matlab", "julia", "dart", "objective-c", "assembly", "cobol", "fortran", "sql", "nosql", "graphql", "sparql", "xpath", "regex", "html", "css", "xml", "json", "yaml", "markdown", "latex", "svg", "wasm", "webassembly", "tcp", "udp", "ipv4", "ipv6", "smtp", "imap", "pop3", "mqtt", "amqp", "websocket", "webrtc", "http2", "http3", "quic", "wifi", "wi-fi", "bluetooth", "nfc", "rfid", "lte", "3g", "4g", "5g", "6g", "cpu", "gpu", "ram", "rom", "ssd", "hdd", "nvme", "usb", "hdmi", "displayport", "thunderbolt", "ethernet", "pcie", "sata", "lcd", "led", "oled", "amoled", "ips", "fhd", "qhd", "uhd", "fps", "hdr", "dolby", "windows", "macos", "linux", "unix", "ubuntu", "debian", "fedora", "centos", "alpine", "arch", "ios", "android", "chromeos", "freebsd", "container", "docker", "kubernetes", "vagrant", "virtualbox", "vmware", "hyperv", "seo", "nlp", "llm", "api", "sdk", "cli", "gui", "ide", "vcs", "devops", "mlops", "orm", "cms", "crm", "erp", "saas", "paas", "iaas", "b2b", "b2c", "p2p", "iot", "ssl", "tls", "https", "ssh", "vpn", "pgp", "aes", "rsa", "sha", "md5", "bcrypt", "jwt", "oauth", "saml", "sso", "mfa", "otp", "etl", "olap", "oltp", "dwh", "datalake", "hadoop", "spark", "kafka", "airflow", "utf8", "ascii", "unicode", "base64", "hex", "gzip", "brotli", "zstd", "qr", "usa", "uae", "cis", "nato", "unesco", "unicef", "who", "wto", "imf", "ioc", "fifa", "uefa", "opec", "asean", "brics", "oecd", "apec", "nafta", "mercosur", "iso", "ietf", "w3c", "ecma", "ansi", "nist", "itu", "icann", "etc", "asap", "fyi", "btw", "imo", "imho", "tbh", "tbd", "wip", "eta", "eod", "eow", "diy", "faq", "tldr", "afaik", "iirc", "kbps", "mbps", "gbps", "khz", "mhz", "ghz", "rem", "utc", "gmt", "est", "pst", "cet", "ist", "usd", "eur", "gbp", "jpy", "cny", "rub", "btc", "eth", "usdt", "usdc", "covid", "covid-19", "sars", "mers", "hiv", "aids", "adhd", "ptsd", "ocd", "asd", "dna", "rna", "mrna", "pcr", "crispr", "gene", "genome", "protein", "enzyme", "cell", "virus", "bacteria", "antibody", "antigen", "vaccine", "mri", "xray", "ecg", "ekg", "eeg", "prn", "bpm", "spo2", "bmi", "icu", "nicu", "picu", "fda", "ema", "cdc", "nih", "otc", "nsaid", "h2o", "co2", "nacl", "mmol", "mcg", "kev", "mev", "gev", "kpa", "mpa", "bar", "atm", "phi", "sigma", "delta", "theta", "sin", "cos", "tan", "log", "exp", "phd", "msc", "bsc", "mba", "gpa", "sat", "gre", "gmat", "toefl", "ielts", "ieee", "acm", "arxiv", "doi", "isbn", "issn"];
/**
 * All apostrophe/quote variants that should be normalized to standard apostrophe (')
 * Using Unicode escape sequences for reliability
 */
declare const APOSTROPHE_VARIANTS: readonly ["`", "´", "’", "‘", "ʻ", "ʼ", "ʿ", "ˈ", "′", "ʹ", "'"];

/**
 * Uzbek grammatical suffixes
 * Used to protect technical terms with Uzbek endings
 * Example: "reactda" → "reactda" (not "реастда")
 */
declare const UZBEK_SUFFIXES: readonly ["da", "dan", "ga", "ni", "ning", "ka", "lar", "larni", "larda", "lardan", "larga", "larning", "i", "si", "im", "ing", "imiz", "ingiz", "dagi", "chi", "chilar", "siz", "li", "lik", "mi", "dir", "emas", "lari", "larini", "lariga"];

/**
 * Main transliteration module - Public API
 * Handles Latin ↔ Cyrillic conversion for Uzbek and Russian
 *
 * Architecture:
 * 1. Protect special content (URLs, emails, code blocks, technical terms)
 * 2. Detect script and language
 * 3. Apply appropriate transliteration algorithm
 * 4. Restore protected content
 */
/**
 * Detect if text contains predominantly Cyrillic characters
 * Returns true if Cyrillic characters are more than Latin
 */
declare function isCyrillicText(text: string): boolean;
/**
 * Convert Latin text to Cyrillic (Uzbek)
 * Handles: URLs, emails, code blocks, technical terms protection
 */
declare function toCyrillic(text: string): string;
/**
 * Convert Cyrillic text to Latin (Uzbek + Russian support)
 * Handles: URLs, emails, code blocks, technical terms protection
 */
declare function toLatin(text: string): string;

/**
 * Core transliteration types
 */
type TransliterationDirection = "latin-to-cyrillic" | "cyrillic-to-latin";
type ScriptType = "latin" | "cyrillic" | "mixed" | "unknown";
type TransliterationMode = "uzbek" | "russian" | "auto";
interface CharacterMapping {
    [key: string]: string;
}
interface DigraphMapping {
    [key: string]: string;
}
interface TransliterationOptions {
    mode?: TransliterationMode;
    preserveCase?: boolean;
    normalizeApostrophes?: boolean;
}

export { APOSTROPHE_VARIANTS, type CharacterMapping, type DigraphMapping, NON_TRANSLITERATABLE_WORDS, type ScriptType, type TransliterationDirection, type TransliterationMode, type TransliterationOptions, UZBEK_SUFFIXES, isCyrillicText, toCyrillic, toLatin };
