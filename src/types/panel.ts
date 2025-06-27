// Panel status types
export type PanelStatus =
  | { type: 'ready' }
  | { type: 'processing'; message?: string }
  | { type: 'valid'; message?: string }
  | { type: 'error'; message?: string }
  | { type: 'success'; message?: string }
  | { type: 'recording'; message?: string }
  | { type: 'generated'; message?: string }
  | { type: 'custom'; message: string; color?: string }

// Header configuration
export interface PanelHeaderConfig {
  title: string
  status?: PanelStatus
  showMacOSDots?: boolean
  actions?: React.ReactNode
}

// Panel content configuration
export interface PanelContentConfig {
  type: 'textarea' | 'display' | 'custom'
  content?: string
  placeholder?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  customContent?: React.ReactNode
  emptyState?: {
    icon?: React.ReactNode
    message?: string
    subMessage?: string
  }
  error?: string
  minHeight?: string
  maxHeight?: string
}

// Footer configuration
export interface PanelFooterConfig {
  stats?: Array<{ label: string; value: number | string }>
  additionalInfo?: React.ReactNode
  showStats?: boolean
}

// Individual panel props
export interface PanelProps {
  header: PanelHeaderConfig
  content: PanelContentConfig
  footer?: PanelFooterConfig
  className?: string
}

// Main component props
export interface UniversalDualPanelProps {
  sourcePanel: PanelProps
  targetPanel: PanelProps

  // Swap functionality
  swapConfig?: {
    show: boolean
    onClick?: () => void
    icon?: React.ReactNode
    disabled?: boolean
    position?: 'center' | 'top' | 'bottom'
  }

  // Layout options
  layout?: 'horizontal' | 'vertical'
  gap?: 'sm' | 'md' | 'lg'
  variant?: 'terminal' | 'simple'

  // Grid configuration for responsive
  gridConfig?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }

  className?: string
}
