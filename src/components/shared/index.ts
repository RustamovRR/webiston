// App-specific shared components

// Re-export pure composites from @webiston/ui for convenience
export {
  BaseModal,
  BaseModalBody,
  BaseModalDescription,
  BaseModalFooter,
  BaseModalHeader,
  BaseModalTitle,
  CopyButton,
  InfoCard,
  StatsDisplay
} from "@webiston/ui"
export { default as ButtonLink } from "./ButtonLink"
export { DualTextPanel } from "./DualTextPanel"
export { default as Footer } from "./Footer"
export { Header } from "./Header"
export { default as Search } from "./Search"
export { default as SectionTitle } from "./SectionTitle"
export { default as SimpleCard } from "./SimpleCard"
export {
  TerminalInput,
  type TerminalInputAction,
  type TerminalInputProps
} from "./TerminalInput"
export { default as ThemeToggle } from "./ThemeToggle"
export { ToolHeader } from "./ToolHeader"
export { OutputPanel, TextInputPanel, ToolPanel } from "./ToolPanel"
