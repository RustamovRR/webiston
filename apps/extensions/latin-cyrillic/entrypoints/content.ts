import { isCyrillicText, toCyrillic, toLatin } from "@webiston/transliteration"

// State
let triggerIcon: HTMLElement | null = null
let popover: HTMLElement | null = null
let shadowRoot: ShadowRoot | null = null
let isEnabled = true
let selectedText = ""
let selectionRect: DOMRect | null = null

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Load settings
    browser.storage.local
      .get("quickConvertEnabled")
      .then((result: Record<string, unknown>) => {
        isEnabled = result.quickConvertEnabled !== false
      })

    browser.storage.onChanged.addListener(
      (changes: Record<string, { newValue?: unknown }>) => {
        if (changes.quickConvertEnabled) {
          isEnabled = changes.quickConvertEnabled.newValue !== false
          if (!isEnabled) cleanup()
        }
      }
    )

    // Selection event
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("selectionchange", handleSelectionChange)
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

function handleMouseUp(e: MouseEvent) {
  const target = e.target as Node
  const host = document.getElementById("webiston-ext-host")

  // Ignore clicks inside our shadow host
  if (host?.contains(target)) return

  // Also check if click is on shadow elements
  if (triggerIcon || popover) {
    // If we have UI showing, don't process new selections immediately
    return
  }

  setTimeout(() => {
    if (!isEnabled) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (!text || text.length < 2) {
      cleanup()
      return
    }

    selectedText = text
    const range = selection?.getRangeAt(0)
    if (!range) return

    selectionRect = range.getBoundingClientRect()
    showTriggerIcon()
  }, 10)
}

function handleSelectionChange() {
  const selection = window.getSelection()
  if (!selection || selection.toString().trim().length < 2) {
    // Don't cleanup immediately - user might be adjusting selection
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const host = document.getElementById("webiston-ext-host")

  // Don't cleanup if clicking inside our UI
  if (host?.contains(target)) return

  // Only cleanup if we have popover showing (not trigger)
  if (popover) {
    cleanup()
  }
}

// ============================================
// TRIGGER ICON (DeepL Style - Small W Button)
// ============================================
function showTriggerIcon() {
  cleanup()
  if (!selectionRect) return

  // Create shadow host
  const host = document.createElement("div")
  host.id = "webiston-ext-host"
  shadowRoot = host.attachShadow({ mode: "closed" })

  // Inject styles
  const styles = document.createElement("style")
  styles.textContent = getTriggerStyles()
  shadowRoot.appendChild(styles)

  // Create trigger icon
  triggerIcon = document.createElement("button")
  triggerIcon.className = "wc-trigger"
  triggerIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M3 7l6 10 6-10M15 7l3 5 3-5"/>
    </svg>
  `
  triggerIcon.title = "Lotin ↔ Kirill"
  triggerIcon.addEventListener("click", handleTriggerClick)

  // Position: right side of selection
  const left = selectionRect.right + 6
  const top = selectionRect.top + selectionRect.height / 2 - 14

  triggerIcon.style.left = `${Math.min(left, window.innerWidth - 40)}px`
  triggerIcon.style.top = `${Math.max(top, 8)}px`

  shadowRoot.appendChild(triggerIcon)
  document.body.appendChild(host)
}

function handleTriggerClick(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()

  // Flag to prevent mouseup from interfering
  const rect = selectionRect
  const text = selectedText

  // Small delay to let mouseup pass
  setTimeout(() => {
    selectionRect = rect
    selectedText = text
    showPopover()
  }, 50)
}

// ============================================
// POPOVER (Dual Panel - Like DeepL)
// ============================================
function showPopover() {
  if (!selectionRect) return

  // Remove trigger icon but keep shadowRoot
  triggerIcon?.remove()
  triggerIcon = null

  // If shadowRoot doesn't exist, create new host
  if (!shadowRoot) {
    const host = document.createElement("div")
    host.id = "webiston-ext-host"
    shadowRoot = host.attachShadow({ mode: "closed" })
    document.body.appendChild(host)
  }

  // Detect script and convert
  const isCyrillic = isCyrillicText(selectedText)
  const converted = isCyrillic
    ? toLatin(selectedText)
    : toCyrillic(selectedText)

  // Create popover
  popover = document.createElement("div")
  popover.className = "wc-popover"
  popover.innerHTML = `
    <div class="wc-header">
      <div class="wc-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7l6 10 6-10M15 7l3 5 3-5"/>
        </svg>
        <span>Latin Converter</span>
      </div>
      <button class="wc-close" data-action="close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <div class="wc-panels">
      <div class="wc-panel wc-panel-input">
        <div class="wc-panel-header">
          <span class="wc-label">${isCyrillic ? "Кирилл" : "Lotin"}</span>
        </div>
        <textarea class="wc-textarea" data-type="input" spellcheck="false">${escapeHtml(selectedText)}</textarea>
      </div>
      
      <div class="wc-divider">
        <button class="wc-swap" data-action="swap" title="Almashtirish">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        </button>
      </div>
      
      <div class="wc-panel wc-panel-output">
        <div class="wc-panel-header">
          <span class="wc-label">${isCyrillic ? "Lotin" : "Кирилл"}</span>
          <button class="wc-copy" data-action="copy" title="Nusxalash">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>
        </div>
        <textarea class="wc-textarea" data-type="output" readonly spellcheck="false">${escapeHtml(converted)}</textarea>
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

  // Add popover styles (if not already added)
  if (!shadowRoot.querySelector("#wc-popover-styles")) {
    const popoverStyles = document.createElement("style")
    popoverStyles.id = "wc-popover-styles"
    popoverStyles.textContent = getPopoverStyles()
    shadowRoot.appendChild(popoverStyles)
  }

  // Add trigger styles too (for consistency)
  if (!shadowRoot.querySelector("#wc-trigger-styles")) {
    const triggerStyles = document.createElement("style")
    triggerStyles.id = "wc-trigger-styles"
    triggerStyles.textContent = getTriggerStyles()
    shadowRoot.appendChild(triggerStyles)
  }

  // Position popover
  positionPopover()

  // Event listeners
  popover.addEventListener("click", handlePopoverClick)
  popover
    .querySelector('[data-type="input"]')
    ?.addEventListener("input", handleInputChange)

  shadowRoot.appendChild(popover)
}

function positionPopover() {
  if (!popover || !selectionRect) return

  const popoverWidth = 360
  const popoverHeight = 320

  let left = selectionRect.left + selectionRect.width / 2 - popoverWidth / 2
  let top = selectionRect.bottom + 12

  // Boundary checks
  if (left < 12) left = 12
  if (left + popoverWidth > window.innerWidth - 12) {
    left = window.innerWidth - popoverWidth - 12
  }
  if (top + popoverHeight > window.innerHeight - 12) {
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

  // Detect and convert
  const isCyrillic = isCyrillicText(text)
  const converted = isCyrillic ? toLatin(text) : toCyrillic(text)
  outputEl.value = converted

  // Update labels
  const inputLabel = popover?.querySelector(".wc-panel-input .wc-label")
  const outputLabel = popover?.querySelector(".wc-panel-output .wc-label")
  if (inputLabel) inputLabel.textContent = isCyrillic ? "Кирилл" : "Lotin"
  if (outputLabel) outputLabel.textContent = isCyrillic ? "Lotin" : "Кирилл"
}

function copyOutput(button: HTMLElement) {
  const output = popover?.querySelector(
    '[data-type="output"]'
  ) as HTMLTextAreaElement
  if (!output) return

  navigator.clipboard.writeText(output.value)

  // Success feedback
  button.classList.add("success")
  const originalSvg = button.innerHTML
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`

  setTimeout(() => {
    button.classList.remove("success")
    button.innerHTML = originalSvg
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

  // Trigger reconversion
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

  // Update active button
  popover?.querySelectorAll(".wc-dir-btn").forEach((btn) => {
    const btnEl = btn as HTMLButtonElement
    btn.classList.toggle("active", btnEl.dataset.action === action)
  })

  // Update labels
  const inputLabel = popover?.querySelector(".wc-panel-input .wc-label")
  const outputLabel = popover?.querySelector(".wc-panel-output .wc-label")
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
  const activeElement = document.activeElement as HTMLElement

  // Try to replace in editable elements
  if (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement
  ) {
    const start = activeElement.selectionStart ?? 0
    const end = activeElement.selectionEnd ?? 0
    activeElement.value =
      activeElement.value.slice(0, start) +
      newText +
      activeElement.value.slice(end)
    activeElement.setSelectionRange(
      start + newText.length,
      start + newText.length
    )
    activeElement.dispatchEvent(new Event("input", { bubbles: true }))
  } else if (activeElement.isContentEditable) {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(newText))
      range.collapse(false)
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(newText)
  }

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
function getTriggerStyles(): string {
  return `
    .wc-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4), 0 0 0 1px rgba(255,255,255,0.1);
      animation: wcPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .wc-trigger:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.5), 0 0 0 1px rgba(255,255,255,0.2);
    }
    .wc-trigger:active {
      transform: scale(0.95);
    }
    .wc-trigger svg {
      width: 16px;
      height: 16px;
    }
    @keyframes wcPop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `
}

function getPopoverStyles(): string {
  return `
    .wc-popover {
      position: fixed;
      z-index: 2147483647;
      width: 360px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      animation: wcSlide 0.2s ease;
      overflow: hidden;
    }
    @keyframes wcSlide {
      0% { opacity: 0; transform: translateY(-8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    /* Header */
    .wc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      background: #fafafa;
    }
    .wc-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #0ea5e9;
      font-weight: 600;
      font-size: 13px;
    }
    .wc-logo svg {
      width: 18px;
      height: 18px;
    }
    .wc-close {
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .wc-close:hover {
      background: #f3f4f6;
      color: #374151;
    }
    .wc-close svg {
      width: 16px;
      height: 16px;
    }
    
    /* Panels */
    .wc-panels {
      display: flex;
      flex-direction: column;
    }
    .wc-panel {
      padding: 12px 16px;
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
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .wc-copy {
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .wc-copy:hover {
      background: #f3f4f6;
      color: #0ea5e9;
    }
    .wc-copy.success {
      color: #10b981;
    }
    .wc-copy svg {
      width: 14px;
      height: 14px;
    }
    .wc-textarea {
      width: 100%;
      height: 72px;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: #f9fafb;
      color: #111827;
      font-size: 14px;
      line-height: 1.5;
      resize: none;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .wc-textarea:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    .wc-panel-output .wc-textarea {
      background: #f0f9ff;
      border-color: #bae6fd;
    }
    
    /* Divider */
    .wc-divider {
      display: flex;
      justify-content: center;
      padding: 4px 0;
    }
    .wc-swap {
      width: 32px;
      height: 32px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .wc-swap:hover {
      background: #f3f4f6;
      color: #0ea5e9;
      border-color: #0ea5e9;
    }
    .wc-swap svg {
      width: 16px;
      height: 16px;
    }
    
    /* Footer */
    .wc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid #f3f4f6;
      background: #fafafa;
    }
    .wc-direction {
      display: flex;
      gap: 4px;
    }
    .wc-dir-btn {
      padding: 6px 10px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .wc-dir-btn:hover {
      border-color: #0ea5e9;
      color: #0ea5e9;
    }
    .wc-dir-btn.active {
      background: #0ea5e9;
      border-color: #0ea5e9;
      color: white;
    }
    .wc-replace {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: none;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
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
    
    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .wc-popover {
        background: #1f2937;
        border-color: #374151;
      }
      .wc-header, .wc-footer {
        background: #111827;
        border-color: #374151;
      }
      .wc-close { color: #6b7280; }
      .wc-close:hover { background: #374151; color: #d1d5db; }
      .wc-label { color: #9ca3af; }
      .wc-textarea {
        background: #111827;
        border-color: #374151;
        color: #f9fafb;
      }
      .wc-textarea:focus {
        border-color: #0ea5e9;
      }
      .wc-panel-output .wc-textarea {
        background: #0c2d4a;
        border-color: #0369a1;
      }
      .wc-copy { color: #6b7280; }
      .wc-copy:hover { background: #374151; }
      .wc-swap {
        background: #1f2937;
        border-color: #374151;
        color: #9ca3af;
      }
      .wc-swap:hover {
        background: #374151;
      }
      .wc-dir-btn {
        background: #1f2937;
        border-color: #374151;
        color: #9ca3af;
      }
      .wc-dir-btn:hover {
        border-color: #0ea5e9;
        color: #0ea5e9;
      }
      .wc-dir-btn.active {
        background: #0ea5e9;
        border-color: #0ea5e9;
        color: white;
      }
    }
  `
}
