'use client'

import {
  Download,
  Upload,
  Key,
  Clock,
  Shield,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Info,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { GradientTabs, CodeHighlight } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

// Utils & Hooks
import { useJwtDecoder } from '@/hooks/tools/useJwtDecoder'

const JwtDecoder = () => {
  const {
    inputText,
    setInputText,
    viewMode,
    setViewMode,
    showSignature,
    isProcessing,
    result,
    tokenInfo,
    handleFileUpload,
    handleDownloadHeader,
    handleDownloadPayload,
    loadSampleText,
    handleClear,
    handleToggleSignature,
    formatJSON,
    inputStats,
    partsCount,
    samples,
  } = useJwtDecoder()

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event)
    // Reset input
    event.target.value = ''
  }

  const viewModeOptions = [
    { value: 'decoded', label: 'Dekodlangan', icon: <Eye size={16} /> },
    { value: 'raw', label: "Xom ma'lumot", icon: <EyeOff size={16} /> },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="JWT Token Dekoder"
        description="JSON Web Token larni dekodlash va tahlil qilish uchun professional vosita"
      />

      {/* Control Panel */}
      <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/80 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Tabs */}
            <GradientTabs
              options={viewModeOptions}
              value={viewMode}
              onChange={(value) => setViewMode(value as 'decoded' | 'raw')}
              toolCategory="converters"
            />

            {/* Sample Data Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700">
                  <FileText size={16} className="mr-2" />
                  Namuna JWT
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {samples.map((sample) => (
                  <DropdownMenuItem key={sample.key} onClick={() => loadSampleText(sample.value)}>
                    {sample.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* File Upload */}
            <div>
              <input
                type="file"
                accept=".txt,.json"
                onChange={handleFileUploadWrapper}
                className="hidden"
                id="jwt-file-upload"
                disabled={isProcessing}
              />
              <Button variant="outline" size="sm" asChild className="bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700">
                <label htmlFor="jwt-file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  {isProcessing ? 'Yuklanmoqda...' : 'Fayl yuklash'}
                </label>
              </Button>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {result && (
              <div className="flex items-center gap-2">
                {result.isValid ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle size={16} />
                    <span className="text-sm">Yaroqli JWT</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={16} />
                    <span className="text-sm">Yaroqsiz JWT</span>
                  </div>
                )}
              </div>
            )}

            {result?.isValid && (
              <Button
                onClick={handleToggleSignature}
                variant="outline"
                size="sm"
                className={
                  showSignature
                    ? 'border-indigo-500/30 bg-indigo-500/20 text-indigo-300'
                    : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700'
                }
              >
                <Key size={16} className="mr-2" />
                {showSignature ? 'Signature yashirish' : "Signature ko'rsatish"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mb-6 rounded-lg border border-blue-600/20 bg-blue-900/10 p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 flex-shrink-0 text-blue-400" />
          <div>
            <h4 className="mb-2 font-medium text-blue-300">Ko'rish rejimlari:</h4>
            <div className="space-y-1 text-sm text-blue-200/90">
              <p>
                <strong>Dekodlangan:</strong> JWT ning header va payload qismlarini JSON formatda ko'rsatadi
              </p>
              <p>
                <strong>Xom ma'lumot:</strong> JWT ning asl Base64 formatidagi kodlangan ma'lumotlarini ko'rsatadi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <h3 className="font-medium text-zinc-300">Tool Kirish</h3>
          </div>
          <div className="flex items-center gap-2">
            <StatsDisplay
              stats={[
                { label: 'belgi', value: inputStats.characters },
                { label: 'qism', value: partsCount },
                { label: 'qator', value: inputStats.lines },
              ]}
            />
            {inputText && (
              <button
                onClick={handleClear}
                className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                aria-label="Tozalash"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="JWT tokenni bu yerga kiriting... (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            className="min-h-[120px] resize-none border-0 bg-transparent font-mono text-sm text-zinc-100 placeholder-zinc-500 focus-visible:ring-0"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Error Display */}
      {result?.error && (
        <div className="mb-6 rounded-lg border border-red-600/20 bg-red-900/20 p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            <span className="font-semibold">Xatolik</span>
          </div>
          <p className="mt-2 text-sm text-red-300">{result.error}</p>
        </div>
      )}

      {/* Token Status Cards */}
      {tokenInfo && result?.isValid && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div
            className={`rounded-lg border p-4 ${tokenInfo.isExpired ? 'border-red-600/20 bg-red-900/20' : 'border-green-600/20 bg-green-900/20'}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <Clock size={16} />
              <span className="font-medium">Muddat</span>
            </div>
            <p className={`text-sm ${tokenInfo.isExpired ? 'text-red-300' : 'text-green-300'}`}>
              {tokenInfo.isExpired ? 'Muddati tugagan' : 'Hali amal qiladi'}
            </p>
            {tokenInfo.expiresAt && (
              <p className="mt-1 text-xs text-zinc-400">{tokenInfo.expiresAt.toLocaleString()}</p>
            )}
          </div>

          <div className="rounded-lg border border-blue-600/20 bg-blue-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield size={16} />
              <span className="font-medium">Algoritm</span>
            </div>
            <p className="text-sm text-blue-300">{tokenInfo.algorithm || "Noma'lum"}</p>
            <p className="mt-1 text-xs text-zinc-400">Type: {tokenInfo.tokenType || 'JWT'}</p>
          </div>

          <div className="rounded-lg border border-yellow-600/20 bg-yellow-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Key size={16} />
              <span className="font-medium">Berilgan</span>
            </div>
            {tokenInfo.issuedAt ? (
              <p className="text-sm text-yellow-300">{tokenInfo.issuedAt.toLocaleString()}</p>
            ) : (
              <p className="text-sm text-zinc-400">Ma'lumot yo'q</p>
            )}
          </div>
        </div>
      )}

      {/* Output Panels */}
      {result?.isValid && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Header Panel */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-700 p-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <h3 className="font-medium text-zinc-300">Header</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadHeader}
                  className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Download Header"
                >
                  <Download size={18} />
                </button>
                <CopyButton text={formatJSON(result.header)} disabled={false} />
              </div>
            </div>
            <div className="relative min-h-[200px]">
              <div className="p-4">
                {viewMode === 'decoded' ? (
                  <CodeHighlight code={formatJSON(result.header)} language="json" showLineNumbers={false} />
                ) : (
                  <div>
                    <div className="mb-3 text-xs font-medium text-zinc-500">Base64 formatidagi xom ma'lumot:</div>
                    <pre className="rounded bg-zinc-900/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">
                      {inputText.split('.')[0]}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payload Panel */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-700 p-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <h3 className="font-medium text-zinc-300">Payload</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPayload}
                  className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Download Payload"
                >
                  <Download size={18} />
                </button>
                <CopyButton text={formatJSON(result.payload)} disabled={false} />
              </div>
            </div>
            <div className="relative min-h-[200px]">
              <div className="p-4">
                {viewMode === 'decoded' ? (
                  <CodeHighlight code={formatJSON(result.payload)} language="json" showLineNumbers={false} />
                ) : (
                  <div>
                    <div className="mb-3 text-xs font-medium text-zinc-500">Base64 formatidagi xom ma'lumot:</div>
                    <pre className="rounded bg-zinc-900/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">
                      {inputText.split('.')[1]}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Panel */}
      {showSignature && result?.isValid && (
        <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-700 p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <h3 className="font-medium text-zinc-300">Signature (Imzo)</h3>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={result.signature} disabled={false} />
            </div>
          </div>
          <div className="relative min-h-[120px]">
            <div className="p-4">
              <div className="mb-3 text-xs font-medium text-zinc-500">JWT tokenning xavfsizlik imzosi:</div>
              <pre className="rounded bg-zinc-900/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">
                {result.signature}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Signature Info */}
      {result?.isValid && (
        <div className="mt-6 rounded-lg border border-yellow-600/20 bg-yellow-900/10 p-4">
          <div className="flex items-start gap-3">
            <Key size={20} className="mt-0.5 flex-shrink-0 text-yellow-400" />
            <div>
              <h4 className="mb-2 font-medium text-yellow-300">Signature (Imzo) nima?</h4>
              <div className="space-y-1 text-sm text-yellow-200/90">
                <p>
                  <strong>Signature</strong> - JWT tokenning uchinchi qismi bo'lib, tokenning haqiqiyligini tasdiqlaydi.
                </p>
                <p>
                  Bu qism server tomonidan maxfiy kalit bilan yaratiladi va tokenning o'zgartirilmaganligini
                  kafolatlaydi.
                </p>
                <p>Signatureni ko'rsatish/yashirish tugmasi orqali ushbu maxfiy ma'lumotni boshqarishingiz mumkin.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-8 rounded-lg border border-zinc-700 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Shield size={20} className="text-indigo-400" />
          JWT haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              JWT nima?
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• JSON Web Token - ma'lumotlarni xavfsiz uzatish uchun</li>
              <li>• 3 qismdan iborat: Header.Payload.Signature</li>
              <li>• Base64 formatida kodlangan</li>
              <li>• Digitally signed bo'lishi mumkin</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Standart fieldlar
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>
                • <code className="text-zinc-300">iss</code> - Issuer (kim bergan)
              </li>
              <li>
                • <code className="text-zinc-300">sub</code> - Subject (nima haqida)
              </li>
              <li>
                • <code className="text-zinc-300">exp</code> - Expiration time
              </li>
              <li>
                • <code className="text-zinc-300">iat</code> - Issued at time
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Xavfsizlik
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Signature orqali ma'lumot tekshiriladi</li>
              <li>• Expiration time ni doim tekshiring</li>
              <li>• Secret key ni maxfiy saqlang</li>
              <li>• HTTPS da uzating</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JwtDecoder
