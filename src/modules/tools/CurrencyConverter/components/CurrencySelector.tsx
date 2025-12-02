'use client'

import React, { useState, useMemo } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib'
import type { CurrencyRate } from '../types'
import { CURRENCY_FLAGS, CURRENCY_CATEGORIES } from '../utils/popularPairs'

interface CurrencySelectorProps {
  currencies: CurrencyRate[]
  value: string
  onChange: (code: string) => void
  label?: string
  disabled?: boolean
  locale?: string
}

export function CurrencySelector({
  currencies,
  value,
  onChange,
  label,
  disabled = false,
  locale = 'uz',
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * Tanlangan valyuta
   */
  const selectedCurrency = useMemo(() => {
    return currencies.find((c) => c.code === value)
  }, [currencies, value])

  /**
   * Valyuta nomini olish (locale bo'yicha)
   */
  const getCurrencyName = (currency: CurrencyRate): string => {
    switch (locale) {
      case 'en':
        return currency.name_en
      case 'ru':
        return currency.name_ru
      default:
        return currency.name_uz
    }
  }

  /**
   * Qidiruv bo'yicha filtrlash
   */
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencies

    const query = searchQuery.toLowerCase()
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name_uz.toLowerCase().includes(query) ||
        currency.name_en.toLowerCase().includes(query) ||
        currency.name_ru.toLowerCase().includes(query),
    )
  }, [currencies, searchQuery])

  /**
   * Kategoriyalarga ajratish
   */
  const categorizedCurrencies = useMemo(() => {
    const popular = filteredCurrencies.filter((c) => CURRENCY_CATEGORIES.popular.includes(c.code))
    const cis = filteredCurrencies.filter((c) => CURRENCY_CATEGORIES.cis.includes(c.code))
    const others = filteredCurrencies.filter(
      (c) => !CURRENCY_CATEGORIES.popular.includes(c.code) && !CURRENCY_CATEGORIES.cis.includes(c.code),
    )

    return { popular, cis, others }
  }, [filteredCurrencies])

  /**
   * Valyuta tanlash
   */
  const handleSelect = (code: string) => {
    onChange(code)
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            {selectedCurrency ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CURRENCY_FLAGS[selectedCurrency.code] || '💱'}</span>
                <span className="font-semibold">{selectedCurrency.code}</span>
                <span className="text-sm text-zinc-500">- {getCurrencyName(selectedCurrency)}</span>
              </div>
            ) : (
              <span className="text-zinc-500">Valyuta tanlang...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Valyuta qidirish..." value={searchQuery} onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>Valyuta topilmadi.</CommandEmpty>

              {/* Popular currencies */}
              {categorizedCurrencies.popular.length > 0 && (
                <CommandGroup heading="Mashhur valyutalar">
                  {categorizedCurrencies.popular.map((currency) => (
                    <CommandItem key={currency.code} value={currency.code} onSelect={() => handleSelect(currency.code)}>
                      <Check className={cn('mr-2 h-4 w-4', value === currency.code ? 'opacity-100' : 'opacity-0')} />
                      <span className="mr-2 text-xl">{CURRENCY_FLAGS[currency.code] || '💱'}</span>
                      <span className="font-semibold">{currency.code}</span>
                      <span className="ml-2 text-sm text-zinc-500">- {getCurrencyName(currency)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* CIS currencies */}
              {categorizedCurrencies.cis.length > 0 && (
                <CommandGroup heading="MDH davlatlari">
                  {categorizedCurrencies.cis.map((currency) => (
                    <CommandItem key={currency.code} value={currency.code} onSelect={() => handleSelect(currency.code)}>
                      <Check className={cn('mr-2 h-4 w-4', value === currency.code ? 'opacity-100' : 'opacity-0')} />
                      <span className="mr-2 text-xl">{CURRENCY_FLAGS[currency.code] || '💱'}</span>
                      <span className="font-semibold">{currency.code}</span>
                      <span className="ml-2 text-sm text-zinc-500">- {getCurrencyName(currency)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Other currencies */}
              {categorizedCurrencies.others.length > 0 && (
                <CommandGroup heading="Boshqa valyutalar">
                  {categorizedCurrencies.others.map((currency) => (
                    <CommandItem key={currency.code} value={currency.code} onSelect={() => handleSelect(currency.code)}>
                      <Check className={cn('mr-2 h-4 w-4', value === currency.code ? 'opacity-100' : 'opacity-0')} />
                      <span className="mr-2 text-xl">{CURRENCY_FLAGS[currency.code] || '💱'}</span>
                      <span className="font-semibold">{currency.code}</span>
                      <span className="ml-2 text-sm text-zinc-500">- {getCurrencyName(currency)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
