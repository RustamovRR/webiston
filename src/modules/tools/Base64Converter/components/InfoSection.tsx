import React from 'react'
import { FileText } from 'lucide-react'

const InfoSection: React.FC = () => {
  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <FileText size={20} className="text-indigo-400" />
        Base64 haqida ma'lumot
      </h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            Base64 nima?
          </h4>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Base64 - binary ma'lumotlarni matn formatida ifodalash uchun kodlash usuli. 64 ta belgidan foydalanadi: A-Z,
            a-z, 0-9, +, /
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            Asosiy xususiyatlari
          </h4>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 6-bit ga asoslangan kodlash</li>
            <li>• Platform mustaqil format</li>
            <li>• Matn protokollarda xavfsiz</li>
            <li>• Keng qo'llab-quvvatlash</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            Qo'llanish sohalari
          </h4>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• Email da rasm yuborish</li>
            <li>• Veb sahifada rasm joylash</li>
            <li>• API orqali fayl uzatish</li>
            <li>• Ma'lumotlarni xavfsiz saqlash</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-300/30 bg-zinc-200/30 p-4 dark:border-zinc-700/30 dark:bg-zinc-800/30">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
          <FileText size={16} className="text-indigo-400" />
          Base64 format misoli
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-zinc-500">Oddiy matn:</p>
            <code className="block rounded bg-zinc-300/50 p-2 font-mono text-sm text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
              Salom dunyo!
            </code>
          </div>
          <div>
            <p className="mb-2 text-xs text-zinc-500">Base64 kodlangan:</p>
            <code className="block rounded bg-zinc-300/50 p-2 font-mono text-sm break-all text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
              U2Fsb20gZHVueW8h
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
