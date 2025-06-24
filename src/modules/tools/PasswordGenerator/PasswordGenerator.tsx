'use client'

import { RefreshCw, Eye, EyeOff, Shield, Download, Copy, Check, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'
import { usePasswordGenerator } from '@/hooks/tools'

const PasswordGenerator = () => {
  const {
    password,
    showPassword,
    copied,
    settings,
    passwordDisplayText,
    passwordInfo,
    passwordStrength,
    presetSettings,
    generatePassword,
    handleCopy,
    downloadPassword,
    loadPreset,
    togglePasswordVisibility,
    updateSettings,
  } = usePasswordGenerator()

  const toolColors = TOOL_COLOR_MAP['password-generator']

  const passwordTypeOptions = [
    {
      value: 'random',
      label: 'Tasodifiy',
      icon: <RefreshCw size={16} />,
    },
    {
      value: 'memorable',
      label: 'Eslab qolinadigan',
      icon: <Lock size={16} />,
    },
    {
      value: 'strong',
      label: 'Kuchli',
      icon: <Shield size={16} />,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Password Generator"
        description="Xavfsiz va kuchli parollar yaratish uchun professional vosita"
      />

      {/* Password Type Selection */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Parol turi:</h3>
          <GradientTabs
            options={passwordTypeOptions}
            value={settings.passwordType}
            onChange={(value) => updateSettings({ passwordType: value as 'random' | 'memorable' | 'strong' })}
            toolCategory="generators"
          />
        </div>
      </div>

      {/* Preset Settings */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-300">Tez sozlamalar:</span>
            <div className="flex flex-wrap gap-2">
              {presetSettings.map((preset, index) => (
                <Button
                  key={index}
                  onClick={() => loadPreset(preset)}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-zinc-700 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-6">
          {/* Length Setting */}
          <div>
            <label className="mb-3 block text-sm font-medium text-zinc-300">Parol uzunligi: {settings.length}</label>
            <input
              type="range"
              min="4"
              max="128"
              value={settings.length}
              onChange={(e) => updateSettings({ length: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="mt-2 flex justify-between text-xs text-zinc-500">
              <span>4</span>
              <span>64</span>
              <span>128</span>
            </div>
          </div>

          {/* Character Options */}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeUppercase}
                onChange={(e) => updateSettings({ includeUppercase: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Katta harflar (A-Z)</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeLowercase}
                onChange={(e) => updateSettings({ includeLowercase: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Kichik harflar (a-z)</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeNumbers}
                onChange={(e) => updateSettings({ includeNumbers: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Raqamlar (0-9)</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeSymbols}
                onChange={(e) => updateSettings({ includeSymbols: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Maxsus belgilar (!@#$)</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={settings.excludeSimilar}
                onChange={(e) => updateSettings({ excludeSimilar: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">O'xshash belgilarni chiqarish (i, l, 1, L, o, 0, O)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShimmerButton onClick={generatePassword} variant="default" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Yangi parol yaratish
            </ShimmerButton>

            <Button
              onClick={togglePasswordVisibility}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            >
              {showPassword ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
              {showPassword ? 'Yashirish' : "Ko'rsatish"}
            </Button>
          </div>

          {password && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              >
                {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                {copied ? 'Nusxalandi!' : 'Nusxalash'}
              </Button>

              <ShimmerButton onClick={downloadPassword} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Yuklab olish
              </ShimmerButton>
            </div>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <DualTextPanel
        sourceText={passwordDisplayText}
        convertedText={passwordInfo}
        sourcePlaceholder="Parol yaratish uchun yuqoridagi tugmani bosing..."
        sourceLabel="Yaratilgan parol"
        targetLabel="Parol ma'lumoti"
        onSourceChange={() => {}} // Read-only
        variant="terminal"
        showSwapButton={false}
        showClearButton={false}
      />

      {/* Password Strength Indicator */}
      {password && (
        <div className={`mt-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Parol mustahkamligi:</span>
              <span className={`text-sm font-bold ${passwordStrength.color}`}>{passwordStrength.text}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-2 w-6 rounded-sm transition-colors ${
                    level <= passwordStrength.level
                      ? passwordStrength.level === 1
                        ? 'bg-red-400'
                        : passwordStrength.level === 2
                          ? 'bg-yellow-400'
                          : passwordStrength.level === 3
                            ? 'bg-blue-400'
                            : 'bg-green-400'
                      : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className={toolColors.text.replace('text-', 'text-')} />
          Parol xavfsizligi haqida
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Kuchli parol yaratish:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Kamida 12 ta belgi uzunligida bo'lsin
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Turli xil belgilar turlarini qo'shing
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                O'xshash belgilarni chiqarib tashlang
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                Har bir hisob uchun alohida parol yarating
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Parolni xavfsiz joyda saqlang
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Parol turlari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                • <strong>Tasodifiy:</strong> Eng xavfsiz, barcha belgilar random
              </li>
              <li>
                • <strong>Eslab qolinadigan:</strong> So'zlar + raqamlar + belgilar
              </li>
              <li>
                • <strong>PIN:</strong> Faqat raqamlar, mobil qurilmalar uchun
              </li>
              <li>
                • <strong>Xavfsiz:</strong> Maksimal uzunlik va murakkablik
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-700 pt-6">
          <h4 className="mb-2 font-medium text-zinc-200">Muhim eslatmalar:</h4>
          <ul className="space-y-1 text-sm text-zinc-400">
            <li>• Hech qachon bir xil parolni ikki marta ishlatmang</li>
            <li>• Parolni boshqalar bilan baham ko'rmang</li>
            <li>• Muntazam ravishda parollarni yangilang</li>
            <li>• 2FA (ikki faktorli autentifikatsiya) qo'shing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PasswordGenerator
