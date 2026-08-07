import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "wxt"

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()]
  }),
  manifest: {
    // The web tool's own name (`/tools/latin-cyrillic` renders exactly this as
    // its H1), so the toolbar entry, the context menu and the page a user
    // arrives from all say one thing. It was "Latin Converter - Webiston".
    name: "Lotin-Kirill O'giruvchi — Webiston",
    description:
      "O'zbek matnini lotinchadan kirillchaga va aksincha o'giring. Matn brauzeringizdan chiqmaydi.",
    permissions: ["activeTab", "contextMenus", "storage", "clipboardWrite"],
    host_permissions: ["<all_urls>"],
    commands: {
      "convert-selection": {
        suggested_key: {
          default: "Ctrl+Shift+L",
          mac: "Command+Shift+L"
        },
        description: "Tanlangan matnni konvertatsiya qilish"
      }
    }
  }
})
