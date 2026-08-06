// Client components only. The two Server Components in this folder
// (`LoremFaq`, `LoremReference`) are exported from the module root instead, so
// importing this barrel can never pull `next-intl/server` into a client bundle.
export { ControlBar } from "./ControlBar"
export { LoremOutput } from "./LoremOutput"
