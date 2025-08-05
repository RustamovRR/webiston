import React from 'react'
import { useTranslations } from 'next-intl'
import { TerminalInput, type TerminalInputAction } from '@/components/shared/TerminalInput'

interface InputPanelProps {
  inputText: string
  setInputText: (text: string) => void
  isProcessing: boolean
  handleClear: () => void
  inputStats: {
    characters: number
    words: number
    lines: number
  }
  partsCount: number
}

const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  isProcessing,
  handleClear,
  inputStats,
  partsCount,
}) => {
  const t = useTranslations('JwtDecoderPage.InputPanel')

  const actions: TerminalInputAction[] = [
    {
      type: 'clear',
      onClick: handleClear,
      tooltip: t('clear') || 'Clear',
    },
  ]

  const stats = [
    { label: t('characters'), value: inputStats.characters },
    { label: t('parts'), value: partsCount },
    { label: t('lines'), value: inputStats.lines },
  ]

  return (
    <div className="mb-6">
      <TerminalInput
        title={t('title')}
        value={inputText}
        onChange={setInputText}
        placeholder={t('placeholder')}
        actions={actions}
        showStats={true}
        stats={stats}
        statsPosition="header"
        disabled={isProcessing}
        loading={isProcessing}
        minHeight="120px"
        showShadow={false}
        animate={false}
        className="hover:scale-100"
      />
    </div>
  )
}

export default InputPanel
