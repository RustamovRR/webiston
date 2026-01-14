"use client"

// UI Components
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { CodeHighlight } from "@/components/ui/code-highlight"

// Shared Components
import { ToolHeader } from "@/components/shared/ToolHeader"
import { CopyButton } from "@/components/shared/CopyButton"
import { StatsDisplay } from "@/components/shared/StatsDisplay"

// Utils & Hooks
import { useUserAgentAnalyzer } from "./hooks/useUserAgentAnalyzer"

// Icons
import {
  Monitor,
  Smartphone,
  Download,
  RotateCcw,
  Search,
  User
} from "lucide-react"

export default function UserAgentAnalyzer() {
  const {
    userAgent,
    parsedUA,
    isAnalyzing,
    setUserAgent,
    analyzeUserAgent,
    loadSampleUA,
    loadCurrentUA,
    clearAll,
    downloadAnalysis,
    samples,
    getStats,
    canDownload,
    isEmpty
  } = useUserAgentAnalyzer()

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <ToolHeader
        title="User Agent Analyzer"
        description="Brauzer va qurilma ma'lumotlarini tahlil qiling, User Agent stringlarini dekod qiling"
      />

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          onClick={loadCurrentUA}
          variant="outline"
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
        >
          <User className="mr-2 h-4 w-4" />
          Joriy brauzer
        </Button>
        <Button
          onClick={clearAll}
          variant="outline"
          size="sm"
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Tozalash
        </Button>
        {canDownload && (
          <Button
            onClick={downloadAnalysis}
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Download className="mr-2 h-4 w-4" />
            JSON yuklab olish
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          {/* Terminal Input Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">
                Tool Kirish
              </span>
            </div>

            {/* Input Content */}
            <div className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="User Agent stringini kiriting..."
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  rows={6}
                  className="min-h-[150px] border-zinc-700 bg-zinc-800/50 font-mono text-sm"
                />

                <div className="flex items-center justify-between">
                  <StatsDisplay stats={getStats()} />
                  <ShimmerButton
                    onClick={analyzeUserAgent}
                    disabled={isEmpty || isAnalyzing}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isAnalyzing ? "Tahlil qilinmoqda..." : "Tahlil qilish"}
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>

          {/* Sample User Agents */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <h3 className="text-sm font-medium text-zinc-300">
                Namuna User Agents
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {samples.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleUA(sample)}
                    className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800/50"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-zinc-200">
                        {sample.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {sample.ua.includes("Mobile") && (
                          <Smartphone className="h-3 w-3 text-blue-400" />
                        )}
                        {!sample.ua.includes("Mobile") && (
                          <Monitor className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {sample.description}
                    </p>
                    <div className="mt-2 truncate font-mono text-xs text-zinc-400">
                      {sample.ua.slice(0, 80)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="space-y-6">
          {/* Terminal Output Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">
                Tool Natija/Chiqish
              </span>
              <div className="ml-auto flex items-center gap-2">
                {parsedUA && (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-green-400">
                      Tahlil tayyor
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Analysis Content */}
            <div className="p-6">
              {parsedUA ? (
                <div className="space-y-6">
                  {/* Browser Information */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      <Monitor className="h-4 w-4 text-blue-400" />
                      Brauzer Ma'lumotlari
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">
                          Brauzer nomi
                        </div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.browser.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Versiya</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.browser.version}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">
                          Asosiy versiya
                        </div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.browser.major}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Engine</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.engine.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operating System */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      <Smartphone className="h-4 w-4 text-green-400" />
                      Operatsion Tizim
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">Tizim nomi</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.os.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Versiya</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.os.version}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-zinc-500">
                          CPU Arxitektura
                        </div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.cpu.architecture}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device Information */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      <Monitor className="h-4 w-4 text-purple-400" />
                      Qurilma Ma'lumotlari
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">
                          Qurilma turi
                        </div>
                        <div className="text-sm font-medium text-zinc-200 capitalize">
                          {parsedUA.device.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Brend</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.device.vendor}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-zinc-500">Model</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {parsedUA.device.model}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>
                      User Agent tahlil qilish uchun chap paneldan foydalaning
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Output */}
          {parsedUA && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <h4 className="text-sm font-medium text-zinc-300">
                  JSON Natija
                </h4>
                <CopyButton text={JSON.stringify(parsedUA, null, 2)} />
              </div>
              <div className="p-4">
                <CodeHighlight
                  code={JSON.stringify(parsedUA, null, 2)}
                  language="json"
                  className="max-h-80 overflow-auto"
                />
              </div>
            </div>
          )}

          {/* Original User Agent */}
          {userAgent && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <h4 className="text-sm font-medium text-zinc-300">
                  Asl User Agent
                </h4>
                <CopyButton text={userAgent} />
              </div>
              <div className="p-4">
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <div className="font-mono text-sm break-all text-zinc-300">
                    {userAgent}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info Section */}
      <div className="mt-12 space-y-8">
        <div className="flex flex-col items-center justify-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-100">
            User Agent Analyzer Haqida
          </h2>
          <p className="mx-auto max-w-2xl text-center text-lg text-zinc-400">
            Professional brauzer va qurilma aniqlash vositasi. User Agent
            stringlarini tahlil qilib, brauzer, operatsion tizim va qurilma
            haqida batafsil ma'lumot olish uchun mo'ljallangan.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Browser Detection */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-xl font-semibold text-zinc-100">
              Browser Detection
            </h3>
            <p className="mb-4 text-zinc-400">
              Eng mashhur brauzerlarni aniq tanib olish va versiya
              ma'lumotlarini aniqlash:
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <code className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                  Chrome
                </code>
                <span>Google Chrome va Chromium-based brauzerlar</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-orange-500/20 px-2 py-1 text-orange-300">
                  Firefox
                </code>
                <span>Mozilla Firefox va Gecko engine</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-300">
                  Safari
                </code>
                <span>Apple Safari va WebKit engine</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-green-500/20 px-2 py-1 text-green-300">
                  Edge
                </code>
                <span>Microsoft Edge (Chromium)</span>
              </li>
            </ul>
          </div>

          {/* Operating System Analysis */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-xl font-semibold text-zinc-100">
              OS Detection
            </h3>
            <p className="mb-4 text-zinc-400">
              Operatsion tizimlar va ularning versiyalarini professional
              darajada aniqlash:
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <code className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                  Windows
                </code>
                <span>Windows 7, 8, 10, 11 versiyalari</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-gray-500/20 px-2 py-1 text-gray-300">
                  macOS
                </code>
                <span>macOS versiyalari va Mac hardware</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-300">
                  Linux
                </code>
                <span>Linux distributivlari va versiyalar</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-green-500/20 px-2 py-1 text-green-300">
                  Mobile
                </code>
                <span>iOS va Android platformalar</span>
              </li>
            </ul>
          </div>

          {/* Device & Hardware */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-xl font-semibold text-zinc-100">
              Device Analysis
            </h3>
            <p className="mb-4 text-zinc-400">
              Qurilma turlari va hardware ma'lumotlarini aniqlash:
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <code className="rounded bg-purple-500/20 px-2 py-1 text-purple-300">
                  Desktop
                </code>
                <span>Kompyuter va noutbuk qurilmalari</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-pink-500/20 px-2 py-1 text-pink-300">
                  Mobile
                </code>
                <span>Smartfon va qo'l qurilmalari</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-300">
                  Tablet
                </code>
                <span>Planshet va hybrid qurilmalar</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-red-500/20 px-2 py-1 text-red-300">
                  CPU
                </code>
                <span>Protsessor arxitekturasi (x64, ARM)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Engine Information */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-zinc-100">
            Browser Engine Ma'lumotlari
          </h3>
          <p className="mb-6 text-zinc-400">
            User Agent Analyzer zamonaviy brauzer engine'larini aniq tanib oladi
            va ularning versiyalarini ko'rsatadi:
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-semibold text-zinc-200">
                WebKit Engine
              </h4>
              <p className="mb-2 text-sm text-zinc-400">
                Safari va Chromium-based brauzerlar tomonidan ishlatiladigan
                engine.
              </p>
              <code className="text-xs text-green-300">
                WebKit/605.1.15, AppleWebKit/537.36
              </code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-semibold text-zinc-200">Gecko Engine</h4>
              <p className="mb-2 text-sm text-zinc-400">
                Mozilla Firefox va boshqa Mozilla brauzerlar uchun ishlab
                chiqilgan.
              </p>
              <code className="text-xs text-orange-300">
                Gecko/20100101, rv:109.0
              </code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-semibold text-zinc-200">Blink Engine</h4>
              <p className="mb-2 text-sm text-zinc-400">
                Google Chrome, Microsoft Edge va Opera zamonaviy versiyalari.
              </p>
              <code className="text-xs text-blue-300">
                Chrome/120.0.0.0, Edg/120.0.0.0
              </code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-semibold text-zinc-200">
                Detection Accuracy
              </h4>
              <p className="mb-2 text-sm text-zinc-400">
                Professional regex pattern'lar orqali 95%+ aniqlik bilan tanib
                olish.
              </p>
              <code className="text-xs text-purple-300">
                Real-time parsing, instant results
              </code>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-zinc-100">
            Foydalanish Holatlari
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-zinc-200">
                Web Development
              </h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• Browser compatibility testing</li>
                <li>• Feature detection va polyfill'lar</li>
                <li>• Responsive design optimization</li>
                <li>• Cross-platform debugging</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-zinc-200">
                Analytics & Security
              </h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• Bot detection va filtering</li>
                <li>• User behavior analysis</li>
                <li>• Security threat identification</li>
                <li>• Traffic source validation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final Tips */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
          <h4 className="mb-3 font-semibold text-blue-200">
            Professional Tips
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-blue-100">
                <strong>API Integration:</strong> User Agent parsing
                natijalarini JSON formatda yuklab oling va o'z loyihalaringizda
                ishlatishingiz mumkin.
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-100">
                <strong>Real-time Testing:</strong>{" "}
                <code className="mx-1 rounded bg-blue-500/20 px-1 text-blue-300">
                  navigator.userAgent
                </code>
                orqali joriy brauzer ma'lumotlarini darhol tahlil qiling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
