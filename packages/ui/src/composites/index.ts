// Pure composite components (built from primitives, no app-specific dependencies)
export {
  BaseModal,
  BaseModalBody,
  BaseModalDescription,
  BaseModalFooter,
  BaseModalHeader,
  BaseModalTitle
} from "./BaseModal"
export { CopyButton } from "./CopyButton"
// `DatePicker` and `Calendar` are deliberately NOT re-exported here.
//
// They pull in `react-day-picker` (~313 kB of chunk), and this barrel is
// reachable from `@webiston/ui`, so exporting them put the calendar on EVERY
// tool page — measured in the build manifest, base64-converter and device-info
// among them. Import the deep path instead:
//
//   import { DatePicker } from "@webiston/ui/composites/DatePicker"
export type { FaqAccordionProps, FaqEntry } from "./FaqAccordion"
export { FaqAccordion } from "./FaqAccordion"
export { default as InfoCard } from "./InfoCard"
export type { ProgressBarProps } from "./ProgressBar"
export { ProgressBar } from "./ProgressBar"
export type { SegmentedOption } from "./SegmentedControl"
export { SegmentedControl } from "./SegmentedControl"
export { StatsDisplay } from "./StatsDisplay"
