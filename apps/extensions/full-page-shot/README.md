# To'liq Sahifa Skrinshoti — Webiston

Butun sahifani **bitta** rasmga oladi: scroll qilmaydi, bo'laklarni
yopishtirmaydi, shuning uchun bo'sh joy ham, takrorlangan sticky header ham
qolmaydi. Rasm brauzerdan chiqmaydi.

## Nega boshqacha ishlaydi

Ko'pchilik kengaytmalar sahifani bosqichma-bosqich aylantirib, har safar
ko'rinadigan qismni suratga oladi va bo'laklarni yopishtiradi. Bu texnikaning
narxi bor va u tanish: pastdagi lazy rasmlar hali yuklanmaganligi uchun **bo'sh
tasmalar**, har bo'lakda takrorlangan **sticky header**, va `captureVisibleTab`
sekundiga ~2 marta cheklanganligi uchun **kutish**.

Bu kengaytma o'rniga renderer'dan butun sahifani so'raydi:

1. **Sahifani uyg'otadi** — scroll qilib chiqadi, shunda `loading="lazy"`
   rasmlar ham, IntersectionObserver bilan chiqadigan bloklar ham ishga
   tushadi. Scroll faqat uyg'otish uchun; surat undan olinmaydi.
2. Rasmlar yuklanishini kutadi (qattiq deadline bilan) va o'lchaydi.
3. `captureBeyondViewport` bilan **bir marta** suratga oladi.

**Viewport'ga tegilmaydi — bu ataylab.** Birinchi versiya viewport'ni hujjat
balandligiga tenglashtirgan edi. Lazy yuklashni ishga tushiradi, to'g'ri —
lekin `vh` birliklari viewport'ga qarab hisoblanadi, ya'ni sahifani jimgina
qayta yozadi. O'lchangan: `height:100vh` hero **800px → 2 414px**, hujjat
**2 414px → 6 449px**. To'liq ekranli bo'limi bor har qanday sayt noto'g'ri
tushardi.

`scroll-behavior: smooth` e'lon qilgan sahifalarda oddiy `scrollTo`
animatsiyaga aylanadi va har qadam avvalgisini uzadi — o'lchangan: sikl
oxiriga yetmaydi (**8 tadan 6 ta** reveal ko'rinmay qoladi) va foydalanuvchi
o'z sahifasining **2 970px** pastida qolib ketadi. Shuning uchun har bir
qadam `behavior: "instant"` bilan, ustiga `!important` inline override bilan
bajariladi.

O'lchangan (`lazy` test sahifasida, viewport 900×700):

| | rasmlar yuklangan | reveal ishga tushgan |
| --- | --- | --- |
| Naive | 3 / 8 | 1 / 8 |
| Bu pipeline | **8 / 8** | **8 / 8** |

## Cheklov: ichki panelda scroll qiladigan sahifalar

Gmail, Slack, ko'p dashboard va admin panellar hujjatga `overflow: hidden`
qo'yib, ichkaridagi elementni scroll qiladi. `captureBeyondViewport` HUJJATNI
render qiladi, panelning tashqarisiga chiqqan qismi esa ta'rifi bo'yicha
kesilgan — ya'ni bunday sahifada to'liq surat **texnik jihatdan** olinmaydi.

Biz panelni topamiz va uni aylantiramiz (shunda lazy kontenti yuklanadi),
lekin suratni ko'rinadigan qism bilan cheklaymiz va viewer'da **buni aytamiz**.
Sahifaning `overflow` ini majburan ochib yuborish surat uchun qulay bo'lardi,
lekin bu — yuqoridagi `vh` falokati bilan bir xil sinf: begona layoutni
suratga tushishi uchun o'zgartirish.

O'lchangan (40 ta lazy rasmli app sahifa): oldin hujjat 1200×800, rasmlar
**4/40**, ustiga 4 269ms behuda kutish. Endi **40/40**, 899ms.

## Nima uchun surat doim sahifa boshidan olinadi

`captureBeyondViewport` `position: fixed` va `sticky` bloklarni hujjat
boshidan emas, **joriy scroll pozitsiyasidan** chizadi. Ya'ni sahifaning
400px pastida turib bosilsa, saytning header'i va ikkala sidebar'i rasmda
400px pastda qolib ketadi, ustida esa bo'sh joy — webiston.uz'ning o'zida
o'lchangan.

Shuning uchun uyg'otish bosqichi sahifa **boshida** tugaydi, foydalanuvchining
pozitsiyasi esa hisobotda qaytariladi va **suratdan keyin** tiklanadi.
15 000px dan uzun sahifa bo'laklarga bo'linganda ham fixed header faqat
birinchi bo'lakda chiqadi — o'lchangan.

## Uzun sahifada nima ko'rinadi

Sahifa **butunlay** o'z fon rangi bilan yopiladi va o'rtasida progress
kartochkasi turadi: **haqiqiy** progress — avval scroll pozitsiyasi, keyin
yuklangan rasm / jami rasm.

Yarim shaffof qilib ko'rilgan: 97% da ham och sahifada matn o'qilib turadi, va
ellik marta sakraydigan arvoh baribir flicker. Amplitudaning 3% i bezovtalikning
3% i emas. To'liq yopiq qoplama qotib qolsa sahifa butunlay berkilib qolardi,
shuning uchun overlay `finally` dan tashqari o'zini 15 soniyada o'chiradigan
taymer ham olib yuradi.

Overlay suratdan **oldin** o'zini o'chiradi — aks holda skrinshotning ichiga
tushardi. Undan keyingi bosqichni badge oladi: juda uzun sahifa bo'laklarga
bo'linsa, badge `2/5` deb turadi. Badge — brauzer chromesi, u hech qachon
rasmga tushmaydi.

## Formatlar

Surat **har doim PNG** olinadi (yo'qotishsiz), qolgani viewer'da hosil
qilinadi — format tanlash hech qachon debugger'ga ikkinchi marta borishga
sabab bo'lmaydi.

| | nima uchun |
| --- | --- |
| PNG | asl nusxa, yo'qotishsiz |
| JPEG | kichikroq fayl; shaffof joylar oq matega bo'yaladi |
| PDF | A4 sahifalarga bo'linadi — pochta, chop etish, arxiv uchun |

PDF kutubxonasiz yozilgan (`lib/pdf.ts`): JPEG oqimlari `/DCTDecode` ostida,
xref jadvali qo'lda. jsPDF ~350 kB, bu ~160 qator. O'lchangan: 1200×35 977
surat → **22 sahifa, 0.79 MB, 215ms**, macOS CoreGraphics ochadi.

WebP ataylab yo'q: u veb uchun format, hujjat uchun emas — pochta ilovalari va
Windows dasturlarining bir qismi uni hamon qabul qilmaydi.

## Nega faqat Chromium

Butun hujjatni bir marta render qilishning yagona yo'li — DevTools protokoli,
kengaytma ichida esa unga faqat `chrome.debugger` orqali yetiladi. Firefox'da
bunday API yo'q. Firefox foydalanuvchilari ziyon ko'rmaydi: Firefox buni
o'zi qiladi (o'ng tugma → Take Screenshot → Save full page).

`chrome.debugger` ishlaganda brauzer sariq banner ko'rsatadi. Shuning uchun
qoida qat'iy: **kech ulanish, doim uzilish** — `withDebugger` har qanday
chiqish yo'lida, xato bo'lganda ham, `detach` qiladi.

## Ruxsatlar

`activeTab`, `debugger`, `scripting` — boshqa hech narsa. `downloads` yo'q
(viewer sahifasi `<a download>` bilan o'zi beradi), `storage` yo'q (surat
har doim PNG, JPEG viewer'da hosil qilinadi), `host_permissions` yo'q.

## Ishga tushirish

```bash
pnpm --filter full-page-shot-extension dev     # WXT dev
pnpm --filter full-page-shot-extension build   # .output/chrome-mv3
pnpm --filter full-page-shot-extension zip     # do'kon uchun
```

Qo'lda sinash: `chrome://extensions` → Developer mode → **Load unpacked** →
`.output/chrome-mv3`.
