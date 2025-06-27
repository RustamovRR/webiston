'use client'

import React from 'react'
import { motion } from 'framer-motion'

// UI Components
import { ShimmerButton } from '@/components/ui/shimmer-button'

// Shared Components
import { ToolHeader } from '@/components/shared'
import { StatsDisplay } from '@/components/shared'

// Utils & Hooks
import { useScreenResolution } from '@/hooks/tools'

export default function ScreenResolution() {
  const {
    screenInfo,
    isLoading,
    isFullscreen,
    refreshInfo,
    toggleFullscreen,
    loadSampleData,
    downloadScreenInfo,
    getScreenAnalysis,
    getResolutionCategories,
    getDeviceTypes,
    getStats,
  } = useScreenResolution()

  const analysis = screenInfo ? getScreenAnalysis() : null
  const stats = screenInfo ? getStats() : []

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <ToolHeader
        title="Ekran O'lchami"
        description="Real vaqtda ekran o'lchami, rezolutsiya va displey ma'lumotlarini ko'ring"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tool Kirish */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-300">Tool Kirish</span>
              <div className="ml-auto flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${!isLoading ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs text-zinc-400">{!isLoading ? 'Tayyor' : 'Yuklanmoqda...'}</span>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Boshqaruv tugmalari */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-200">Boshqaruv paneli</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ShimmerButton onClick={refreshInfo} disabled={isLoading} className="w-full">
                    Ma'lumotlarni yangilash
                  </ShimmerButton>
                  <ShimmerButton onClick={toggleFullscreen} disabled={isLoading} className="w-full" variant="secondary">
                    {isFullscreen ? 'Fullscreen dan chiqish' : 'Fullscreen rejimi'}
                  </ShimmerButton>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ShimmerButton onClick={loadSampleData} className="w-full" variant="outline">
                    Demo ma'lumotlar
                  </ShimmerButton>
                  <ShimmerButton
                    onClick={downloadScreenInfo}
                    disabled={!screenInfo}
                    className="w-full"
                    variant="outline"
                  >
                    Ma'lumotlarni yuklab olish
                  </ShimmerButton>
                </div>
              </div>

              {/* Statistika */}
              {stats.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-zinc-300">Asosiy ko'rsatkichlar</h4>
                  <StatsDisplay stats={stats} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tool Natija/Chiqish */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-300">Tool Natija/Chiqish</span>
              <div className="ml-auto flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${screenInfo ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                <span className="text-xs text-zinc-400">{screenInfo ? "Ma'lumot mavjud" : "Ma'lumot yo'q"}</span>
              </div>
            </div>

            <div className="p-6">
              {!screenInfo ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-lg bg-zinc-800/50 p-4">
                    <svg className="h-12 w-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-zinc-300">Ma'lumot kutilmoqda</h3>
                  <p className="mb-4 text-sm text-zinc-500">
                    Ekran ma'lumotlarini olish uchun yuqoridagi tugmalardan birini bosing
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Asosiy ma'lumotlar */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-zinc-200">Ekran ma'lumotlari</h3>

                    {/* Ekran o'lchami */}
                    <div className="rounded-lg bg-zinc-800/30 p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">
                            {screenInfo.width} × {screenInfo.height}
                          </div>
                          <div className="text-sm text-zinc-400">Ekran o'lchami</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">{analysis?.resolutionCategory}</div>
                          <div className="text-sm text-zinc-400">Resolution turi</div>
                        </div>
                      </div>
                    </div>

                    {/* Viewport ma'lumotlari */}
                    <div className="rounded-lg bg-zinc-800/30 p-4">
                      <h4 className="mb-3 text-sm font-medium text-zinc-300">Viewport ma'lumotlari</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-purple-400">
                            {screenInfo.innerWidth} × {screenInfo.innerHeight}
                          </div>
                          <div className="text-xs text-zinc-500">Ichki o'lchami</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-orange-400">
                            {screenInfo.outerWidth} × {screenInfo.outerHeight}
                          </div>
                          <div className="text-xs text-zinc-500">Tashqi o'lchami</div>
                        </div>
                      </div>
                    </div>

                    {/* Qo'shimcha ma'lumotlar */}
                    <div className="rounded-lg bg-zinc-800/30 p-4">
                      <h4 className="mb-3 text-sm font-medium text-zinc-300">Texnik ma'lumotlar</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Pixel nisbati:</span>
                          <span className="text-zinc-200">{screenInfo.pixelRatio}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Aspect ratio:</span>
                          <span className="text-zinc-200">{analysis?.aspectRatio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Yo'nalish:</span>
                          <span className="text-zinc-200">{screenInfo.orientation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Rang chuqurligi:</span>
                          <span className="text-zinc-200">{screenInfo.colorDepth} bit</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Qurilma turi:</span>
                          <span className="text-zinc-200">{analysis?.deviceType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Retina displey:</span>
                          <span className="text-zinc-200">{analysis?.isRetina ? 'Ha' : "Yo'q"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Scroll pozitsiyasi */}
                    {(screenInfo.scrollX > 0 || screenInfo.scrollY > 0) && (
                      <div className="rounded-lg bg-zinc-800/30 p-4">
                        <h4 className="mb-3 text-sm font-medium text-zinc-300">Scroll pozitsiyasi</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-cyan-400">{screenInfo.scrollX}px</div>
                            <div className="text-xs text-zinc-500">Gorizontal scroll</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-pink-400">{screenInfo.scrollY}px</div>
                            <div className="text-xs text-zinc-500">Vertikal scroll</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Qo'shimcha ma'lumotlar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Resolution turlari */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-200">Resolution turlari</h3>
          <div className="space-y-3">
            {getResolutionCategories().map((category, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                  analysis?.resolutionCategory === category.name
                    ? 'border border-blue-500/30 bg-blue-500/20'
                    : 'bg-zinc-800/30'
                }`}
              >
                <div>
                  <div className="font-medium text-zinc-300">{category.name}</div>
                  <div className="text-xs text-zinc-500">{category.resolution}</div>
                </div>
                {analysis?.resolutionCategory === category.name && (
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Qurilma turlari */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-200">Qurilma turlari</h3>
          <div className="space-y-3">
            {getDeviceTypes().map((device, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                  analysis?.deviceType === device.name ? 'border border-green-500/30 bg-green-500/20' : 'bg-zinc-800/30'
                }`}
              >
                <div>
                  <div className="font-medium text-zinc-300">{device.name}</div>
                  <div className="text-xs text-zinc-500">{device.range}</div>
                </div>
                {analysis?.deviceType === device.name && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Fullscreen rejimi */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-200">Rejim ma'lumotlari</h3>
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between rounded-lg p-3 ${
                isFullscreen ? 'border border-purple-500/30 bg-purple-500/20' : 'bg-zinc-800/30'
              }`}
            >
              <span className="text-zinc-300">Fullscreen rejimi</span>
              <div className={`h-2 w-2 rounded-full ${isFullscreen ? 'bg-purple-500' : 'bg-zinc-500'}`}></div>
            </div>

            {analysis && (
              <div
                className={`flex items-center justify-between rounded-lg p-3 ${
                  analysis.isRetina ? 'border border-yellow-500/30 bg-yellow-500/20' : 'bg-zinc-800/30'
                }`}
              >
                <span className="text-zinc-300">Retina displey</span>
                <div className={`h-2 w-2 rounded-full ${analysis.isRetina ? 'bg-yellow-500' : 'bg-zinc-500'}`}></div>
              </div>
            )}

            {analysis && (
              <div className="rounded-lg bg-zinc-800/30 p-3">
                <div className="mb-1 text-sm text-zinc-400">Viewport foizi</div>
                <div className="text-lg font-semibold text-cyan-400">{analysis.viewportRatio}%</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info panel - Professional dizayn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Ekran O'lchami va Displey Ma'lumotlari
        </h3>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              Real-time Monitoring
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              Ekran o'lchami, viewport ma'lumotlari va qurilma spetsifikatsiyalarini real vaqtda kuzating. Brauzer
              oynasi o'lchami va scroll pozitsiyasini instant tracking.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Professional Testing
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Responsive web dizayn testing</li>
              <li>• Cross-device compatibility check</li>
              <li>• Fullscreen mode analysis</li>
              <li>• Pixel ratio va Retina detection</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Technical Analysis
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Resolution category detection</li>
              <li>• Device type classification</li>
              <li>• Aspect ratio calculation</li>
              <li>• JSON export functionality</li>
            </ul>
          </div>
        </div>

        {/* Resolution Standards */}
        <div className="mt-6 rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-zinc-200">
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3"
              />
            </svg>
            Resolution Standards va Qurilma Turlari
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-zinc-500">Popular Resolution'lar:</p>
              <div className="space-y-2">
                <div className="flex justify-between rounded bg-zinc-900/50 p-2 text-sm">
                  <span className="text-zinc-300">4K UHD</span>
                  <code className="text-blue-400">3840×2160</code>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 p-2 text-sm">
                  <span className="text-zinc-300">Full HD</span>
                  <code className="text-blue-400">1920×1080</code>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 p-2 text-sm">
                  <span className="text-zinc-300">HD</span>
                  <code className="text-blue-400">1366×768</code>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-zinc-500">Device Categories:</p>
              <div className="space-y-2">
                <div className="flex justify-between rounded bg-zinc-900/50 p-2 text-sm">
                  <span className="text-zinc-300">Mobile</span>
                  <code className="text-green-400">≤ 768px</code>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 p-2 text-sm">
                  <span className="text-zinc-300">Tablet</span>
                  <code className="text-green-400">769px - 1024px</code>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 p-2 text-sm">
                  <span className="text-zinc-300">Desktop</span>
                  <code className="text-green-400">1025px+</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Tips */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-blue-400">Web Development</span>
            </div>
            <p className="text-sm text-zinc-400">
              Responsive dizayn uchun breakpoint'larni to'g'ri sozlang. Mobile-first yondashuvni qo'llang va har xil
              qurilmalarda test qiling.
            </p>
          </div>

          <div className="rounded-lg bg-green-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-green-400">Quality Assurance</span>
            </div>
            <p className="text-sm text-zinc-400">
              Cross-browser testing uchun turli qurilma o'lchamlarini simulyatsiya qiling. Retina displeylar uchun
              alohida test qiling.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-cyan-500/10 p-4">
          <div className="text-sm text-cyan-400">
            <strong>💡 Professional Tip:</strong> Viewport meta tag'ni to'g'ri sozlash responsive dizayn uchun muhim.
            <code className="mx-1 rounded bg-cyan-400/20 px-1 text-cyan-300">
              &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;
            </code>
            ishlatishni unutmang.
          </div>
        </div>
      </motion.div>
    </div>
  )
}
