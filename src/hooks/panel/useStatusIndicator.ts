import type { PanelStatus } from '@/types/panel'

export const useStatusIndicator = () => {
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'ready':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500 animate-pulse'
      case 'valid':
        return 'bg-green-400'
      case 'error':
        return 'bg-red-500'
      case 'success':
        return 'bg-green-500'
      case 'recording':
        return 'bg-red-500 animate-pulse'
      case 'generated':
        return 'bg-green-500'
      default:
        return 'bg-zinc-500'
    }
  }

  const getMessage = (status: PanelStatus) => {
    if (status.type === 'custom') return status.message
    if ('message' in status && status.message) return status.message

    switch (status.type) {
      case 'ready':
        return 'Ready'
      case 'processing':
        return 'Ishlanmoqda...'
      case 'valid':
        return 'Tayyor'
      case 'error':
        return 'Xatolik'
      case 'success':
        return 'Muvaffaqiyatli'
      case 'recording':
        return 'REC'
      case 'generated':
        return 'Generated'
      default:
        return ''
    }
  }

  return {
    getStatusColor,
    getMessage,
  }
}
