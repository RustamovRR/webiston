import type { PanelProps, PanelStatus } from '@/types/panel'

// Helper functions for common configurations
export const createTextInputPanel = (
  title: string,
  value: string,
  onChange: (value: string) => void,
  placeholder: string,
  status?: PanelStatus,
  stats?: Array<{ label: string; value: number | string }>,
  actions?: React.ReactNode,
): PanelProps => ({
  header: {
    title,
    status,
    actions,
    showMacOSDots: true,
  },
  content: {
    type: 'textarea',
    content: value,
    onChange,
    placeholder,
  },
  footer: {
    stats,
    showStats: true,
  },
})

export const createDisplayPanel = (
  title: string,
  content: string,
  status?: PanelStatus,
  stats?: Array<{ label: string; value: number | string }>,
  error?: string,
  emptyState?: { icon?: React.ReactNode; message?: string; subMessage?: string },
  additionalInfo?: React.ReactNode,
  actions?: React.ReactNode,
): PanelProps => ({
  header: {
    title,
    status,
    actions,
    showMacOSDots: true,
  },
  content: {
    type: 'display',
    content,
    error,
    emptyState,
  },
  footer: {
    stats,
    additionalInfo,
    showStats: true,
  },
})

export const createCustomPanel = (
  title: string,
  customContent: React.ReactNode,
  status?: PanelStatus,
  stats?: Array<{ label: string; value: number | string }>,
  actions?: React.ReactNode,
): PanelProps => ({
  header: {
    title,
    status,
    actions,
    showMacOSDots: true,
  },
  content: {
    type: 'custom',
    customContent,
  },
  footer: {
    stats,
    showStats: true,
  },
})
