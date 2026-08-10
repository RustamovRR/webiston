import { convertWithPreference } from "@webiston/transliteration"

export default defineBackground(() => {
  // Extension o'rnatilganda yoki yangilanganda context menu yaratish
  /**
   * ONE menu item, not three.
   *
   * Chrome collapses a single item into the parent row and nests as a submenu
   * the moment there are two — so three entries bought a submenu the reader
   * has to open, hover and read before anything happens. DeepL registers one
   * ("Translate selected text") and that is the whole interaction.
   *
   * The three directions have not gone anywhere; they are buttons inside the
   * panel this opens, where they belong: next to the result they change, with
   * the current one visibly active. In the menu they were three blind guesses.
   */
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.removeAll().then(() => {
      browser.contextMenus.create({
        id: "convert-selection",
        title: "Lotin ↔ Kirill konvertatsiya",
        contexts: ["selection"]
      })
    })
  })

  // Context menu click handler
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "convert-selection") return
    if (!info.selectionText || !tab?.id) return

    // The BACKGROUND no longer converts. It asks the content script to open
    // the panel on the live selection, and the panel does the work — one code
    // path for the badge and the menu, so the two cannot disagree about what
    // a conversion is. The raw text rides along only as a fallback for the
    // case where the selection is gone by the time the message lands.
    try {
      await browser.tabs.sendMessage(tab.id, {
        type: "OPEN_POPOVER",
        text: info.selectionText
      })
    } catch {
      // No content script on this page (chrome:// pages, the web store).
      console.warn("Content script unavailable; panel not opened")
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
})
