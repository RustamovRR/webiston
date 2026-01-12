import { isCyrillicText, toCyrillic, toLatin } from "@webiston/transliteration"
import { useCallback, useEffect, useState } from "react"

type Direction = "auto" | "to-cyrillic" | "to-latin"

// SVG Icons with accessibility
function CloseIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Tozalash</title>
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
      aria-hidden="true"
    >
      <title>Almashtirish</title>
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
      className="w-4 h-4 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Nusxalandi</title>
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
      aria-hidden="true"
    >
      <title>Nusxalash</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
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

  // Load floating toolbar state
  useEffect(() => {
    chrome.storage.local.get("quickConvertEnabled").then((result) => {
      setFloatingEnabled(result.quickConvertEnabled !== false)
    })
  }, [])

  // Toggle floating toolbar
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

  return (
    <div
      className="w-[380px] min-h-[420px] p-4"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/icon/128.png" alt="Logo" className="w-6 h-6" />
          <span className="font-semibold text-sm">Latin Converter</span>
        </div>
        <a
          href="https://webiston.uz/tools/latin-cyrillic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:text-sky-500 transition-colors"
          style={{ color: "var(--muted-foreground)" }}
        >
          webiston.uz
        </a>
      </div>

      {/* Quick Convert Toggle */}
      <div
        className="flex items-center justify-between mb-3 p-2 rounded-lg"
        style={{ background: "var(--muted)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            style={{
              color: floatingEnabled ? "#0ea5e9" : "var(--muted-foreground)"
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Quick Convert</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          <span className="text-xs font-medium">Tezkor konvertatsiya</span>
        </div>
        <button
          onClick={toggleFloating}
          className={`relative w-10 h-5 rounded-full transition-colors ${floatingEnabled ? "bg-sky-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${floatingEnabled ? "left-5" : "left-0.5"}`}
          />
        </button>
      </div>

      {/* Direction Selector */}
      <div
        className="flex gap-1 mb-3 p-1 rounded-lg"
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
            className="flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all"
            style={{
              background:
                direction === opt.value ? "var(--background)" : "transparent",
              color:
                direction === opt.value
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
              boxShadow:
                direction === opt.value ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative mb-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Matn kiriting..."
          className="w-full h-28 p-3 text-sm rounded-lg resize-none focus:outline-none focus:ring-2"
          style={{
            background: "var(--input)",
            border: "1px solid var(--border)",
            color: "var(--foreground)"
          }}
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            title="Tozalash"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-2">
        <button
          onClick={handleSwap}
          disabled={!output}
          className="p-2 rounded-full transition-all disabled:opacity-30"
          style={{ color: "var(--muted-foreground)" }}
          title="Almashtirish"
        >
          <SwapIcon />
        </button>
      </div>

      {/* Output */}
      <div className="relative">
        <textarea
          value={output}
          readOnly
          placeholder="Natija..."
          className="w-full h-28 p-3 text-sm rounded-lg resize-none"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--foreground)"
          }}
        />
        {output && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            title="Nusxalash"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}
      </div>

      {/* Keyboard Shortcut Hint */}
      <div
        className="mt-3 pt-2 text-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          Tezkor:{" "}
          <kbd
            className="px-1 py-0.5 rounded text-[9px]"
            style={{ background: "var(--muted)" }}
          >
            ⌘+Shift+L
          </kbd>{" "}
          tanlangan matnni konvertatsiya
        </p>
      </div>

      {/* Footer */}
      <div className="mt-2 text-center">
        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          O'zbek lotin-kirill konverteri • Webiston
        </p>
      </div>
    </div>
  )
}
