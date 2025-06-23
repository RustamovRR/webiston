'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, Eye, EyeOff, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { ShimmerButton } from '@/components/ui'

const PasswordGenerator = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [settings, setSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  })

  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
  }

  const generatePassword = () => {
    let chars = ''

    if (settings.includeUppercase) chars += charSets.uppercase
    if (settings.includeLowercase) chars += charSets.lowercase
    if (settings.includeNumbers) chars += charSets.numbers
    if (settings.includeSymbols) chars += charSets.symbols

    if (settings.excludeSimilar) {
      chars = chars
        .split('')
        .filter((char) => !charSets.similar.includes(char))
        .join('')
    }

    if (!chars) {
      setPassword('')
      return
    }

    let result = ''
    for (let i = 0; i < settings.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    setPassword(result)
  }

  const getPasswordStrength = useMemo(() => {
    if (!password) return { level: 0, text: 'Parol yaratilmagan', color: 'text-zinc-500' }

    let score = 0

    // Uzunlik
    if (password.length >= 12) score += 2
    else if (password.length >= 8) score += 1

    // Belgilar turi
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Takrorlanmaydigan belgilar
    const uniqueChars = new Set(password).size
    if (uniqueChars / password.length > 0.7) score += 1

    if (score <= 2) return { level: 1, text: 'Zaif', color: 'text-red-400' }
    if (score <= 4) return { level: 2, text: "O'rtacha", color: 'text-yellow-400' }
    if (score <= 6) return { level: 3, text: 'Yaxshi', color: 'text-blue-400' }
    return { level: 4, text: 'Kuchli', color: 'text-green-400' }
  }, [password])

  // Birinchi marta sahifa ochilganda parol yaratish
  useMemo(() => {
    if (!password) {
      generatePassword()
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="Parol Yaratuvchi" description="Xavfsiz va kuchli parollar yaratish uchun vosita" />

      <div className="space-y-6">
        {/* Parol ko'rsatish */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Yaratilgan parol</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <CopyButton text={password} />
                <Button
                  onClick={generatePassword}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Yangilash
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <Input
                value={showPassword ? password : '•'.repeat(password.length)}
                readOnly
                className="border-zinc-700 bg-zinc-800/50 font-mono text-lg text-zinc-100"
              />
            </div>

            {/* Parol mustahkamligi */}
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-zinc-400" />
              <span className="text-sm text-zinc-400">Mustahkamlik:</span>
              <span className={`text-sm font-medium ${getPasswordStrength.color}`}>{getPasswordStrength.text}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-4 rounded-sm ${
                      level <= getPasswordStrength.level
                        ? getPasswordStrength.level === 1
                          ? 'bg-red-400'
                          : getPasswordStrength.level === 2
                            ? 'bg-yellow-400'
                            : getPasswordStrength.level === 3
                              ? 'bg-blue-400'
                              : 'bg-green-400'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Sozlamalar */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Parol sozlamalari</h3>

            {/* Uzunlik */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-zinc-300">Uzunlik: {settings.length}</label>
              <input
                type="range"
                min="4"
                max="128"
                value={settings.length}
                onChange={(e) => setSettings((prev) => ({ ...prev, length: parseInt(e.target.value) }))}
                className="w-full accent-blue-500"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            {/* Belgilar turlari */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="uppercase"
                  checked={settings.includeUppercase}
                  onChange={(e) => setSettings((prev) => ({ ...prev, includeUppercase: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="uppercase" className="text-sm text-zinc-300">
                  Katta harflar (A-Z)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="lowercase"
                  checked={settings.includeLowercase}
                  onChange={(e) => setSettings((prev) => ({ ...prev, includeLowercase: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="lowercase" className="text-sm text-zinc-300">
                  Kichik harflar (a-z)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="numbers"
                  checked={settings.includeNumbers}
                  onChange={(e) => setSettings((prev) => ({ ...prev, includeNumbers: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="numbers" className="text-sm text-zinc-300">
                  Raqamlar (0-9)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="symbols"
                  checked={settings.includeSymbols}
                  onChange={(e) => setSettings((prev) => ({ ...prev, includeSymbols: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="symbols" className="text-sm text-zinc-300">
                  Maxsus belgilar (!@#$%^&*)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="excludeSimilar"
                  checked={settings.excludeSimilar}
                  onChange={(e) => setSettings((prev) => ({ ...prev, excludeSimilar: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="excludeSimilar" className="text-sm text-zinc-300">
                  O'xshash belgilarni chiqarib tashlash (i, l, 1, L, o, 0, O)
                </label>
              </div>
            </div>

            <ShimmerButton
              onClick={generatePassword}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw size={18} className="mr-2" />
              Yangi parol yaratish
            </ShimmerButton>
          </div>
        </Card>

        {/* Yordam */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <h4 className="mb-3 font-medium text-zinc-200">Parol xavfsizligi bo'yicha maslahatlar:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>• Kamida 12 ta belgi uzunligida parol yarating</li>
              <li>• Turli xil belgilar turlarini ishlatishga harakat qiling</li>
              <li>• Har bir hisob uchun alohida parol yarating</li>
              <li>• Parollarni xavfsiz joyda saqlang</li>
              <li>• Shubhali faoliyat aniqlansa parolni o'zgartiring</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PasswordGenerator
