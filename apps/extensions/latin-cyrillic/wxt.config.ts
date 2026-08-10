import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "wxt"

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()]
  }),
  /**
   * A FUNCTION, so the Firefox-only block is emitted for Firefox only.
   *
   * Chrome and Edge ignore `browser_specific_settings` at runtime, but there
   * is no reason to ship a Gecko add-on ID to a Chromium store listing and
   * invite a validator question about a key that means nothing there. WXT
   * calls this once per target.
   */
  manifest: ({ browser }) => ({
    // The web tool's own name (`/tools/latin-cyrillic` renders exactly this as
    // its H1), so the toolbar entry, the context menu and the page a user
    // arrives from all say one thing. It was "Latin Converter - Webiston".
    //
    // NOTE: the toolbar TOOLTIP is not this — WXT derives `default_title`
    // from the popup's `<title>`, which is why the rename had to happen in
    // `entrypoints/popup/index.html` as well and why the old name survived
    // there for a while after everything else had moved.
    /**
     * `__MSG_*__` placeholders, resolved from `public/_locales/<lang>/`.
     *
     * This is the half of i18n that matters most and the reason we use
     * Chrome's NATIVE mechanism rather than the site's next-intl: the store
     * resolves these against the VIEWER's browser language, so the listing
     * title and description are translated too. Someone searching the Chrome
     * Web Store for "конвертер кириллицы" cannot find a listing written
     * entirely in Latin Uzbek — and the listing is the whole funnel.
     *
     * `default_locale` is what a viewer with an unsupported language sees.
     */
    default_locale: "uz",
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    permissions: ["activeTab", "contextMenus", "storage", "clipboardWrite"],
    host_permissions: ["<all_urls>"],
    commands: {
      "convert-selection": {
        suggested_key: {
          default: "Ctrl+Shift+L",
          mac: "Command+Shift+L"
        },
        description: "__MSG_cmdConvert__"
      }
    },
    /**
     * Firefox only.
     *
     * `id` is REQUIRED for a Manifest V3 Firefox add-on and recommended for
     * MV2 — without it `wxt build -b firefox` warns and addons.mozilla.org
     * has nothing stable to key updates to. The e-mail form is the documented
     * convention and does not have to be a real mailbox.
     *
     * `data_collection_permissions` is required for NEW add-ons submitted
     * from 2025-11-03. `none` is not a shortcut, it is the truth: the
     * conversion is pure TypeScript with no network call, and `storage` holds
     * a theme preference and one boolean. Declaring it is what lets Firefox
     * show "collects no data" on the listing — the same claim the Chrome
     * listing makes, stated where Firefox reads it.
     */
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "latin-cyrillic@webiston.uz",
          strict_min_version: "115.0",
          data_collection_permissions: { required: ["none"] }
        }
      }
    })
  })
})
