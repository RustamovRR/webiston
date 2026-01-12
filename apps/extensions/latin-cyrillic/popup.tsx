import { useState, useCallback } from "react"
import { isCyrillicText, toCyrillic, toLatin } from "@webiston/transliteration"
import "./src/style.css"

type Direction = "auto" | "to-cyrillic" | "to-latin"

function Popup() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [direction, setDirection] = useState<Direction>("auto")
  const [copied, setCopied] = useState(false)

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
    <div className="w-[380px] min-h-[420px] p-4 bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/assets/icon.png" alt="Logo" className="w-6 h-6" />
          <span className="font-semibold text-sm">Latin Converter</span>
        </div>
        <a
          href="https://webiston.uz/tools/latin-cyrillic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--muted-foreground)] hover:text-primary transition-colors"
        >
          webiston.uz
        </a>
      </div>

      {/* Direction Selector */}
      <div className="flex gap-1 mb-3 p-1 bg-[var(--muted)] rounded-lg">
        {[
          { value: "auto", label: "Avto" },
          { value: "to-cyrillic", label: "→ Кирилл" },
          { value: "to-latin", label: "→ Lotin" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleDirectionChange(opt.value as Direction)}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
              direction === opt.value
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
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
          className="w-full h-32 p-3 text-sm bg-[var(--input)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Tozalash"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-2">
        <button
          onClick={handleSwap}
          disabled={!output}
          className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-full transition-all disabled:opacity-30"
          title="Almashtirish"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Output */}
      <div className="relative">
        <textarea
          value={output}
          readOnly
          placeholder="Natija..."
          className="w-full h-32 p-3 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-lg resize-none"
        />
        {output && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded transition-colors"
            title="Nusxalash"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] text-center">
        <p className="text-[10px] text-[var(--muted-foreground)]">
          O'zbek lotin-kirill konverteri • Webiston
        </p>
      </div>
    </div>
  )
}

export default Popup
