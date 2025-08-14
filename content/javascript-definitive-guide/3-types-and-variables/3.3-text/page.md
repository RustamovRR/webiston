# Matn

JavaScript'da matnni ifodalash uchun mo‘ljallangan tip **satr (`string`)** deb ataladi. Satr — bu har biri odatda bitta Unicode belgisini ifodalovchi, 16 bitli qiymatlarning o‘zgarmas, tartiblangan ketma-ketligidir. Satrning uzunligi undagi 16 bitli qiymatlar soni bilan o‘lchanadi. JavaScript satrlari (va massivlari) noldan boshlanuvchi indeksatsiyadan foydalanadi: birinchi 16 bitli qiymat 0-indeksda, ikkinchisi 1-indeksda va hokazo. _Bo‘sh satr_ — bu uzunligi 0 ga teng bo‘lgan satrdir. JavaScript'da satrning bitta elementini ifodalovchi maxsus tip mavjud emas. Bitta 16 bitli qiymatni ifodalash uchun shunchaki uzunligi 1 ga teng bo‘lgan satrdan foydalaniladi.

<Callout type="info">
### Belgilar, Kod nuqtalari va JavaScript satrlari

JavaScript Unicode belgilar to‘plamining UTF-16 kodlash usulidan foydalanadi va JavaScript satrlari ishorasiz 16 bitli qiymatlar ketma-ketligidir. Eng ko‘p ishlatiladigan Unicode belgilari ("asosiy ko‘p tilli sath"dan olinganlar) 16 bitga sig‘adigan kod nuqtalariga (`codepoints`) ega va ular satrning bitta elementi bilan ifodalanishi mumkin. Kod nuqtalari 16 bitga sig‘maydigan Unicode belgilari esa UTF-16 qoidalariga binoan, ikki 16 bitli qiymatdan iborat ketma-ketlik (**"surrogat juftlik" (`surrogate pair`)** deb ataladi) sifatida kodlanadi. Bu shuni anglatadiki, uzunligi 2 ga teng bo‘lgan (ikkita 16 bitli qiymatdan iborat) JavaScript satri aslida faqat bitta Unicode belgisini ifodalashi mumkin:

```js
let euro = "€";
let love = "❤";
euro.length // => 1: bu belgi bitta 16-bitli elementga ega
love.length // => 2: `❤` belgisining UTF-16 kodlanishi "\ud83d\udc99"
```

JavaScript taqdim etadigan ko'plab satrlar ustida ishlovchi metodlar belgilar ustida emas, balki 16 bitli qiymatlar ustida amal bajaradi. Ular surrogat juftliklarga maxsus munosabatda bo‘lmaydi, satrni normalizatsiya qilmaydi va hatto satrning to‘g‘ri formatlangan UTF-16 ekanligini ham tekshirmaydi.

Biroq ES6'dan boshlab satrlar _iteratsiya qilinadigan (iterable)_ hisoblanadi. Agar siz satr bilan `for/of` sikli yoki `...` operatoridan foydalansangiz, u 16 bitli qiymatlar bo‘ylab emas, balki satrning haqiqiy belgilari bo‘ylab iteratsiya qiladi.
</Callout>

## Satr literallari

JavaScript dasturiga satr kiritish uchun satr belgilarini bir-biriga mos keladigan bir tirnoq, qo‘shtirnoq yoki teskari tirnoq (`'` yoki `"` yoki `` ` ``) juftligi ichiga olish kifoya. Qo‘shtirnoq va teskari tirnoq belgilari bir tirnoq bilan chegaralangan satrlar ichida, xuddi shunday boshqa holatlar uchun ham, ishlatilishi mumkin. Quyida satr literallariga misollar keltirilgan:

``` js
""                               // Bo‘sh satr: u nolga teng belgiga ega
'testing'
"3.14"
'name="myform"'
"Wouldn't you prefer O'Reilly's book?"
"τ is the ratio of a circle's circumference to its radius"
`"She said 'hi'", he said.`
```

Teskari tirnoqlar (backticks) bilan chegaralangan satrlar ES6 xususiyati bo‘lib, ular JavaScript ifodalarini satr literali ichiga **joylashtirish (embedding)** yoki **interpolyatsiya qilish (interpolation)** imkonini beradi. Bu ifoda interpolyatsiyasi sintaksisi §3.3.4-bo‘limda yoritilgan.

JavaScript'ning dastlabki versiyalari satr literallarini bitta qatorda yozishni talab qilardi va ko‘pincha `+` operatori yordamida bir qatorli satrlarni birlashtirib, uzun satrlar hosil qiladigan JavaScript kodini uchratish mumkin. Biroq ES5'dan boshlab, siz oxirgisidan tashqari har bir qatorni teskari slesh (`\`) bilan yakunlab, satr literalini bir necha qatorga bo‘lib yozishingiz mumkin. Bunda na teskari slesh, na undan keyingi qator yakunlovchisi satr literalining bir qismi hisoblanadi. Agar bir tirnoqli yoki qo‘shtirnoqli satr literaliga yangi qator belgisini kiritish kerak bo‘lsa, `\n` belgilar ketma-ketligidan foydalaning (bu keyingi bo‘limda batafsil yoritilgan). ES6'ning teskari tirnoq sintaksisi satrlarni bir necha qatorga bo‘lishga imkon beradi va bu holda qator yakunlovchilari satr literalining bir qismi bo‘lib qoladi:

``` js
// Bir qatorda yozilgan 2 qatorli satr:
'two\nlines'

// 3 qatorda yozilgan bir qatorli satr:
"one\
long\
line"

// Ikki qatorda yozilgan ikki qatorli satr:
`the newline character at the end of this line
is included literally in this string`
```

Shuni yodda tutingki, satrlaringizni chegaralash uchun bir tirnoqdan foydalanganda, ingliz tilidagi _can't_ va _O'Reilly's_ kabi qisqartmalar va egalik qo‘shimchalariga ehtiyot bo‘lishingiz kerak. Chunki apostrof belgisi bir tirnoq belgisi bilan bir xil. Shuning uchun bir tirnoqli satrlar ichida keladigan har qanday apostrofni "ekranlash" (escape) uchun teskari slesh (`\`) belgisidan foydalanishingiz kerak (ekranlash keyingi paragrafda tushuntiriladi).

Klient tomonidagi JavaScript dasturlashida, JavaScript kodi HTML kodi satrlarini, HTML kodi esa JavaScript kodi satrlarini o‘z ichiga olishi mumkin. JavaScript kabi, HTML ham o‘z satrlarini chegaralash uchun bir tirnoq yoki qo‘shtirnoqdan foydalanadi. Shuning uchun, JavaScript va HTML'ni birgalikda ishlatganda, JavaScript uchun bir uslubdagi tirnoqlarni, HTML uchun esa boshqa uslubdagisini ishlatish yaxshi fikrdir. Quyidagi misolda, "Thank you" satri JavaScript ifodasi ichida bir tirnoqqa olingan, bu ifodaning o‘zi esa HTML'ning _event-handler_ atributi ichida qo‘shtirnoqqa olingan:

``` html
<button onclick="alert('Thank you')">Click Me</button>
```

## Satr literallarida qochish ketma-ketliklari

Teskari slesh (`\`) belgisi JavaScript satrlarida maxsus vazifaga ega. U o‘zidan keyin kelgan belgi bilan birgalikda, satr ichida boshqa yo‘l bilan ifodalab bo‘lmaydigan belgini ifodalaydi. Masalan, `\n` — bu yangi qator belgisini ifodalovchi qochish ketma-ketligidir.

Avvalroq aytib o‘tilgan yana bir misol — bu `\'` qochish ketma-ketligi bo‘lib, u bir tirnoq (yoki apostrof) belgisini ifodalaydi. Bu qochish ketma-ketligi bir tirnoqlar ichiga olingan satr literaliga apostrof kiritish kerak bo‘lganda juda foydalidir. Nima uchun ularning "qochish ketma-ketliklari" deb atalishini tushunishingiz mumkin: teskari slesh sizga bir tirnoq belgisining odatiy talqinidan "qochib qutulish" imkonini beradi. Uni satr oxirini belgilash uchun ishlatish o‘rniga, siz uni apostrof sifatida ishlatasiz:

```js
'You\'re right, it can\'t be a quote'
```

3-1-jadvalda JavaScript qochish ketma-ketliklari va ular ifodalaydigan belgilar ro‘yxati keltirilgan.

Uchta qochish ketma-ketligi umumiy bo‘lib, ular har qanday belgini uning Unicode belgi kodini o‘n oltilik sanoq tizimidagi son sifatida ko‘rsatish orqali ifodalash uchun ishlatilishi mumkin. Masalan, \xA9 ketma-ketligi mualliflik huquqi belgisini ifodalaydi, uning Unicode kodlanishi o‘n oltilik A9 soni bilan berilgan. Xuddi shunday, \u qochish ketma-ketligi to‘rtta o‘n oltilik raqam bilan yoki raqamlar jingalak qavslar ichiga olinganda birdan beshgacha raqam bilan ko‘rsatilgan ixtiyoriy Unicode belgisini ifodalaydi: masalan, \u03c0 belgisi π ni ifodalaydi, \u{1f600} esa "irshayib turgan yuz" emojisini ifodalaydi.

_3-1-jadval. JavaScript qochish ketma-ketliklari_
| Ketma-ketlik | Ifodalaydigan belgi |
|--------------|--------------------|
| `\0`         | NUL belgisi (`\u0000`) |
| `\b`         | Orqaga qaytish (Backspace, `\u0008`) |
| `\t`         | Gorizontal tabulyatsiya (`\u0009`) |
| `\n`         | Yangi qator (`\u000A`) |
| `\v`         | Vertikal tabulyatsiya (`\u000B`) |
| `\f`         | Sahifani o‘tkazish (Form feed, `\u000C`) |
| `\r`         | Karetka qaytishi (`\u000D`) |
| `\"`         | Qo‘shtirnoq (`\u0022`) |
| `\'`         | Apostrof yoki bir tirnoq (`\u0027`) |
| `\\`         | Teskari slesh (`\u005C`) |
| `\xnn`       | Ikkita o‘n oltilik `nn` raqami bilan belgilangan Unicode belgisi |
| `\unnnn`     | To‘rtta o‘n oltilik `nnnn` raqami bilan belgilangan Unicode belgisi |
| `\u{n}`      | `n` kod nuqtasi bilan belgilangan Unicode belgisi, bunda `n` 0 dan `10FFFF` gacha bo‘lgan birdan oltitagacha o‘n oltilik raqamdir (ES6) |

Agar \ belgisi 3-1-jadvalda ko‘rsatilganlardan boshqa har qanday belgidan oldin kelsa, teskari slesh shunchaki e’tiborsiz qoldiriladi (garchi, albatta, tilning kelajakdagi versiyalari yangi qochish ketma-ketliklarini aniqlashi mumkin). Masalan, \# belgisi # bilan bir xil. Va nihoyat, avvalroq aytib o‘tilganidek, ES5 satr literalini bir necha qatorga bo‘lish uchun qator uzilishidan oldin teskari slesh qo‘yishga ruxsat beradi.
