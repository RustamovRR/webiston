import { isCyrillicText, toCyrillic, toLatin } from "@webiston/transliteration"
import { useCallback, useEffect, useState } from "react"

type Direction = "auto" | "to-cyrillic" | "to-latin"
type Theme = "light" | "dark" | "system"

// Icons
function SunIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" strokeWidth={2} />
      <path
        strokeWidth={2}
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function CursorIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  )
}

export default function App() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [direction, setDirection] = useState<Direction>("auto")
  const [copied, setCopied] = useState(false)
  const [floatingEnabled, setFloatingEnabled] = useState(true)
  const [theme, setTheme] = useState<Theme>("system")

  // Load settings
  useEffect(() => {
    chrome.storage.local
      .get(["quickConvertEnabled", "theme"])
      .then((result) => {
        setFloatingEnabled(result.quickConvertEnabled !== false)
        if (result.theme) setTheme(result.theme)
      })
  }, [])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    root.classList.toggle("dark", isDark)
    chrome.storage.local.set({ theme })
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const toggleFloating = async () => {
    const newValue = !floatingEnabled
    setFloatingEnabled(newValue)
    await chrome.storage.local.set({ quickConvertEnabled: newValue })
  }

  const convert = useCallback((text: string, dir: Direction) => {
    if (!text.trim()) {
      setOutput("")
      return
    }
    let result: string
    if (dir === "auto") {
      result = isCyrillicText(text) ? toLatin(text) : toCyrillic(text)
    } else if (dir === "to-cyrillic") {
      result = toCyrillic(text)
    } else {
      result = toLatin(text)
    }
    setOutput(result)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setInput(text)
    convert(text, direction)
  }

  const handleDirectionChange = (dir: Direction) => {
    setDirection(dir)
    convert(input, dir)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSwap = () => {
    setInput(output)
    setOutput(input)
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div
      className="w-[380px] p-5"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 7l6 10 6-10M15 7l3 5 3-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight">
              Latin Converter
            </h1>
            <a
              href="https://webiston.uz/tools/latin-cyrillic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] hover:text-sky-500 transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              webiston.uz
            </a>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: "var(--muted-foreground)" }}
          title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Quick Convert Toggle */}
      <div
        className="flex items-center justify-between mb-4 p-3 rounded-xl"
        style={{ background: "var(--muted)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            style={{
              color: floatingEnabled
                ? "var(--primary)"
                : "var(--muted-foreground)"
            }}
          >
            <CursorIcon />
          </div>
          <div>
            <span className="text-sm font-medium block leading-tight">
              Tezkor konvertatsiya
            </span>
            <span
              className="text-[11px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Matn tanlanganda avtomatik
            </span>
          </div>
        </div>
        <button
          onClick={toggleFloating}
          className="relative w-11 h-6 rounded-full transition-all duration-200"
          style={{
            background: floatingEnabled ? "var(--primary)" : "var(--border)"
          }}
        >
          <span
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
            style={{ left: floatingEnabled ? "calc(100% - 20px)" : "4px" }}
          />
        </button>
      </div>

      {/* Direction Selector */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-xl"
        style={{ background: "var(--muted)" }}
      >
        {[
          { value: "auto", label: "Avto" },
          { value: "to-cyrillic", label: "→ Кирилл" },
          { value: "to-latin", label: "→ Lotin" }
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleDirectionChange(opt.value as Direction)}
            className="flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all duration-200"
            style={{
              background:
                direction === opt.value ? "var(--background)" : "transparent",
              color:
                direction === opt.value
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
              boxShadow:
                direction === opt.value ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Input Panel */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Kirish
          </span>
          {input && (
            <button
              onClick={handleClear}
              className="p-1 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: "var(--muted-foreground)" }}
              title="Tozalash"
            >
              <CloseIcon />
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Matn kiriting..."
          className="w-full h-28 p-3.5 text-sm rounded-xl resize-none transition-all duration-200"
          style={{
            background: "var(--input)",
            border: "1px solid var(--border)",
            color: "var(--foreground)"
          }}
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-3">
        <button
          onClick={handleSwap}
          disabled={!output}
          className="p-2.5 rounded-full border transition-all duration-200 hover:border-sky-500 hover:text-sky-500 disabled:opacity-30 disabled:hover:border-current disabled:hover:text-current"
          style={{
            color: "var(--muted-foreground)",
            borderColor: "var(--border)",
            background: "var(--background)"
          }}
          title="Almashtirish"
        >
          <SwapIcon />
        </button>
      </div>

      {/* Output Panel */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Natija
          </span>
          {output && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: copied ? "rgba(16, 185, 129, 0.1)" : "transparent",
                color: copied ? "#10b981" : "var(--muted-foreground)"
              }}
              title="Nusxalash"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Nusxalandi" : "Nusxalash"}
            </button>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="Natija shu yerda ko'rinadi..."
          className="w-full h-28 p-3.5 text-sm rounded-xl resize-none"
          style={{
            background: output ? "rgba(14, 165, 233, 0.05)" : "var(--muted)",
            border: output
              ? "1px solid rgba(14, 165, 233, 0.2)"
              : "1px solid var(--border)",
            color: "var(--foreground)"
          }}
        />
      </div>

      {/* Footer */}
      <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <p
          className="text-[11px] text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          Tezkor:{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: "var(--muted)" }}
          >
            ⌘+Shift+L
          </kbd>{" "}
          tanlangan matnni konvertatsiya
        </p>
      </div>
    </div>
  )
}
