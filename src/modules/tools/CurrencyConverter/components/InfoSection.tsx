'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Info, HelpCircle, TrendingUp, Shield, Zap } from 'lucide-react'

export function InfoSection() {
  return (
    <div className="space-y-6">
      {/* Features */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white">Real-time kurslar</h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                O'zbekiston Markaziy Bankidan rasmiy kurslar
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white">Ishonchli manba</h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Rasmiy CBU API dan to'g'ridan-to'g'ri ma'lumot
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white">Tez va oson</h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                75+ valyuta, tarixiy grafiklar, offline rejim
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* How it works */}
      <Card className="border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Qanday ishlaydi?</h3>
        </div>

        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Valyuta konverteri O'zbekiston Markaziy Bankining rasmiy kurslaridan foydalanadi. Barcha kurslar UZS
            (O'zbekiston so'mi) ga nisbatan berilgan.
          </p>

          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50">
            <h4 className="mb-2 font-semibold text-zinc-900 dark:text-white">Cross-rate hisoblash:</h4>
            <p className="text-xs">
              Agar siz USD dan EUR ga konvertatsiya qilmoqchi bo'lsangiz, avval USD ni UZS ga, keyin UZS ni EUR ga
              o'tkazamiz:
            </p>
            <code className="mt-2 block rounded bg-zinc-200 p-2 text-xs dark:bg-zinc-700">USD → UZS → EUR</code>
          </div>

          <p>
            <strong>Eslatma:</strong> Banklar o'z komissiyasini qo'shadi, shuning uchun real kurs biroz farq qilishi
            mumkin.
          </p>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Ko'p so'raladigan savollar</h3>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Kurslar qancha tez-tez yangilanadi?</AccordionTrigger>
            <AccordionContent>
              O'zbekiston Markaziy Banki kurslarni har kuni ertalab soat 09:00 da yangilaydi. Bizning saytimiz avtomatik
              ravishda yangi kurslarni oladi va 1 soat davomida cache qiladi.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Nima uchun bankdagi kurs bilan farq bor?</AccordionTrigger>
            <AccordionContent>
              Biz CBU ning rasmiy kurslarini ko'rsatamiz. Banklar esa o'z komissiyasini qo'shadi (odatda 1-3%). Shuning
              uchun real kurs biroz yuqori yoki pastroq bo'lishi mumkin.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Cross-rate nima?</AccordionTrigger>
            <AccordionContent>
              Cross-rate - bu ikki xorijiy valyuta orasidagi to'g'ridan-to'g'ri kurs. Masalan, USD dan EUR ga. Biz buni
              UZS orqali hisoblaymiz: USD → UZS → EUR.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Tarixiy ma'lumotlar qayerdan olinadi?</AccordionTrigger>
            <AccordionContent>
              Barcha tarixiy ma'lumotlar CBU ning rasmiy arxividan olinadi. Siz 7 kun, 30 kun, 90 kun yoki 1 yillik
              tarixni ko'rishingiz mumkin.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Offline rejimda ishlayaptimi?</AccordionTrigger>
            <AccordionContent>
              Ha! Oxirgi yuklangan kurslar brauzeringizda saqlanadi va internet yo'qda ham ishlaydi. Lekin yangi
              kurslarni olish uchun internet kerak bo'ladi.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50/80 p-4 backdrop-blur-sm dark:border-yellow-900/30 dark:bg-yellow-900/10">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Ogohlantirish:</strong> Bu ma'lumotlar faqat ma'lumot uchun. Haqiqiy tranzaksiyalar uchun bankingiz
          bilan tekshiring. Biz kurs o'zgarishidan kelib chiqadigan zararlar uchun javobgar emasmiz.
        </p>
      </Card>
    </div>
  )
}
