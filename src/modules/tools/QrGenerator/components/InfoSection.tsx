import React from 'react'
import { QrCode } from 'lucide-react'

const InfoSection: React.FC = () => {
  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <QrCode size={20} className="text-purple-400" />
        QR kodlar va ularning qo'llanilishi
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">QR kod turlari:</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <strong>URL QR kodlari:</strong> Website havolalari, landing pagelar va online resurslar
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <strong>Kontakt QR kodlari:</strong> vCard format, telefon raqami va email manzillari
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <strong>WiFi QR kodlari:</strong> Tarmoq nomlari, parollar va xavfsizlik sozlamalari
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              <strong>SMS QR kodlari:</strong> Telefon raqami va tayyor xabar matni
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              <strong>Matn QR kodlari:</strong> Har qanday matn ma'lumotlari, ma'lumotlar
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
              <strong>Email QR kodlari:</strong> Qabul qiluvchi, mavzu va xabar matni
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">Professional maslahatlar:</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              Katta o'lchamlar (300x300+) chop etish uchun mos
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              Yuqori xato tuzatish darajasi (H) zarar ko'rgan kodlarni o'qiydi
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              QR kod atrofida oq chegaralar qoldiring (quiet zone)
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              URL'larda qisqa linklar (bit.ly) ishlatish tavsiya etiladi
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              QR kod o'lchami va masofa optimal nisbatini saqlang
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-purple-500/10 p-3 dark:bg-purple-500/20">
            <div className="text-sm text-purple-600 dark:text-purple-400">
              <strong>Muhim:</strong> QR kodlar 2000+ belgigacha ma'lumot saqlashi mumkin. Ko'proq ma'lumot kod
              murakkabligini oshiradi, shuning uchun qisqa linklar foydalaning.
            </div>
          </div>
        </div>
      </div>

      {/* QR Size & Error Level Info */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-500/10 p-4">
          <div className="mb-2 font-medium text-blue-400">150x150 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Digital, ekran va social media uchun minimal o'lcham
          </div>
        </div>

        <div className="rounded-lg bg-green-500/10 p-4">
          <div className="mb-2 font-medium text-green-400">200x200 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Business card va kichik chop materiallar uchun optimal
          </div>
        </div>

        <div className="rounded-lg bg-orange-500/10 p-4">
          <div className="mb-2 font-medium text-orange-400">300x300 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Poster, flyer va katta chop materiallari uchun</div>
        </div>

        <div className="rounded-lg bg-purple-500/10 p-4">
          <div className="mb-2 font-medium text-purple-400">400x400 px</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Billboard va professional chop uchun yuqori sifat
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
