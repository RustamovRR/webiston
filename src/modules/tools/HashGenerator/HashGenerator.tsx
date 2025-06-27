'use client'

import { useState } from 'react'
import { Download, Upload, Hash, FileText, X, ChevronDown, Zap, Shield } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import { ToolHeader, UniversalDualPanel } from '@/components/shared'

// Local Components
import { HashInputPanel, HashResultsPanel } from './components'

// Utils & Hooks
import { useHashGenerator } from '@/hooks/tools/useHashGenerator'

const HashGenerator = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const {
    inputText,
    setInputText,
    isGenerating,
    hashResults: hashes,
    availableAlgorithms,
    selectedAlgorithms,
    toggleAlgorithm: onAlgorithmToggle,
    sampleTexts: samples,
    handleClear,
    downloadHashes,
    handleFileUpload,
    inputStats,
    outputStats,
  } = useHashGenerator()

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const tabOptions = [
    { value: 'text', label: 'Matn Hash', icon: <FileText size={16} /> },
    { value: 'file', label: 'Fayl Hash', icon: <Upload size={16} /> },
  ]

  const loadSample = (sampleValue: string) => {
    setInputText(sampleValue)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Hash Generator"
        description="MD5, SHA256, SHA512 va boshqa kriptografik hash algoritmlar bilan ma'lumotlarni hash qilish"
      />

      {/* Boshqaruv paneli */}
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Gradient Tabs for Mode Selection */}
            <GradientTabs
              value={activeTab}
              options={tabOptions}
              onChange={(tab) => setActiveTab(tab as 'text' | 'file')}
              toolCategory="utilities"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* File Upload */}
            <input
              type="file"
              accept=".txt,.json,.csv,.md,.xml,.log"
              onChange={handleFileUploadChange}
              className="hidden"
              id="file-upload"
              disabled={isGenerating}
            />
            <Button variant="outline" size="sm" asChild disabled={isGenerating}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Fayl yuklash
              </label>
            </Button>

            {/* Sample Data Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" />
                  Namuna matnlar
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {samples.map((sample, index) => (
                  <DropdownMenuItem key={index} onClick={() => loadSample(sample.value)}>
                    {sample.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X size={16} className="mr-2" />
              Tozalash
            </Button>

            {/* Download */}
            <ShimmerButton
              onClick={downloadHashes}
              disabled={hashes.length === 0 || isGenerating}
              variant={hashes.length > 0 ? 'default' : 'outline'}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              Yuklab olish
            </ShimmerButton>
          </div>
        </div>
      </div>

      {/* Hash Algorithms Selection */}
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Hash Algoritmlari:</h3>
        <div className="flex flex-wrap gap-2">
          {availableAlgorithms.map((algorithm) => (
            <Button
              key={algorithm}
              onClick={() => onAlgorithmToggle(algorithm)}
              variant={selectedAlgorithms.includes(algorithm) ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Shield size={14} />
              {algorithm}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Bir nechta algoritmni tanlash mumkin. Har biri uchun alohida hash yaratiladi.
        </p>
      </div>

      <UniversalDualPanel
        sourcePanel={HashInputPanel({
          activeTab,
          inputText,
          setInputText,
          isGenerating,
          inputStats,
          handleFileUploadChange,
        })}
        targetPanel={HashResultsPanel({
          hashes,
          outputStats,
        })}
        variant="terminal"
      />

      {/* Yordam va ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Hash size={20} className="text-indigo-400" />
          Hash algoritmlar haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              MD5
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• 128-bit hash algorithm</li>
              <li>• Tez va oddiy</li>
              <li>• Fayl tekshirish uchun</li>
              <li>• Kriptografik xavfsizlik past</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              SHA-256
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• 256-bit xavfsiz hash</li>
              <li>• Bitcoin da ishlatiladi</li>
              <li>• NIST standart</li>
              <li>• Yuqori xavfsizlik</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              SHA-512
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• 512-bit maximum xavfsizlik</li>
              <li>• Katta fayllar uchun</li>
              <li>• Professional dasturlar</li>
              <li>• Eng yuqori himoya</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HashGenerator
