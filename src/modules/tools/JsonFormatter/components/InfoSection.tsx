import React from 'react'
import { FileJson } from 'lucide-react'

const InfoSection: React.FC = () => {
  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        <FileJson size={20} className="text-indigo-400" />
        JSON haqida ma'lumot
      </h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            JSON nima?
          </h4>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            JSON (JavaScript Object Notation) - ma'lumotlarni saqlash va uzatish uchun yengil va tushunarli format.
            Zamonaviy veb-ilovalar va API larda keng qo'llaniladi.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            Asosiy xususiyatlari
          </h4>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• Odam o'qishi oson format</li>
            <li>• Til mustaqil standart</li>
            <li>• Kichik hajm va tez ishlov</li>
            <li>• Keng qo'llab-quvvatlash</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            Qo'llanish sohalari
          </h4>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• API javoblari va so'rovlari</li>
            <li>• Konfiguratsiya fayllari</li>
            <li>• Ma'lumotlar bazasi eksport</li>
            <li>• Veb ilovalar uchun ma'lumot uzatish</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
