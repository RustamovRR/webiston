import {
  convert,
  convertWithPreference,
  type DirectionPreference,
  resolveDirection
} from "@webiston/transliteration"

/**
 * The site's design tokens, copied from `src/styles/tokens.css` exactly the
 * way the popup's `style.css` copies them (see the note there — one shared
 * token file under packages/ui is the tracked fix for the drift risk). The
 * popover used to be the old sky palette while the popup and the site had
 * moved to the flag teal at hue 217 — two surfaces of one extension wearing
 * two different brands.
 */
const TOKENS = {
  light: {
    bg: "oklch(0.985 0.004 217)",
    fg: "oklch(0.205 0.012 217)",
    muted: "oklch(0.965 0.005 217)",
    mutedFg: "oklch(0.505 0.012 217)",
    border: "oklch(0.905 0.008 217)",
    inputBg: "oklch(0.98 0.004 217)",
    primary: "oklch(0.49 0.085 217)",
    primaryHover: "oklch(0.41 0.071 217)",
    primaryFg: "oklch(0.985 0 0)",
    success: "oklch(0.542 0.142 150)"
  },
  dark: {
    bg: "oklch(0.205 0.006 217)",
    fg: "oklch(0.985 0 0)",
    muted: "oklch(0.269 0.008 217)",
    mutedFg: "oklch(0.72 0.02 217)",
    border: "oklch(1 0 0 / 12%)",
    inputBg: "oklch(1 0 0 / 16%)",
    primary: "oklch(0.745 0.115 217)",
    primaryHover: "oklch(0.66 0.114 217)",
    primaryFg: "oklch(0.205 0 0)",
    success: "oklch(0.8 0.175 150)"
  }
} as const

// State
let triggerIcon: HTMLElement | null = null
let popover: HTMLElement | null = null
let shadowRoot: ShadowRoot | null = null
let isEnabled = true
let selectedText = ""
let selectionRect: DOMRect | null = null
let currentTheme: "light" | "dark" = "light"
/**
 * The Range the user selected, kept so "Almashtirish" can write into it.
 *
 * The button existed, was labelled Replace, carried a pencil icon — and its
 * body copied to the clipboard and closed the popover, exactly like the Copy
 * button next to it. Nothing was ever replaced.
 */
let selectionRange: Range | null = null
/** The popover's direction control; "auto" until the user picks a side. */
let popoverPreference: DirectionPreference = "auto"

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Load settings
    browser.storage.local
      .get(["quickConvertEnabled", "theme"])
      .then((result: Record<string, unknown>) => {
        isEnabled = result.quickConvertEnabled !== false
        updateTheme(result.theme as string)
      })

    browser.storage.onChanged.addListener(
      (changes: Record<string, { newValue?: unknown }>) => {
        if (changes.quickConvertEnabled) {
          isEnabled = changes.quickConvertEnabled.newValue !== false
          if (!isEnabled) cleanup()
        }
        if (changes.theme) {
          updateTheme(changes.theme.newValue as string)
        }
      }
    )

    // Selection event
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mousedown", handleClickOutside)
    // Capture-phase, so scrolls anywhere on the page close the popover —
    // EXCEPT scrolls born inside it. Shadow DOM retargets those to the host,
    // and without the guard scrolling the popover's own textarea killed the
    // popover mid-read.
    document.addEventListener(
      "scroll",
      (event) => {
        const host = document.getElementById("webiston-ext-host")
        if (host && event.target instanceof Node && host.contains(event.target))
          return
        cleanup()
      },
      true
    )
    // Escape dismisses whatever is showing, like every other popover.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && (popover || triggerIcon)) cleanup()
    })

    // Keyboard shortcut handler
    browser.runtime.onMessage.addListener(
      (
        message: { type: string; text?: string },
        _sender: unknown,
        sendResponse: (response: { success: boolean }) => void
      ) => {
        if (message.type === "CONVERT_SELECTION") {
          const sel = window.getSelection()?.toString().trim()
          if (sel) {
            navigator.clipboard.writeText(
              convertWithPreference(sel, "auto").text
            )
            showToast("Nusxalandi")
          }
          sendResponse({ success: true })
          return true
        }

        // background.ts has sent this for every context-menu click since the
        // menus were added; nothing listened for it, so all three entries
        // computed a conversion and threw it away. They work now: write into
        // the selection when it is editable, fall back to the clipboard when
        // it is not — and SAY which happened. Silent success on a read-only
        // page is indistinguishable from a broken menu item.
        if (message.type === "REPLACE_SELECTION" && message.text) {
          const replaced = replaceSelectionWith(message.text)
          if (!replaced) navigator.clipboard.writeText(message.text)
          showToast(replaced ? "Almashtirildi" : "Nusxalandi")
          sendResponse({ success: true })
          return true
        }

        return true
      }
    )
  }
})

function updateTheme(theme: string | undefined) {
  if (theme === "dark") {
    currentTheme = "dark"
  } else if (theme === "light") {
    currentTheme = "light"
  } else {
    // System preference
    currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
}

function handleMouseUp(e: MouseEvent) {
  const target = e.target as Node
  const host = document.getElementById("webiston-ext-host")

  if (host?.contains(target)) return
  if (popover) return

  setTimeout(() => {
    if (!isEnabled) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (!text || text.length < 2) {
      if (triggerIcon && !popover) cleanup()
      return
    }

    selectedText = text
    const range = selection?.getRangeAt(0)
    if (!range) return

    selectionRect = range.getBoundingClientRect()
    // Cloned: the live Range is invalidated the moment the user clicks the
    // trigger icon, which is the click that collapses the selection.
    selectionRange = range.cloneRange()
    showTriggerIcon()
  }, 10)
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const host = document.getElementById("webiston-ext-host")

  if (host?.contains(target)) return
  if (triggerIcon || popover) cleanup()
}

// ============================================
// TRIGGER ICON
// ============================================
function showTriggerIcon() {
  cleanup()
  if (!selectionRect) return

  const host = document.createElement("div")
  host.id = "webiston-ext-host"
  shadowRoot = host.attachShadow({ mode: "closed" })

  const styles = document.createElement("style")
  styles.textContent = getStyles()
  shadowRoot.appendChild(styles)

  triggerIcon = document.createElement("button")
  triggerIcon.className = "wc-trigger"
  triggerIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M3 7l6 10 6-10M15 7l3 5 3-5"/>
    </svg>
  `
  triggerIcon.title = "Lotin ↔ Kirill"
  triggerIcon.addEventListener("click", handleTriggerClick)

  const left = selectionRect.right + 8
  const top = selectionRect.top + selectionRect.height / 2 - 16

  triggerIcon.style.left = `${Math.min(left, window.innerWidth - 44)}px`
  triggerIcon.style.top = `${Math.max(top, 8)}px`

  shadowRoot.appendChild(triggerIcon)
  document.body.appendChild(host)
}

function handleTriggerClick(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()

  const rect = selectionRect
  const text = selectedText
  const currentShadowRoot = shadowRoot
  const host = document.getElementById("webiston-ext-host")

  if (triggerIcon) {
    triggerIcon.remove()
    triggerIcon = null
  }

  selectionRect = rect
  selectedText = text
  shadowRoot = currentShadowRoot

  showPopoverInPlace(host)
}

// ============================================
// POPOVER
// ============================================
function showPopoverInPlace(existingHost: HTMLElement | null) {
  if (!selectionRect || !selectedText) return

  if (!shadowRoot) {
    if (existingHost) existingHost.remove()
    const host = document.createElement("div")
    host.id = "webiston-ext-host"
    shadowRoot = host.attachShadow({ mode: "closed" })
    document.body.appendChild(host)
  }

  // Add styles if not present
  if (!shadowRoot.querySelector("style")) {
    const styles = document.createElement("style")
    styles.textContent = getStyles()
    shadowRoot.appendChild(styles)
  }

  // The popover opens in "auto" and reports which way auto went, so the two
  // direction buttons show the real state rather than a guess of their own.
  const { text: converted, direction } = convertWithPreference(
    selectedText,
    "auto"
  )
  const isCyrillic = direction === "cyrillic-to-latin"

  popover = document.createElement("div")
  popover.className = `wc-popover ${currentTheme === "dark" ? "dark" : ""}`
  popover.innerHTML = `
    <div class="wc-header">
      <div class="wc-logo">
        <div class="wc-logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 7l6 10 6-10M15 7l3 5 3-5"/>
          </svg>
        </div>
        <span>Latin Converter</span>
      </div>
      <button class="wc-close" data-action="close" title="Yopish">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <div class="wc-body">
      <div class="wc-panel">
        <div class="wc-panel-header">
          <span class="wc-label">${isCyrillic ? "Кирилл" : "Lotin"}</span>
        </div>
        <textarea class="wc-textarea wc-input" data-type="input" spellcheck="false">${escapeHtml(selectedText)}</textarea>
      </div>
      
      <div class="wc-divider">
        <button class="wc-swap" data-action="swap" title="Almashtirish">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        </button>
      </div>
      
      <div class="wc-panel">
        <div class="wc-panel-header">
          <span class="wc-label">${isCyrillic ? "Lotin" : "Кирилл"}</span>
          <button class="wc-copy" data-action="copy" title="Nusxalash">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            <span>Nusxalash</span>
          </button>
        </div>
        <textarea class="wc-textarea wc-output" data-type="output" readonly spellcheck="false">${escapeHtml(converted)}</textarea>
      </div>
    </div>
    
    <div class="wc-footer">
      <div class="wc-direction">
        <button class="wc-dir-btn ${!isCyrillic ? "active" : ""}" data-action="to-cyrillic">→ Кирилл</button>
        <button class="wc-dir-btn ${isCyrillic ? "active" : ""}" data-action="to-latin">→ Lotin</button>
      </div>
      <button class="wc-replace" data-action="replace">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
        Almashtirish
      </button>
    </div>
  `

  positionPopover()

  popover.addEventListener("click", handlePopoverClick)
  popover
    .querySelector('[data-type="input"]')
    ?.addEventListener("input", handleInputChange)

  shadowRoot.appendChild(popover)
}

function positionPopover() {
  if (!popover || !selectionRect) return

  const popoverWidth = 380
  const popoverHeight = 360

  let left = selectionRect.left + selectionRect.width / 2 - popoverWidth / 2
  let top = selectionRect.bottom + 12

  if (left < 16) left = 16
  if (left + popoverWidth > window.innerWidth - 16) {
    left = window.innerWidth - popoverWidth - 16
  }
  if (top + popoverHeight > window.innerHeight - 16) {
    top = selectionRect.top - popoverHeight - 12
  }

  popover.style.left = `${left}px`
  popover.style.top = `${top}px`
}

function handlePopoverClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const button = target.closest("button") as HTMLButtonElement | null
  if (!button) return

  const action = button.dataset.action

  switch (action) {
    case "close":
      cleanup()
      break
    case "copy":
      copyOutput(button)
      break
    case "swap":
      swapPanels()
      break
    case "replace":
      replaceOriginal()
      break
    case "to-cyrillic":
    case "to-latin":
      changeDirection(action)
      break
  }
}

function handleInputChange(e: Event) {
  const input = e.target as HTMLTextAreaElement
  const text = input.value
  const outputEl = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!outputEl) return

  // Honour the direction the user picked. Typing used to reset it silently:
  // the button stayed highlighted while the output flipped back to auto.
  const direction = resolveDirection(text, popoverPreference)
  outputEl.value = convert(text, direction)
  paintDirectionLabels(direction)
}

/** Keep the two panel captions honest about which way the text is going. */
function paintDirectionLabels(direction: string) {
  const toCyr = direction === "latin-to-cyrillic"
  const inputLabel = popover?.querySelector(".wc-panel:first-child .wc-label")
  const outputLabel = popover?.querySelector(".wc-panel:last-child .wc-label")
  if (inputLabel) inputLabel.textContent = toCyr ? "Lotin" : "Кирилл"
  if (outputLabel) outputLabel.textContent = toCyr ? "Кирилл" : "Lotin"
}

function copyOutput(button: HTMLElement) {
  const output = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!output) return

  navigator.clipboard.writeText(output.value)

  button.classList.add("success")
  const span = button.querySelector("span")
  const originalText = span?.textContent
  if (span) span.textContent = "Nusxalandi!"

  setTimeout(() => {
    button.classList.remove("success")
    if (span) span.textContent = originalText || "Nusxalash"
  }, 1500)
}

function swapPanels() {
  const inputEl = popover?.querySelector(
    '[data-type="input"]'
  ) as HTMLTextAreaElement
  const outputEl = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!inputEl || !outputEl) return

  const temp = inputEl.value
  inputEl.value = outputEl.value
  outputEl.value = temp

  inputEl.dispatchEvent(new Event("input"))
}

function changeDirection(action: string) {
  const inputEl = popover?.querySelector(
    '[data-type="input"]'
  ) as HTMLTextAreaElement
  const outputEl = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!inputEl || !outputEl) return

  popoverPreference =
    action === "to-latin" ? "cyrillic-to-latin" : "latin-to-cyrillic"

  outputEl.value = convert(inputEl.value, popoverPreference)

  popover?.querySelectorAll(".wc-dir-btn").forEach((btn) => {
    const btnEl = btn as HTMLButtonElement
    btn.classList.toggle("active", btnEl.dataset.action === action)
  })

  paintDirectionLabels(popoverPreference)
}

/**
 * Write `text` over the user's selection.
 *
 * Two paths, because the DOM has two: a form field has `selectionStart`/`End`
 * and a value, everything else has a Range. Returns false when there is
 * nothing writable — a selection inside ordinary page text is not editable,
 * and pretending otherwise is what the old Replace button did.
 */
function replaceSelectionWith(text: string): boolean {
  const active = document.activeElement
  if (
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLInputElement && active.selectionStart !== null)
  ) {
    const start = active.selectionStart ?? 0
    const end = active.selectionEnd ?? start
    active.setRangeText(text, start, end, "end")
    // React and every other controlled-input framework listens for this.
    active.dispatchEvent(new Event("input", { bubbles: true }))
    return true
  }

  // Prefer what is selected RIGHT NOW. `selectionRange` is a clone taken when
  // the trigger icon appeared, which the context-menu path never goes through
  // — and by the time the popover's Replace is clicked the live selection may
  // have moved. Fall back to the clone only when there is no live one.
  const live = window.getSelection()
  const range =
    live && live.rangeCount > 0 && !live.isCollapsed
      ? live.getRangeAt(0)
      : selectionRange
  if (!range) return false

  const host = range.commonAncestorContainer
  const element =
    host.nodeType === Node.ELEMENT_NODE ? (host as Element) : host.parentElement
  if (!element?.closest('[contenteditable="true"], [contenteditable=""]')) {
    return false
  }

  range.deleteContents()
  range.insertNode(document.createTextNode(text))
  element.dispatchEvent(new Event("input", { bubbles: true }))
  return true
}

function replaceOriginal() {
  const outputEl = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!outputEl) return

  // Replace where we can, copy where we cannot — and say which happened
  // rather than looking identical either way.
  const replaced = replaceSelectionWith(outputEl.value)
  if (!replaced) navigator.clipboard.writeText(outputEl.value)
  cleanup()
  showToast(replaced ? "Almashtirildi" : "Nusxalandi")
}

/**
 * A small transient confirmation, in its own host so `cleanup()` — which
 * removes the popover host — cannot take an active toast down with it.
 * This is the only feedback the context menu and the keyboard shortcut have:
 * both act on pages where nothing else visibly changes.
 */
function showToast(message: string) {
  document.getElementById("webiston-ext-toast")?.remove()
  const host = document.createElement("div")
  host.id = "webiston-ext-toast"
  const root = host.attachShadow({ mode: "closed" })
  const style = document.createElement("style")
  style.textContent = `
    .wc-toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid ${TOKENS.light.border};
      background: ${TOKENS.light.bg};
      color: ${TOKENS.light.fg};
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
      animation: wcToast 1.8s ease forwards;
    }
    @media (prefers-color-scheme: dark) {
      .wc-toast {
        border-color: ${TOKENS.dark.border};
        background: ${TOKENS.dark.bg};
        color: ${TOKENS.dark.fg};
      }
    }
    @keyframes wcToast {
      0% { opacity: 0; transform: translateX(-50%) translateY(6px); }
      10%, 82% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(0); }
    }
  `
  const pill = document.createElement("div")
  pill.className = "wc-toast"
  pill.textContent = message
  root.append(style, pill)
  document.body.appendChild(host)
  setTimeout(() => host.remove(), 1900)
}

function cleanup() {
  const host = document.getElementById("webiston-ext-host")
  host?.remove()
  triggerIcon = null
  popover = null
  shadowRoot = null
  selectionRange = null
  popoverPreference = "auto"
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// ============================================
// STYLES
// ============================================
function getStyles(): string {
  return `
    /* CSS Variables — the site's tokens, from the TOKENS table above. */
    :host {
      --bg: ${TOKENS.light.bg};
      --fg: ${TOKENS.light.fg};
      --muted: ${TOKENS.light.muted};
      --muted-fg: ${TOKENS.light.mutedFg};
      --border: ${TOKENS.light.border};
      --input-bg: ${TOKENS.light.inputBg};
      --primary: ${TOKENS.light.primary};
      --primary-hover: ${TOKENS.light.primaryHover};
      --primary-fg: ${TOKENS.light.primaryFg};
      --success: ${TOKENS.light.success};
      --radius: 12px;
    }

    /* Trigger Button */
    .wc-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 10px;
      background: var(--primary);
      color: var(--primary-fg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255,255,255,0.1);
      animation: wcPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.15s, box-shadow 0.15s, background-color 0.15s;
    }
    .wc-trigger:hover {
      transform: scale(1.1);
      background: var(--primary-hover);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
    }
    .wc-trigger:active {
      transform: scale(0.95);
    }
    .wc-trigger svg {
      width: 18px;
      height: 18px;
    }
    @keyframes wcPop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Popover */
    .wc-popover {
      position: fixed;
      z-index: 2147483647;
      width: 380px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      animation: wcSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    .wc-popover.dark {
      --bg: ${TOKENS.dark.bg};
      --fg: ${TOKENS.dark.fg};
      --muted: ${TOKENS.dark.muted};
      --muted-fg: ${TOKENS.dark.mutedFg};
      --border: ${TOKENS.dark.border};
      --input-bg: ${TOKENS.dark.inputBg};
      --primary: ${TOKENS.dark.primary};
      --primary-hover: ${TOKENS.dark.primaryHover};
      --primary-fg: ${TOKENS.dark.primaryFg};
      --success: ${TOKENS.dark.success};
    }
    @keyframes wcSlide {
      0% { opacity: 0; transform: translateY(-8px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Header */
    .wc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--muted);
    }
    .wc-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--fg);
      font-weight: 600;
      font-size: 14px;
    }
    .wc-logo-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wc-logo-icon svg {
      width: 16px;
      height: 16px;
      color: var(--primary-fg);
    }
    .wc-close {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      color: var(--muted-fg);
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .wc-close:hover {
      background: var(--border);
      color: var(--fg);
    }
    .wc-close svg {
      width: 16px;
      height: 16px;
    }

    /* Body */
    .wc-body {
      padding: 16px;
    }
    .wc-panel {
      margin-bottom: 0;
    }
    .wc-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .wc-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted-fg);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .wc-copy {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: none;
      background: transparent;
      color: var(--muted-fg);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .wc-copy:hover {
      background: var(--muted);
      color: var(--primary);
    }
    .wc-copy.success {
      color: var(--success);
    }
    .wc-copy svg {
      width: 14px;
      height: 14px;
    }
    .wc-textarea {
      width: 100%;
      height: 80px;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--input-bg);
      color: var(--fg);
      font-size: 14px;
      line-height: 1.5;
      resize: none;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .wc-textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 14%, transparent);
    }
    .wc-output {
      background: color-mix(in oklab, var(--primary) 6%, transparent);
      border-color: color-mix(in oklab, var(--primary) 24%, transparent);
    }
    .wc-popover.dark .wc-output {
      background: color-mix(in oklab, var(--primary) 12%, transparent);
      border-color: color-mix(in oklab, var(--primary) 32%, transparent);
    }

    /* Divider */
    .wc-divider {
      display: flex;
      justify-content: center;
      padding: 10px 0;
    }
    .wc-swap {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--muted-fg);
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .wc-swap:hover {
      background: var(--muted);
      color: var(--primary);
      border-color: var(--primary);
    }
    .wc-swap svg {
      width: 18px;
      height: 18px;
    }

    /* Footer */
    .wc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-top: 1px solid var(--border);
      background: var(--muted);
    }
    .wc-direction {
      display: flex;
      gap: 6px;
    }
    .wc-dir-btn {
      padding: 8px 12px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--muted-fg);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.15s;
    }
    .wc-dir-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .wc-dir-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: var(--primary-fg);
    }
    .wc-replace {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      background: var(--primary);
      color: var(--primary-fg);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.15s;
    }
    .wc-replace:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .wc-replace svg {
      width: 14px;
      height: 14px;
    }
  `
}
