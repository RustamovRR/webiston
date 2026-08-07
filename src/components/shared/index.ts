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
export type { DetailListRow } from "./DetailList"
export { DetailList } from "./DetailList"
export { DropZone } from "./DropZone"
export { DualTextPanel } from "./DualTextPanel"
export type { FaqItem } from "./Faq"
export { Faq } from "./Faq"
export { default as Footer } from "./Footer"
export { Header } from "./Header"
export type {
  HeroPaletteGroup,
  HeroPaletteRow
} from "./HeroPalette/HeroPalette"
export { HeroPalette } from "./HeroPalette/HeroPalette"
export type {
  BookSectionChapter,
  ToolCardData
} from "./HomeSections/HomeSections"
export {
  BookSection,
  SectionDivider,
  ToolsSection
} from "./HomeSections/HomeSections"
export { DeviceSelect, MediaAccessPanel } from "./MediaAccessPanel"
export { default as Search } from "./Search"
export { default as SectionTitle } from "./SectionTitle"
export { default as SimpleCard } from "./SimpleCard"
export {
  TerminalInput,
  type TerminalInputAction,
  type TerminalInputProps
} from "./TerminalInput"
export { default as ThemeToggle } from "./ThemeToggle"
export { ToolCard } from "./ToolCard"
export { ToolHeader } from "./ToolHeader"
export { OutputPanel, TextInputPanel, ToolPanel } from "./ToolPanel"
