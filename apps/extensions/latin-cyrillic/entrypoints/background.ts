import { isCyrillicText, toCyrillic, toLatin } from "@webiston/transliteration"

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

    switch (info.menuItemId) {
      case "convert-selection":
        result = isCyrillicText(text) ? toLatin(text) : toCyrillic(text)
        break
      case "convert-to-cyrillic":
        result = toCyrillic(text)
        break
      case "convert-to-latin":
        result = toLatin(text)
        break
      default:
        return
    }

    // Content script'ga natijani yuborish
    try {
      await browser.tabs.sendMessage(tab.id, {
        type: "REPLACE_SELECTION",
        text: result
      })
    } catch {
      // Content script yuklanmagan bo'lsa, clipboard'ga nusxalash
      console.log("Content script not ready, copying to clipboard")
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
