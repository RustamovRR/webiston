import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "wxt"

/**
 * Chromium only — and that is a capability limit, not a choice.
 *
 * A full-page capture that is actually correct needs the browser to RENDER the
 * whole document once, which is `Page.captureScreenshot` over the DevTools
 * protocol. In an extension that protocol is only reachable through
 * `chrome.debugger`, and Firefox has no equivalent API. The alternative —
 * scroll, snapshot the viewport, repeat, stitch — is what the extensions this
 * one exists to replace already do, and it is exactly why they leave blank
 * bands where lazy-loaded images never arrived.
 *
 * Firefox users are not stranded: Firefox ships this natively (right-click →
 * Take Screenshot → Save full page), so there is nothing here worth a worse
 * implementation. The listing says so rather than leaving people guessing.
 */
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()]
  }),
  manifest: {
    default_locale: "uz",
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    /**
     * Four permissions, and no `host_permissions` at all.
     *
     * `debugger` is the one a reviewer will stop on, so the rest are kept as
     * small as they can be. In particular `activeTab` — granted only for the
     * tab the user just clicked on — replaces the `<all_urls>` grant that a
     * content script would have forced, and `chrome.debugger` needs no host
     * permission of its own.
     *
     * There is deliberately no `downloads` and no `storage`. The viewer is an
     * extension page, so it can hand over a blob with an `<a download>` on its
     * own, and the capture is always PNG — lossless — with JPEG derived in the
     * viewer, so there is no format preference to persist. `scripting` is here
     * for one thing: a one-shot error toast on the tab the user just clicked,
     * again under `activeTab`, so it reaches nothing else.
     */
    permissions: ["activeTab", "debugger", "scripting"],
    action: { default_title: "__MSG_actionTitle__" },
    commands: {
      "capture-full-page": {
        suggested_key: { default: "Ctrl+Shift+S", mac: "Command+Shift+S" },
        description: "__MSG_cmdCapture__"
      }
    }
  }
})
