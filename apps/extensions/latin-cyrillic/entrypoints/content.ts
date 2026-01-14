import { isCyrillicText, toCyrillic, toLatin } from "@webiston/transliteration"

// State
let triggerIcon: HTMLElement | null = null
let popover: HTMLElement | null = null
let shadowRoot: ShadowRoot | null = null
let isEnabled = true
let selectedText = ""
let selectionRect: DOMRect | null = null
let currentTheme: "light" | "dark" = "light"

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
    document.addEventListener("scroll", cleanup, true)

    // Keyboard shortcut handler
    browser.runtime.onMessage.addListener(
      (
        message: { type: string },
        _sender: unknown,
        sendResponse: (response: { success: boolean }) => void
      ) => {
        if (message.type === "CONVERT_SELECTION") {
          const sel = window.getSelection()?.toString().trim()
          if (sel) {
            const result = isCyrillicText(sel) ? toLatin(sel) : toCyrillic(sel)
            navigator.clipboard.writeText(result)
          }
          sendResponse({ success: true })
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

  const isCyrillic = isCyrillicText(selectedText)
  const converted = isCyrillic
    ? toLatin(selectedText)
    : toCyrillic(selectedText)

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

  const isCyrillic = isCyrillicText(text)
  const converted = isCyrillic ? toLatin(text) : toCyrillic(text)
  outputEl.value = converted

  const inputLabel = popover?.querySelector(".wc-panel:first-child .wc-label")
  const outputLabel = popover?.querySelector(".wc-panel:last-child .wc-label")
  if (inputLabel) inputLabel.textContent = isCyrillic ? "Кирилл" : "Lotin"
  if (outputLabel) outputLabel.textContent = isCyrillic ? "Lotin" : "Кирилл"
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

  const text = inputEl.value
  const converted = action === "to-latin" ? toLatin(text) : toCyrillic(text)
  outputEl.value = converted

  popover?.querySelectorAll(".wc-dir-btn").forEach((btn) => {
    const btnEl = btn as HTMLButtonElement
    btn.classList.toggle("active", btnEl.dataset.action === action)
  })

  const inputLabel = popover?.querySelector(".wc-panel:first-child .wc-label")
  const outputLabel = popover?.querySelector(".wc-panel:last-child .wc-label")
  if (action === "to-latin") {
    if (inputLabel) inputLabel.textContent = "Кирилл"
    if (outputLabel) outputLabel.textContent = "Lotin"
  } else {
    if (inputLabel) inputLabel.textContent = "Lotin"
    if (outputLabel) outputLabel.textContent = "Кирилл"
  }
}

function replaceOriginal() {
  const outputEl = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!outputEl) return

  const newText = outputEl.value
  navigator.clipboard.writeText(newText)
  cleanup()
}

function cleanup() {
  const host = document.getElementById("webiston-ext-host")
  host?.remove()
  triggerIcon = null
  popover = null
  shadowRoot = null
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
    /* CSS Variables */
    :host {
      --bg: #ffffff;
      --fg: #0a0a0a;
      --muted: #f5f5f5;
      --muted-fg: #737373;
      --border: #e5e5e5;
      --input-bg: #fafafa;
      --primary: #0ea5e9;
      --primary-hover: #0284c7;
      --success: #10b981;
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
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4), 0 0 0 1px rgba(255,255,255,0.1);
      animation: wcPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .wc-trigger:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5);
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
      --bg: #0a0a0a;
      --fg: #fafafa;
      --muted: #1a1a1a;
      --muted-fg: #a3a3a3;
      --border: #262626;
      --input-bg: #171717;
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
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wc-logo-icon svg {
      width: 16px;
      height: 16px;
      color: white;
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
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    .wc-output {
      background: rgba(14, 165, 233, 0.05);
      border-color: rgba(14, 165, 233, 0.2);
    }
    .wc-popover.dark .wc-output {
      background: rgba(14, 165, 233, 0.1);
      border-color: rgba(14, 165, 233, 0.3);
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
      color: white;
    }
    .wc-replace {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.15s;
    }
    .wc-replace:hover {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .wc-replace svg {
      width: 14px;
      height: 14px;
    }
  `
}
