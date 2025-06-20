// ====================================================================================
// === 1. LOTINDAN KIRILLGA O'GIRISH FUNKSIYALARI (MAVJUD VA MUKAMMAL HOLATDA) ===
// ====================================================================================

import { NON_TRANSLITERATABLE_WORDS } from '@/constants/transliteration'

function transliteratePureUzbek(text: string): string {
  // BU FUNKSIYA O'ZGARISHSIZ QOLDI - U O'Z ISHINI TO'G'RI QILADI
  let cyrillicText = ''
  let i = 0
  const normalizedText = text.replace(/‘|’|ʻ|ʼ/g, "'")
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
      if (i > 0 && 'aeiou'.includes(normalizedText[i - 1].toLowerCase())) cyrillicText += 'ъ'
      else cyrillicText += "'"
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

    switch (char) {
      // Bir harfdan ikki harfga (digraphs) o'tadiganlar
      case 'ғ':
        latinChar = "g'"
        break
      case 'Ғ':
        latinChar = "G'"
        break
      case 'ў':
        latinChar = "o'"
        break
      case 'Ў':
        latinChar = "O'"
        break
      case 'ш':
        latinChar = 'sh'
        break
      case 'Ш':
        latinChar = 'Sh'
        break
      case 'ч':
        latinChar = 'ch'
        break
      case 'Ч':
        latinChar = 'Ch'
        break
      case 'ц':
        latinChar = 'ts'
        break
      case 'Ц':
        latinChar = 'Ts'
        break
      case 'ё':
        latinChar = 'yo'
        break
      case 'Ё':
        latinChar = 'Yo'
        break
      case 'ю':
        latinChar = 'yu'
        break
      case 'Ю':
        latinChar = 'Yu'
        break
      case 'я':
        latinChar = 'ya'
        break
      case 'Я':
        latinChar = 'Ya'
        break
      case 'нг':
        latinChar = 'ng'
        break
      case 'Нг':
        latinChar = 'Ng'
        break

      // Kontekstga bog'liq 'Е' va 'Э' harflari
      case 'е':
      case 'Е':
        if (i === 0 || /[\s\(\-\"\'«]/.test(text[i - 1])) {
          latinChar = isUpperCase(char) ? 'Ye' : 'ye'
        } else {
          latinChar = isUpperCase(char) ? 'E' : 'e'
        }
        break
      case 'э':
        latinChar = 'e'
        break
      case 'Э':
        latinChar = 'E'
        break

      // Tutuq belgisi
      case 'ъ':
        latinChar = "'"
        break
      case 'Ъ':
        latinChar = "'"
        break

      // Oddiy birma-bir o'giriladiganlar
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
        const lowerChar = char.toLowerCase()
        if (mapping[lowerChar]) {
          latinChar = isUpperCase(char) ? mapping[lowerChar].toUpperCase() : mapping[lowerChar]
        } else {
          latinChar = char // Raqamlar, tinish belgilari va boshqalar
        }
        break
    }
    latinText += latinChar
    i++
  }
  // Apostroflarni to'g'rilash (g' -> g‘, o' -> o‘)
  return latinText.replace(/g'/g, 'g‘').replace(/G'/g, 'G‘').replace(/o'/g, 'o‘').replace(/O'/g, 'O‘')
}

// =========================================================================
// === 3. ASOSIY, EKSPORT QILINADIGAN FUNKSIYALAR (HAR IKKI YO'NALISH) ===
// =========================================================================

const placeholder = (index: number) => `%%${index}%%`
const protectionRegex = new RegExp(
  [
    '```[\\s\\S]*?```',
    '`[^`]+?`',
    '\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b',
    '\\b(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*',
    `\\b(${NON_TRANSLITERATABLE_WORDS.join('|')}|[a-zA-Z]+-[a-zA-Z]+|[A-Z]{2,}'[a-z]*)\\b`,
  ].join('|'),
  'gi',
)

export function toCyrillic(text: string): string {
  if (!text) return ''
  const protectedParts: string[] = []

  const maskedText = text.replace(protectionRegex, (match) => {
    const index = protectedParts.length
    protectedParts.push(match)
    return placeholder(index)
  })

  const transliteratedMaskedText = transliteratePureUzbek(maskedText)

  return transliteratedMaskedText.replace(/%%(\d+)%%/g, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)]
  })
}

export function toLatin(text: string): string {
  if (!text) return ''
  const protectedParts: string[] = []

  // Xuddi shu himoya mexanizmini bu yerda ham qo'llaymiz
  const maskedText = text.replace(protectionRegex, (match) => {
    const index = protectedParts.length
    protectedParts.push(match)
    return placeholder(index)
  })

  const transliteratedMaskedText = transliteratePureCyrillic(maskedText)

  return transliteratedMaskedText.replace(/%%(\d+)%%/g, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)]
  })
}
