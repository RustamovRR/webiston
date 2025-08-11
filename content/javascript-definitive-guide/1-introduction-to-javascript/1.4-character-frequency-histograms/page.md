# Misol: Belgilar chastotasi gistogrammalari

Bu bob qisqa, biroq jiddiy JavaScript dasturi bilan yakunlanadi. 1-1-misol — bu standart kiritishdan matnni o‘qiydigan, ushbu matndan belgilar chastotasi gistogrammasini hisoblaydigan va so‘ngra gistogrammani konsolga chiqaradigan Node dasturidir. Siz dasturni o‘zining manba kodidagi belgilar chastotasini tahlil qilish uchun quyidagicha ishga tushirishingiz mumkin:

```bash
$ node charfreq.js < charfreq.js
T: ########### 11.22%
E: ########## 10.15%
R: ####### 6.68%
S: ###### 6.44%
A: ###### 6.16%
N: ###### 5.81%
O: ##### 5.45%
I: ##### 4.54%
H: #### 4.07%
C: ### 3.36%
L: ### 3.20%
U: ### 3.08%
/: ### 2.88%
```

Bu misol JavaScript’ning bir qator takomillashgan xususiyatlaridan foydalanadi va real hayotdagi JavaScript dasturlari qanday ko'rinishda bo'lishini namoyish etishga mo'ljallangan. Hozircha barcha kodni tushunmasligingiz mumkin, va bu tabiiy. Lekin ishonchingiz komil bo'lsinki, uning barchasi keyingi boblarda tushuntiriladi.

_1-1 misol. JavaScript yordamida belgilar chastotasi gistogrammalarini hisoblash_

```js
/**
 * Bu Node dasturi standart kiritishdan matnni o'qiydi, ushbu matndagi
 * har bir harfning chastotasini hisoblaydi va eng ko'p ishlatiladigan
 * belgilarning gistogrammasini ko'rsatadi. Ishga tushirish uchun Node 12
 * yoki undan yuqori versiya talab qilinadi.
 *
 * Unix tipidagi muhitda dasturni quyidagicha ishga tushirishingiz mumkin:
 *   node charfreq.js < corpus.txt
 */

// Bu klass `Map`ni kengaytiradi, natijada `get()` metodi agar kalit
// map’da mavjud bo'lmasa, `null` o'rniga standart qiymatni qaytaradi.
class DefaultMap extends Map {
  constructor(defaultValue) {
    super() // Ota-klass konstruktorini chaqirish.
    this.defaultValue = defaultValue // Standart qiymatni saqlab qo‘yish.
  }

  get(key) {
    if (this.has(key)) {
      // Agar kalit map'da mavjud bo‘lsa,
      return super.get(key) // ota-klassdan uning qiymatini qaytarish.
    } else {
      return this.defaultValue // Aks holda, standart qiymatni qaytarish
    }
  }
}

// Bu klass harflar chastotasi gistogrammalarini hisoblaydi va ko'rsatadi.
class Histogram {
  constructor() {
    this.letterCounts = new DefaultMap(0) // Harflarni o‘z sanog‘iga moslashtiruvchi Map.
    this.totalLetters = 0 // Umumiy harflar soni.
  }

  // Bu funksiya gistogrammani matndagi harflar bilan yangilaydi.
  add(text) {
    // Matndagi bo'shliqlarni olib tashlash va barcha harflarni kattasiga o'tkazish.
    text = text.replace(/\s/g, '').toUpperCase()

    // Endi matndagi belgilar bo‘ylab sikl orqali o‘tish.
    for (let character of text) {
      let count = this.letterCounts.get(character) // Avvalgi sanog‘ini olish.
      this.letterCounts.set(character, count + 1) // Sanog‘ini bittaga oshirish.
      this.totalLetters++
    }
  }

  // Gistogrammani ASCII-grafik ko‘rinishidagi satrga aylantirish.
  toString() {
    // Map'ni `[kalit, qiymat]` ko‘rinishidagi massivlardan iborat massivga o‘tkazish.
    let entries = [...this.letterCounts]

    // Massivni avval sanog‘i bo‘yicha, so‘ng alifbo tartibida saralash
    entries.sort((a, b) => {
      // Saralash tartibini aniqlaydigan funksiya.
      if (a[1] === b[1]) {
        // Agar hisoblar bir xil bo'lsa
        return a[0] < b[0] ? -1 : 1 // alifbo bo'yicha saralash
      } else {
        // Aks holda,
        return b[1] - a[1] // eng katta sanoq bo‘yicha saralash.
      }
    })

    // Sanoqlarni foizlarga aylantirish
    for (let entry of entries) {
      entry[1] = (entry[1] / this.totalLetters) * 100
    }

    // Qiymati 1% dan kam bo‘lgan yozuvlarni olib tashlash.
    entries = entries.filter((entry) => entry[1] >= 1)

    // Endi har bir yozuvni matnli satrga aylantirish
    let lines = entries.map(([l, n]) => `${l}: ${'#'.repeat(Math.round(n))} ${n.toFixed(2)}%`)

    // Va satrlarni yangi qator (`\n`) belgisi bilan ajratilgan holda birlashtirib qaytarish.
    return lines.join('\n')
  }
}

// Bu asinxron (Promise qaytaruvchi) funksiya `Histogram` obyektini yaratadi,
// standart kiritishdan matn qismlarini (`chunks`) asinxron o'qiydi va ularni
// gistogrammaga qo'shadi. Oqim oxiriga yetganda, u ushbu gistogrammani qaytaradi.
async function histogramFromStdin() {
  process.stdin.setEncoding('utf-8') // Baytlar emas, Unicode satrlarini o'qish
  let histogram = new Histogram()
  for await (let chunk of process.stdin) {
    histogram.add(chunk)
  }
  return histogram
}

// Mana bu so‘nggi bir qator kod — dasturning asosiy tanasi.
// U standart kiritishdan `Histogram` obyekti yaratadi, so‘ng gistogrammani konsolga chiqaradi.
histogramFromStdin().then((histogram) => {
  console.log(histogram.toString())
})
```
