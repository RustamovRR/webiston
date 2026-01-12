import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "wxt"

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()]
  }),
  manifest: {
    name: "Latin Converter - Webiston",
    description:
      "O'zbek lotin-kirill konverteri. Matnni tez va oson o'zgartiring.",
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
