export { UniversalDualPanel } from './UniversalDualPanel'
export { Panel } from './Panel'
export { StatusIndicator } from './StatusIndicator'

// Re-export types from the types folder
export type { PanelStatus, PanelProps, UniversalDualPanelProps } from '@/types/panel'

// Re-export utility functions from lib folder
export { createTextInputPanel, createDisplayPanel, createCustomPanel } from '@/lib/panel-utils'
