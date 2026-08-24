import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App"
import "./style.css"

/**
 * The viewer follows the BROWSER's colour scheme, not a stored preference.
 *
 * It is a tab that opens for a few seconds to hand over a file; asking it to
 * remember a theme would be a setting nobody wants to manage. `.dark` is what
 * the token file keys off, so it is applied once here.
 */
if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.classList.add("dark")
}

const root = document.getElementById("root")
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
