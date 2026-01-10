import { describe, expect, it } from "vitest"
import { toCyrillic, toLatin } from "../utils"

// =============================================================================
// LATIN TO CYRILLIC
// =============================================================================

describe("toCyrillic", () => {
  describe("basic conversion", () => {
    it.each([
      ["salom", "салом"],
      ["dunyo", "дунё"],
      ["", ""],
      ["2024 yil", "2024 йил"],
      ["Salom!", "Салом!"],
      ["Qanday?", "Қандай?"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })

  describe("Uzbek special characters", () => {
    it.each([
      ["o'zbek", "ўзбек"],
      ["O'zbekiston", "Ўзбекистон"],
      ["g'alaba", "ғалаба"],
      ["tog'", "тоғ"],
      ["shirin", "ширин"],
      ["Toshkent", "Тошкент"],
      ["choy", "чой"],
      ["uchun", "учун"],
      ["rang", "ранг"],
      ["tong", "тонг"],
      ["tong'i", "тонғи"],
      ["qalam", "қалам"],
      ["havo", "ҳаво"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })

  describe("compound vowels", () => {
    it.each([
      ["yomon", "ёмон"],
      ["yaxshi", "яхши"],
      ["yulduz", "юлдуз"],
      ["yo'l", "йўл"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })

  describe("word boundary rules", () => {
    it.each([
      ["ertaga", "эртага"],
      ["Eshik", "Эшик"],
      ["yetti", "етти"],
      ["keldi", "келди"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })

  describe("case preservation", () => {
    it.each([
      ["SALOM", "САЛОМ"],
      ["Salom", "Салом"],
      ["Shirin", "Ширин"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })

  describe("apostrophe normalization", () => {
    it.each([
      ["o`zbek", "ўзбек"],
      ["o'zbek", "ўзбек"],
      ["o'zbek", "ўзбек"],
      ["oʻzbek", "ўзбек"],
      ["O'zbek", "Ўзбек"],
      ["G'az", "Ғаз"],
      ["G`az", "Ғаз"],
      ["A'lo", "Аъло"],
      ["A`lo", "Аъло"],
      ["Ma'no", "Маъно"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })

  describe("protected content", () => {
    it.each([
      ["Sayt: https://example.com", "Сайт: https://example.com"],
      ["Pochta: test@example.com", "Почта: test@example.com"],
      ["Kod: `const x = 1`", "Код: `const x = 1`"],
      ["Men React o'rganyapman", "Мен React ўрганяпман"],
      ["JavaScript dasturlash", "JavaScript дастурлаш"],
      ["(2+2=4)", "(2+2=4)"],
      ["4G", "4G"],
      ["5G", "5G"],
      ["COVID-19", "COVID-19"],
      ["Wi-Fi", "Wi-Fi"],
      ["USA", "USA"],
      ["NATO", "NATO"]
    ])("%s → %s", (input, expected) => {
      expect(toCyrillic(input)).toBe(expected)
    })
  })
})

// =============================================================================
// CYRILLIC TO LATIN
// =============================================================================

describe("toLatin", () => {
  describe("basic conversion", () => {
    it.each([
      ["салом", "salom"],
      ["дунё", "dunyo"],
      ["", ""],
      ["2024 йил", "2024 yil"]
    ])("%s → %s", (input, expected) => {
      expect(toLatin(input)).toBe(expected)
    })
  })

  describe("Uzbek special characters", () => {
    it.each([
      ["ўзбек", "o'zbek"],
      ["ғалаба", "g'alaba"],
      ["ширин", "shirin"],
      ["чой", "choy"],
      ["ранг", "rang"],
      ["қалам", "qalam"],
      ["ҳаво", "havo"]
    ])("%s → %s", (input, expected) => {
      expect(toLatin(input)).toBe(expected)
    })
  })

  describe("compound vowels", () => {
    it.each([
      ["ёмон", "yomon"],
      ["яхши", "yaxshi"],
      ["юлдуз", "yulduz"]
    ])("%s → %s", (input, expected) => {
      expect(toLatin(input)).toBe(expected)
    })
  })

  describe("Russian-specific characters", () => {
    it.each([
      ["щедрый", "shchedryy"],
      ["ты", "ty"],
      ["семья", "sem'ya"],
      ["мать", "mat'"]
    ])("%s → %s", (input, expected) => {
      expect(toLatin(input)).toBe(expected)
    })
  })

  describe("case preservation", () => {
    it.each([
      ["САЛОМ", "SALOM"],
      ["Салом", "Salom"]
    ])("%s → %s", (input, expected) => {
      expect(toLatin(input)).toBe(expected)
    })
  })

  describe("word boundary rules for е", () => {
    it.each([
      ["Европа", "Yevropa"],
      ["елка", "yelka"],
      ["поезд", "poyezd"],
      ["моя", "moya"],
      ["съезд", "s'yezd"],
      ["семья", "sem'ya"],
      ["келди", "keldi"],
      ["мева", "meva"]
    ])("%s → %s", (input, expected) => {
      expect(toLatin(input)).toBe(expected)
    })
  })
})

// =============================================================================
// ROUND-TRIP CONVERSION
// =============================================================================

describe("round-trip conversion", () => {
  it.each([
    ["Salom dunyo"],
    ["O'zbekiston Respublikasi"],
    ["Toshkent shahri"],
    ["Qanday yaxshi"]
  ])("Latin → Cyrillic → Latin: %s", (original) => {
    const cyrillic = toCyrillic(original)
    const backToLatin = toLatin(cyrillic)
    expect(backToLatin.toLowerCase()).toBe(original.toLowerCase())
  })
})

// =============================================================================
// CTX - Contextual logic for Е / Э (Cyrillic to Latin)
// =============================================================================

describe("CTX - Contextual logic for Е / Э", () => {
  it.each([
    ["Ер", "Yer"],
    ["Елим", "Yelim"],
    ["Етук", "Yetuk"],
    ["Мева", "Meva"],
    ["Келажак", "Kelajak"],
    ["Поезд", "Poyezd"],
    ["Океан", "Okean"],
    ["Подъезд", "Pod'yezd"],
    ["Съезд", "S'yezd"],
    ["Уев", "Uyev"],
    ["Бие", "Biye"],
    ["Элемент", "Element"],
    ["Энергия", "Energiya"],
    ["Эътибор", "E'tibor"],
    ["Эълон", "E'lon"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// RUS - Russian & complex characters
// =============================================================================

describe("RUS - Russian & complex characters", () => {
  it.each([
    ["Щетка", "Shchetka"],
    ["Борщ", "Borshch"],
    ["Цех", "Tsex"],
    ["Цирк", "Tsirk"],
    ["Ёлка", "Yolka"],
    ["Ёш", "Yosh"],
    ["Юлдуз", "Yulduz"],
    ["Юбка", "Yubka"],
    ["Янги", "Yangi"],
    ["Яблоко", "Yabloko"],
    ["Ырыс", "Yrys"],
    ["Крыша", "Krysha"],
    ["Июль", "Iyul'"],
    ["Июнь", "Iyun'"],
    ["Сентябрь", "Sentyabr'"],
    ["Октябрь", "Oktyabr'"],
    ["Компьютер", "Komp'yuter"],
    ["Вьюга", "V'yuga"],
    ["Объявление", "Ob'yavleniye"],
    ["Съёмка", "S'yomka"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// GRD - Greedy matching (Latin → Cyrillic)
// =============================================================================

describe("GRD - Greedy matching (Latin → Cyrillic)", () => {
  it.each([
    ["SHoir", "Шоир"],
    ["SHamol", "Шамол"],
    ["CHoy", "Чой"],
    ["CHaman", "Чаман"],
    ["YOz", "Ёз"],
    ["YOmg'ir", "Ёмғир"],
    ["YUlduz", "Юлдуз"],
    ["YUrak", "Юрак"],
    ["YAna", "Яна"],
    ["YAxshi", "Яхши"],
    ["Ashxobod", "Ашхобод"],
    ["Is'hoq", "Исҳоқ"],
    ["Shchuka", "Щука"],
    ["SHCH", "Щ"],
    ["shch", "щ"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// CAS - Case sensitivity
// =============================================================================

describe("CAS - Case sensitivity", () => {
  it.each([
    ["O'zbekiston", "Ўзбекистон"],
    ["O'ZBEKISTON", "ЎЗБЕКИСТОН"],
    ["ShH", "ШҲ"],
    ["YaNGi", "ЯНГи"],
    ["Shch", "Щ"],
    ["SHCH", "Щ"],
    ["sHoir", "шоир"],
    ["SHe'r", "Шеър"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// NRM - Normalization (multiple apostrophe variants)
// =============================================================================

describe("NRM - Normalization", () => {
  it.each([
    ["O'zbek,O'zbek", "Ўзбек,Ўзбек"],
    ["G'az,G'az", "Ғаз,Ғаз"],
    ["A'lo, A'lo", "Аъло, Аъло"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// IMM - Immunity (protected content)
// =============================================================================

describe("IMM - Immunity", () => {
  it.each([
    ["https://webiston.uz", "https://webiston.uz"],
    ["test@gmail.com", "test@gmail.com"],
    ["Men 5G tarmoqdan foydalanaman", "Мен 5G тармоқдан фойдаланаман"],
    ["3G tarmoq", "3G тармоқ"],
    ["React.js loyiha", "React.js лойиҳа"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})
