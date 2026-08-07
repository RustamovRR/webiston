import {
  convertWithPreference,
  type DirectionPreference,
  oppositeDirection,
  resolveDirection
} from "@webiston/transliteration"
import {
  SegmentedControl,
  type SegmentedOption
} from "@webiston/ui/composites/SegmentedControl"
import { useCallback, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

/** The same three choices, in the same order, as the web tool. */
const DIRECTION_OPTIONS: SegmentedOption<DirectionPreference>[] = [
  { value: "auto", label: "Avto" },
  { value: "latin-to-cyrillic", label: "→ Кирилл" },
  { value: "cyrillic-to-latin", label: "→ Lotin" }
]

// Icons
function SunIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label="Sun icon"
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
      aria-label="Moon icon"
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
      aria-label="Close icon"
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
      aria-label="Swap icon"
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
      aria-label="Check icon"
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
      aria-label="Copy icon"
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
      aria-label="Cursor icon"
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

/**
 * The site's header badge, reproduced with the SAME utility classes rather
 * than redrawn.
 *
 * What was here before was `<path d="M3 7l6 10 6-10M15 7l3 5 3-5" />` — a
 * stroked zigzag standing in for a `w`. `src/app/icon.svg` records that the
 * mark was hand-drawn twice and rejected both times for reading as a zigzag
 * rather than a letter, which is why the real one uses Inter's own outline.
 * The extension kept the rejected sketch on all three of its surfaces.
 *
 * Copying `Logo.tsx`'s classes is not the same kind of duplication: those
 * classes resolve through the tokens in `style.css`, so the badge follows the
 * theme here exactly as it does on the site. An `<img>` of `icon/128.png`
 * would have been the other option and is worse — the PNG is committed to the
 * dark branch, so it cannot answer to the popup's light mode.
 */
function BrandBadge() {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-9 items-center justify-center rounded-[10px] border border-border-strong bg-gradient-to-br from-primary/30 via-card to-card"
    >
      <span className="font-bold text-foreground text-xl leading-none tracking-tight">
        w
      </span>
      <span className="absolute top-1.25 right-1.25 size-1.25 rounded-[1.5px] bg-primary" />
    </span>
  )
}

/** A labelled card, the popup's version of the web tool's `DualTextPanel`. */
function Panel({
  label,
  dotClassName,
  action,
  children
}: {
  label: string
  dotClassName: string
  action: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex h-10 items-center justify-between px-3.5">
        <span className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
          <span className={`size-1.5 rounded-full ${dotClassName}`} />
          {label}
        </span>
        {action}
      </div>
      {children}
    </section>
  )
}

/** The small ghost button that lives in a panel's label row. */
function PanelAction({
  onClick,
  title,
  children
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </button>
  )
}

/**
 * The manifest binds Command+Shift+L on macOS and Ctrl+Shift+L elsewhere
 * (wxt.config.ts) — the footer hint must show the binding THIS machine has,
 * not the Mac one to everyone.
 */
const SHORTCUT_LABEL = /mac/i.test(navigator.platform)
  ? "⌘+Shift+L"
  : "Ctrl+Shift+L"

export default function App() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  // The same three-state preference the web tool and the in-page popover use.
  const [direction, setDirection] = useState<DirectionPreference>("auto")
  const [copied, setCopied] = useState(false)
  const [floatingEnabled, setFloatingEnabled] = useState(true)
  const [theme, setTheme] = useState<Theme>("system")

  // Load settings.
  //
  // `browser`, not `chrome`: the background script and the content script both
  // use WXT's cross-browser `browser` namespace and only this file reached for
  // the Chrome global — which is untyped here, so these three lines were the
  // extension's only type errors and would have to be rewritten for Firefox.
  useEffect(() => {
    browser.storage.local
      .get(["quickConvertEnabled", "theme"])
      .then((result) => {
        setFloatingEnabled(result.quickConvertEnabled !== false)
        if (result.theme) setTheme(result.theme as Theme)
      })
  }, [])

  // One definition of "is it dark right now". There were two — one inside the
  // effect and one near the render — and only the second one guarded against
  // `window` being undefined.
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    browser.storage.local.set({ theme })
  }, [theme, isDark])

  const toggleTheme = () => {
    // Resolve "system" before flipping. Without this the first click on a
    // light-mode machine went "system" → "light", which is what was already
    // showing — the button appeared dead until you pressed it twice.
    setTheme(() => (isDark ? "light" : "dark"))
  }

  const toggleFloating = async () => {
    const newValue = !floatingEnabled
    setFloatingEnabled(newValue)
    await browser.storage.local.set({ quickConvertEnabled: newValue })
  }

  const convert = useCallback((text: string, dir: DirectionPreference) => {
    if (!text.trim()) {
      setOutput("")
      return
    }
    setOutput(convertWithPreference(text, dir).text)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setInput(text)
    convert(text, direction)
  }

  const handleDirectionChange = (dir: DirectionPreference) => {
    setDirection(dir)
    convert(input, dir)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  /**
   * Swap moves the result into the input and turns the conversion around.
   *
   * It used to exchange the two boxes without reconverting, which left the
   * output pane showing a value that was not a conversion of the input — the
   * web tool and this popup disagreed about what the same button did.
   */
  const handleSwap = () => {
    if (!output) return
    const next = oppositeDirection(resolveDirection(input, direction))
    setDirection(next)
    setInput(output)
    convert(output, next)
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  // The captions have to name the alphabets the text is actually going
  // between, not a fixed pair. The in-page popover already resolves this the
  // same way (`paintDirectionLabels` in content.ts) and the web tool does too;
  // the popup was the one surface that always said "Lotin → Kirill", even
  // while converting the other way.
  const toCyrillic = resolveDirection(input, direction) === "latin-to-cyrillic"
  const sourceLabel = toCyrillic ? "Lotin matn" : "Kirill matn"
  const targetLabel = toCyrillic ? "Kirill natija" : "Lotin natija"

  return (
    <div className="w-[380px] bg-background text-foreground">
      {/* Header — the site's own chrome: a badge, a wordmark, and a bottom
          rule. It sits on `background` while the panels below sit on `card`,
          which is the surface hierarchy every page of the site uses and the
          one thing this popup was missing. */}
      <header className="flex items-center justify-between border-border border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <BrandBadge />
          <div>
            {/* The web tool's own H1. The extension called itself "Latin
                Converter" — an English name on an Uzbek product, matching
                nothing the user had just been reading. */}
            <h1 className="font-semibold text-sm leading-tight">
              Lotin-Kirill O'giruvchi
            </h1>
            <a
              href="https://webiston.uz/tools/latin-cyrillic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground transition-colors hover:text-primary"
            >
              webiston.uz
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className="space-y-3 p-5">
        {/* Quick Convert Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2.5">
            <span
              className={
                floatingEnabled ? "text-primary" : "text-muted-foreground"
              }
            >
              <CursorIcon />
            </span>
            <div>
              <span className="block font-medium text-sm leading-tight">
                Tezkor konvertatsiya
              </span>
              <span className="text-[11px] text-muted-foreground">
                Matn tanlanganda avtomatik
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleFloating}
            role="switch"
            aria-checked={floatingEnabled}
            aria-label="Tezkor konvertatsiya"
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              floatingEnabled ? "bg-primary" : "bg-border-strong"
            }`}
          >
            {/* `primary-foreground`, not a literal white: the knob has to read
                against `--primary`, which is exactly what that token pair
                means. (Do not name a raw palette utility here even in prose —
                Tailwind scans comments too, so an earlier draft of this note
                emitted a dead rule for the class it was arguing against.) */}
            {/* `left-1` is not decoration. Without it the knob is `left: auto`
                and falls back to its STATIC position, which a button centres
                (`text-align: center` is in every UA stylesheet) — measured at
                `left: 22px`, so `translate-x-6` put the knob at 46px inside a
                44px track: entirely outside the switch it belongs to.
                `SegmentedControl` carries the same note for the same reason. */}
            <span
              className={`absolute top-1 left-1 size-4 rounded-full bg-primary-foreground transition-transform duration-200 ${
                floatingEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Direction Selector — the SAME control the web tool uses.
            The hand-rolled version here put the highlight on the active option
            itself, so there was nothing to animate between and the selection
            jumped from tab to tab. It also had no radio semantics and no
            keyboard support. Both surfaces now share one implementation. */}
        <SegmentedControl
          className="w-full"
          label="Konvertatsiya yo'nalishi"
          options={DIRECTION_OPTIONS}
          value={direction}
          onChange={handleDirectionChange}
        />

        {/* Input panel. The label row carries a status dot and the panel's one
            action, exactly like `DualTextPanel` on the web tool — same
            anatomy, so the two surfaces read as one product. */}
        <Panel
          label={sourceLabel}
          dotClassName="bg-muted-foreground"
          action={
            input ? (
              <PanelAction onClick={handleClear} title="Tozalash">
                <CloseIcon />
              </PanelAction>
            ) : null
          }
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Matn kiriting..."
            className="h-20 w-full resize-none bg-transparent px-3.5 pb-3.5 text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
        </Panel>

        {/* Swap */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!output}
            className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:border-ring hover:text-primary disabled:pointer-events-none disabled:opacity-30"
            title="Almashtirish"
          >
            <SwapIcon />
          </button>
        </div>

        {/* Output panel */}
        <Panel
          label={targetLabel}
          dotClassName="bg-primary"
          action={
            output ? (
              <PanelAction onClick={handleCopy} title="Nusxalash">
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span className={copied ? "text-success" : undefined}>
                  {copied ? "Nusxalandi" : "Nusxalash"}
                </span>
              </PanelAction>
            ) : null
          }
        >
          <textarea
            value={output}
            readOnly
            placeholder="Natija shu yerda ko'rinadi..."
            className="h-20 w-full resize-none bg-transparent px-3.5 pb-3.5 text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
        </Panel>
      </div>

      <footer className="border-border border-t px-5 py-3">
        <p className="text-center text-[11px] text-muted-foreground">
          Tezkor:{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            {SHORTCUT_LABEL}
          </kbd>{" "}
          tanlangan matnni konvertatsiya
        </p>
      </footer>
    </div>
  )
}
