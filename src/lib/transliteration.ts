// lib/transliteration.ts (Sizning kodingiz + To'ldirilgan toLatin funksiyasi)

import { NON_TRANSLITERATABLE_WORDS } from '@/constants/transliteration'

// ====================================================================================
// === 1. LOTINDAN KIRILLGA O'GIRISH (SIZ BERGAN VA O'ZGARTIRILMAGAN KOD) ===
// ====================================================================================

function transliteratePureUzbek(text: string): string {
  // BU FUNKSIYA O'ZGARISHSIZ QOLDI - U O'Z ISHINI TO'G'RI QILADI
  let cyrillicText = ''
  let i = 0
  // Apostrof/tutuq belgilarini yagona `'` ga normallashtiramiz (`, ´, ‘, ’, ʻ, ʼ, ʿ, ˈ, ′)
  const normalizedText = text.replace(/[`´‘’ʻʼʿˈ′]/g, "'")
  const isUpperCase = (c: string) => c === c.toUpperCase() && c !== c.toLowerCase()

  while (i < normalizedText.length) {
    const char = normalizedText[i]
    const nextChar = normalizedText[i + 1] || ''
    if (char.toLowerCase() === 'y') {
      const nextTwoChars = normalizedText.substring(i + 1, i + 3)
      if (nextTwoChars.toLowerCase() === "o'") {
        cyrillicText += isUpperCase(char) ? 'Й' : 'й'
        i++
        continue
      }
      if (nextChar.toLowerCase() === 'o') {
        cyrillicText += isUpperCase(char) ? 'Ё' : 'ё'
        i += 2
        continue
      }
      if (nextChar.toLowerCase() === 'a') {
        cyrillicText += isUpperCase(char) ? 'Я' : 'я'
        i += 2
        continue
      }
      if (nextChar.toLowerCase() === 'u') {
        cyrillicText += isUpperCase(char) ? 'Ю' : 'ю'
        i += 2
        continue
      }
      if ((i === 0 || /[\s\(\-\"\'«]/.test(normalizedText[i - 1])) && nextChar.toLowerCase() === 'e') {
        cyrillicText += isUpperCase(char) ? 'Е' : 'е'
        i += 2
        continue
      }
      cyrillicText += isUpperCase(char) ? 'Й' : 'й'
      i++
      continue
    }
    if (char.toLowerCase() === 'e' && (i === 0 || /[\s\(\-\"\'«]/.test(normalizedText[i - 1]))) {
      cyrillicText += isUpperCase(char) ? 'Э' : 'э'
      i++
      continue
    }
    if (char.toLowerCase() === 'g' && nextChar === "'") {
      cyrillicText += isUpperCase(char) ? 'Ғ' : 'ғ'
      i += 2
      continue
    }
    if (char.toLowerCase() === 'o' && nextChar === "'") {
      cyrillicText += isUpperCase(char) ? 'Ў' : 'ў'
      i += 2
      continue
    }
    const digraphs: { [key: string]: string } = { sh: 'ш', ch: 'ч', ng: 'нг', ts: 'ц' }
    const twoChar = (char + nextChar).toLowerCase()
    // Maxsus holat: "ng'" ketma-ketligida 'g\'' ni Ғ sifatida ishlatish uchun 'ng' digrafini qo'llamaymiz
    if (twoChar === 'ng' && normalizedText[i + 2] === "'") {
      // Faqat 'n' ni transliteratsiya qilamiz, 'g\'' keyingi iteratsiyada 'Ғ' bo'ladi
      cyrillicText += isUpperCase(char) ? 'Н' : 'н'
      i += 1
      continue
    }
    if (digraphs[twoChar]) {
      let originalCase = normalizedText.substring(i, i + 2)
      let cyrillicChar = digraphs[twoChar]
      if (isUpperCase(originalCase[0]) && isUpperCase(originalCase[1])) cyrillicText += cyrillicChar.toUpperCase()
      else if (isUpperCase(originalCase[0]))
        cyrillicText += cyrillicChar.charAt(0).toUpperCase() + cyrillicChar.slice(1)
      else cyrillicText += cyrillicChar
      i += 2
      continue
    }
    if (char === "'") {
      const prev = i > 0 ? normalizedText[i - 1].toLowerCase() : ''
      const next = i + 1 < normalizedText.length ? normalizedText[i + 1].toLowerCase() : ''
      const vowels = 'aeiou'
      if ((prev && vowels.includes(prev)) || (next && vowels.includes(next))) {
        cyrillicText += 'ъ'
      } else {
        cyrillicText += "'"
      }
      i++
      continue
    }
    const singleChars: { [k: string]: string } = {
      a: 'а',
      b: 'б',
      d: 'д',
      e: 'е',
      f: 'ф',
      g: 'г',
      h: 'ҳ',
      i: 'и',
      j: 'ж',
      k: 'к',
      l: 'л',
      m: 'м',
      n: 'н',
      o: 'о',
      p: 'п',
      q: 'қ',
      r: 'р',
      s: 'с',
      t: 'т',
      u: 'у',
      v: 'в',
      x: 'х',
      z: 'з',
    }
    const lowerChar = char.toLowerCase()
    if (singleChars[lowerChar])
      cyrillicText += isUpperCase(char) ? singleChars[lowerChar].toUpperCase() : singleChars[lowerChar]
    else cyrillicText += char
    i++
  }
  return cyrillicText
}

// ==================================================================================
// === 2. KIRILLDAN LOTINGA O'GIRISH FUNKSIYALARI (YANGI VA MUKAMMAL HOLATDA) ===
// ==================================================================================

function transliteratePureCyrillic(text: string): string {
  let latinText = ''
  let i = 0
  const isUpperCase = (c: string) => c === c.toUpperCase() && c !== c.toLowerCase()

  while (i < text.length) {
    const char = text[i]
    let latinChar = ''

    // Eng birinchi navbatda ikki belgili 'нг' ni tekshiramiz
    const nextChar = text[i + 1] || ''
    if (char.toLowerCase() === 'н' && nextChar.toLowerCase() === 'г') {
      latinChar = isUpperCase(char) ? 'NG' : 'Ng'
      if (!isUpperCase(char) && !isUpperCase(nextChar)) latinChar = 'ng'
      i += 2
      latinText += latinChar
      continue
    }

    switch (char.toLowerCase()) {
      case 'ғ':
        latinChar = "g'"
        break
      case 'ў':
        latinChar = "o'"
        break
      case 'ш':
        latinChar = 'sh'
        break
      case 'ч':
        latinChar = 'ch'
        break
      case 'ц':
        latinChar = 'ts'
        break
      case 'ё':
        latinChar = 'yo'
        break
      case 'ю':
        latinChar = 'yu'
        break
      case 'я':
        latinChar = 'ya'
        break
      case 'е':
        if (i === 0 || /[\s\(\-\"\'«]/.test(text[i - 1])) {
          latinChar = 'ye'
        } else {
          latinChar = 'e'
        }
        break
      case 'э':
        latinChar = 'e'
        break
      case 'ъ':
        latinChar = "'"
        break
      default:
        const mapping: { [k: string]: string } = {
          а: 'a',
          б: 'b',
          в: 'v',
          г: 'g',
          д: 'd',
          ж: 'j',
          з: 'z',
          и: 'i',
          й: 'y',
          к: 'k',
          л: 'l',
          м: 'm',
          н: 'n',
          о: 'o',
          п: 'p',
          р: 'r',
          с: 's',
          т: 't',
          у: 'u',
          ф: 'f',
          х: 'x',
          қ: 'q',
          ҳ: 'h',
        }
        if (mapping[char.toLowerCase()]) {
          latinChar = mapping[char.toLowerCase()]
        } else {
          latinChar = char
        }
        break
    }

    if (latinChar.length > 1 && isUpperCase(char)) {
      latinText += latinChar.charAt(0).toUpperCase() + latinChar.slice(1)
    } else if (latinChar.length === 1 && isUpperCase(char)) {
      latinText += latinChar.toUpperCase()
    } else {
      latinText += latinChar
    }

    i++
  }
  // Natijadagi barcha turdagi apostrof/tutuq belgilarini oddiy `'` ga normallashtiramiz
  return latinText.replace(/[`´‘’ʻʼʿˈ′]/g, "'")
}

// =========================================================================
// === 3. ASOSIY, EKSPORT QILINADIGAN FUNKSIYALAR (HAR IKKI YO'NALISH) ===
// =========================================================================

const placeholder = (index: number) => `%%${index}%%`
// BU REGEX O'ZGARTIRILMADI
// Apostroflar to'plami (character class ko'rinishida ishlatamiz)
const APOST_CLASS = "[`´‘’ʻʼʿˈ′']"
const protectionRegex = new RegExp(
  [
    '```[\\s\\S]*?```',
    '`[^`]+?`',
    '\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b',
    '\\b(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*',
    // Apostrof bilan tutashmagan aniq so'zlar (oldi/ketida apostrof bo'lmasin)
    `(^|[^${APOST_CLASS}])\\b(${NON_TRANSLITERATABLE_WORDS.join('|')})\\b(?=$|[^${APOST_CLASS}])`,
  ].join('|'),
  'gi',
)

// SIZNING toCyrillic FUNKSIYANGIZ - O'ZGARTIRILMAGAN
export function toCyrillic(text: string): string {
  if (!text) return ''
  const protectedParts: string[] = []

  const maskedText = text.replace(protectionRegex, (match, p1, p2) => {
    const index = protectedParts.length
    if (p2) {
      // Bu NON_TRANSLITERATABLE_WORDS mosligi: p1 — oldingi belgi (saqlaymiz), p2 — so'zning o'zi (maskalaymiz)
      protectedParts.push(p2)
      return `${p1}${placeholder(index)}`
    }
    // Aks holda (code block, email, url) — to'liq match ni maskalaymiz
    protectedParts.push(match)
    return placeholder(index)
  })

  const transliteratedMaskedText = transliteratePureUzbek(maskedText)

  return transliteratedMaskedText.replace(/%%(\d+)%%/g, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)]
  })
}

// YANGI toLatin FUNKSIYASI - XUDDI SHU ARXITEKTURADA
export function toLatin(text: string): string {
  if (!text) return ''
  const protectedParts: string[] = []

  const maskedText = text.replace(protectionRegex, (match, p1, p2) => {
    const index = protectedParts.length
    if (p2) {
      protectedParts.push(p2)
      return `${p1}${placeholder(index)}`
    }
    protectedParts.push(match)
    return placeholder(index)
  })

  const transliteratedMaskedText = transliteratePureCyrillic(maskedText)

  return transliteratedMaskedText.replace(/%%(\d+)%%/g, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)]
  })
}
