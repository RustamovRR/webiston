import { convertWithPreference } from "@webiston/transliteration"

export default defineBackground(() => {
  // Extension o'rnatilganda yoki yangilanganda context menu yaratish
  browser.runtime.onInstalled.addListener(() => {
    // Avval mavjud menu'larni o'chirish
    browser.contextMenus.removeAll().then(() => {
      // Context menu yaratish
      browser.contextMenus.create({
        id: "convert-selection",
        title: "Lotin ↔ Kirill konvertatsiya",
        contexts: ["selection"]
      })

      browser.contextMenus.create({
        id: "convert-to-cyrillic",
        title: "→ Кирилл",
        contexts: ["selection"]
      })

      browser.contextMenus.create({
        id: "convert-to-latin",
        title: "→ Lotin",
        contexts: ["selection"]
      })
    })
  })

  // Context menu click handler
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText || !tab?.id) return

    const text = info.selectionText
    let result: string

    // One policy, shared with the popup, the in-page popover and the web tool.
    switch (info.menuItemId) {
      case "convert-selection":
        result = convertWithPreference(text, "auto").text
        break
      case "convert-to-cyrillic":
        result = convertWithPreference(text, "latin-to-cyrillic").text
        break
      case "convert-to-latin":
        result = convertWithPreference(text, "cyrillic-to-latin").text
        break
      default:
        return
    }

    // The content script writes the result into the selection when it can and
    // falls back to the clipboard when it cannot. This listener existed on
    // the sending side only — content.ts handled CONVERT_SELECTION and
    // nothing else, so every context-menu click was a no-op.
    try {
      await browser.tabs.sendMessage(tab.id, {
        type: "REPLACE_SELECTION",
        text: result
      })
    } catch {
      // No content script on this page (chrome:// pages, the web store).
      console.warn("Content script unavailable; conversion not delivered")
    }
  })

  // Keyboard shortcut handler
  browser.commands.onCommand.addListener(async (command) => {
    if (command === "convert-selection") {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab?.id) return

      try {
        await browser.tabs.sendMessage(tab.id, {
          type: "CONVERT_SELECTION"
        })
      } catch {
        console.log("Content script not ready")
      }
    }
  })

  console.log("Latin Converter background script loaded")
})
