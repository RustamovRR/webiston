'use client'

import { useState } from 'react'
import { RefreshCw, Eye, EyeOff, Shield, Download, Copy, Check, Zap, Lock, Settings, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolHeader, StatsDisplay, DualTextPanel } from '@/components/shared'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { cn } from '@/lib'
import { usePasswordGenerator } from '@/hooks'

const PasswordGenerator = () => {
  const {
    password,
    showPassword,
    copied,
    settings,
    passwordDisplayText,
    passwordStrength,
    stats,
    inputStats,
    outputStats,
    presetSettings,
    generatePassword,
    handleCopy,
    downloadPassword,
    loadPreset,
    togglePasswordVisibility,
    updateSettings,
  } = usePasswordGenerator({
    onSuccess: (message) => console.log(message),
    onError: (error) => console.error(error),
  })

  const passwordTypeOptions = [
    {
      value: 'random',
      label: 'Tasodifiy',
      icon: <RefreshCw size={16} />,
    },
    {
      value: 'memorable',
      label: 'Eslab qolinadigan',
      icon: <Key size={16} />,
    },
    {
      value: 'strong',
      label: 'Kuchli',
      icon: <Shield size={16} />,
    },
  ]

  const getCharacterTypes = () => {
    const types = []
    if (settings.includeUppercase) types.push('ABC')
    if (settings.includeLowercase) types.push('abc')
    if (settings.includeNumbers) types.push('123')
    if (settings.includeSymbols) types.push('!@#')
    return types.join('+') || 'Hech qanday'
  }

  const passwordInfo = password
    ? `Parol muvaffaqiyatli yaratildi!\n\nUzunlik: ${password.length} belgi\nTuri: ${settings.passwordType === 'memorable' ? 'Eslab qolinadigan' : settings.passwordType === 'strong' ? 'Kuchli' : 'Tasodifiy'}\nMustahkamlik: ${passwordStrength.text}\nEntropiya: ${stats.entropy} bit\n\nBelgi turlari: ${getCharacterTypes()}\nNoyob belgilar: ${stats.unique}/${stats.characters}`
    : ''

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Password Generator"
        description="Professional xavfsiz parol yaratish vositasi. Turli xil sozlamalar bilan kuchli parollar yaratish."
      />

      {/* Konfiguratsiya Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Tool Konfiguratsiya</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-500">Ready</span>
          </div>
        </div>

        {/* Panel Content */}
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Password Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Parol Turi:</label>
              <GradientTabs
                options={passwordTypeOptions}
                value={settings.passwordType}
                onChange={(value) => updateSettings({ passwordType: value as 'random' | 'memorable' | 'strong' })}
                toolCategory="generators"
              />
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-xs text-zinc-400">
                  {settings.passwordType === 'random' && 'Tasodifiy belgilar kombinatsiyasi'}
                  {settings.passwordType === 'memorable' && "Eslab qolinadigan so'zlar va raqamlar"}
                  {settings.passwordType === 'strong' && 'Maksimal xavfsizlik uchun kuchli parol'}
                </div>
              </div>
            </div>

            {/* Length Setting */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">
                Parol Uzunligi: <span className="text-blue-400">{settings.length}</span>
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={settings.length}
                onChange={(e) => updateSettings({ length: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>4 (Qisqa)</span>
                <span>16 (Standart)</span>
                <span>32 (Kuchli)</span>
                <span>128 (Maksimal)</span>
              </div>
            </div>
          </div>

          {/* Character Options */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-zinc-300">Belgi Turlari:</label>
            <div className="grid gap-3 md:grid-cols-2">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                  settings.includeUppercase
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                )}
              >
                <input
                  type="checkbox"
                  checked={settings.includeUppercase}
                  onChange={(e) => updateSettings({ includeUppercase: e.target.checked })}
                  className="sr-only"
                />
                <div className="text-sm font-medium">Katta harflar (A-Z)</div>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                  settings.includeLowercase
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                )}
              >
                <input
                  type="checkbox"
                  checked={settings.includeLowercase}
                  onChange={(e) => updateSettings({ includeLowercase: e.target.checked })}
                  className="sr-only"
                />
                <div className="text-sm font-medium">Kichik harflar (a-z)</div>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                  settings.includeNumbers
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                )}
              >
                <input
                  type="checkbox"
                  checked={settings.includeNumbers}
                  onChange={(e) => updateSettings({ includeNumbers: e.target.checked })}
                  className="sr-only"
                />
                <div className="text-sm font-medium">Raqamlar (0-9)</div>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                  settings.includeSymbols
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                )}
              >
                <input
                  type="checkbox"
                  checked={settings.includeSymbols}
                  onChange={(e) => updateSettings({ includeSymbols: e.target.checked })}
                  className="sr-only"
                />
                <div className="text-sm font-medium">Maxsus belgilar (!@#$)</div>
              </label>
            </div>

            {/* Additional Options */}
            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                settings.excludeSimilar
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
              )}
            >
              <input
                type="checkbox"
                checked={settings.excludeSimilar}
                onChange={(e) => updateSettings({ excludeSimilar: e.target.checked })}
                className="sr-only"
              />
              <div className="text-sm font-medium">O'xshash belgilarni chiqarish (i, l, 1, L, o, 0, O)</div>
            </label>
          </div>

          {/* Preset Settings */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-zinc-300">Tez Sozlamalar:</label>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
              {presetSettings.map((preset, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 p-3 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="text-sm font-medium text-zinc-200">{preset.label}</div>
                  <div className="text-xs text-zinc-400">{preset.description}</div>
                  <Button onClick={() => loadPreset(preset)} variant="outline" size="sm" className="mt-auto">
                    Yuklash
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Generate Button */}
              <ShimmerButton onClick={generatePassword} size="sm">
                <RefreshCw size={16} className="mr-2" />
                Yangi Parol
              </ShimmerButton>

              {/* Visibility Toggle */}
              <Button onClick={togglePasswordVisibility} variant="outline" size="sm">
                {showPassword ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                {showPassword ? 'Yashirish' : "Ko'rsatish"}
              </Button>
            </div>

            {/* Action Buttons */}
            {password && (
              <div className="flex items-center gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                  {copied ? 'Nusxalandi!' : 'Nusxalash'}
                </Button>

                <Button onClick={downloadPassword} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Yuklab olish
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dual Panel Layout */}
      <DualTextPanel
        sourceText={passwordDisplayText}
        convertedText={passwordInfo}
        sourceLabel="Tool Kirish"
        targetLabel="Tool Natija"
        onSourceChange={() => {}} // Read-only
        sourcePlaceholder="Yaratilgan parol bu yerda ko'rinadi..."
        onClear={() => {}}
        showSwapButton={false}
        showClearButton={false}
        variant="terminal"
      />

      {/* Password Strength Display */}
      {password && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Parol Mustahkamligi</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  passwordStrength.level <= 2
                    ? 'bg-red-500'
                    : passwordStrength.level <= 3
                      ? 'bg-yellow-500'
                      : passwordStrength.level <= 4
                        ? 'bg-blue-500'
                        : 'bg-green-500',
                )}
              ></div>
              <span className="text-xs text-zinc-500">{passwordStrength.text}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.characters}</div>
              <div className="text-xs text-zinc-500">Belgilar</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.unique}</div>
              <div className="text-xs text-zinc-500">Noyob belgilar</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.entropy}</div>
              <div className="text-xs text-zinc-500">Entropiya (bit)</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 text-center">
              <div className={cn('text-2xl font-bold', passwordStrength.color)}>{passwordStrength.level}/5</div>
              <div className="text-xs text-zinc-500">Mustahkamlik</div>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-zinc-300">Mustahkamlik darajasi:</span>
              <span className={cn('text-sm font-medium', passwordStrength.color)}>{passwordStrength.text}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  passwordStrength.level <= 1
                    ? 'bg-red-500'
                    : passwordStrength.level <= 2
                      ? 'bg-red-400'
                      : passwordStrength.level <= 3
                        ? 'bg-yellow-400'
                        : passwordStrength.level <= 4
                          ? 'bg-blue-400'
                          : 'bg-green-400',
                )}
                style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Ma'lumot Section */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Shield size={20} className="text-green-400" />
          Parol xavfsizligi nima uchun muhim?
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Asosiy xavfsizlik qoidalari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>Har bir account uchun alohida parol:</strong> Bir parolning buzilishi boshqalarini xavf ostiga
                qo'ymaydi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>16+ belgi uzunligi:</strong> Uzun parollar matematik jihatdan sindirish qiyinroq
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>Turli belgi turlari:</strong> Harflar, raqamlar va maxsus belgilar kombinatsiyasi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>Password manager ishlatish:</strong> Barcha parollarni xavfsiz saqlash
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <strong>2FA yoqish:</strong> Ikki faktorli autentifikatsiya qo'shimcha himoya beradi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                <strong>Muntazam yangilash:</strong> Muhim accountlar uchun parolni davriy o'zgartirish
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                O'xshash belgilarni (i, l, 1, L, o, 0, O) chiqarib tashlang
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Shaxsiy ma'lumotlar (ism, tug'ilgan yil) ishlatmang
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                Lug'atdagi so'zlarni to'g'ridan-to'g'ri ishlatmang
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                Brute force hujumlarni hisobga oling (120+ bit entropiya)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Memorable parollar oson eslab qolish uchun foydali
              </li>
            </ul>

            <div className="mt-4 rounded-lg bg-green-500/10 p-3">
              <div className="text-sm text-green-400">
                <strong>Tavsiya:</strong> Kuchli parollar kompyuter tomonidan 100+ yil davomida sindirish mumkin emas.
                Bu tool professional standartlarga mos parollar yaratadi.
              </div>
            </div>
          </div>
        </div>

        {/* Password Type Info */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 font-medium text-blue-400">Tasodifiy Parollar</div>
            <div className="text-sm text-zinc-400">
              Matematik jihatdan eng xavfsiz, to'liq random belgilar kombinatsiyasi
            </div>
          </div>

          <div className="rounded-lg bg-purple-500/10 p-4">
            <div className="mb-2 font-medium text-purple-400">Eslab Qolinadigan</div>
            <div className="text-sm text-zinc-400">So'zlar va raqamlardan iborat, eslab qolish oson lekin xavfsiz</div>
          </div>

          <div className="rounded-lg bg-green-500/10 p-4">
            <div className="mb-2 font-medium text-green-400">Kuchli Parollar</div>
            <div className="text-sm text-zinc-400">
              Maksimal xavfsizlik uchun, barcha belgi turlarini o'z ichiga oladi
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordGenerator
