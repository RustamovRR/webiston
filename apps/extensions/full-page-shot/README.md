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

## O'lchamlar: hamma chegara QURILMA pikselida

`Page.captureScreenshot` rasmni varaqning device pixel ratio'sida qaytaradi.
O'lchangan: haqiqiy DPR-2 brauzerda `1512x8000` CSS clip **3024x16000** PNG
bo'lib qaytdi, `clip.scale` 1 bo'lsa ham. Ya'ni Retina ekranda surat
allaqachon to'liq tiniqlikda — 1x emas.

Shundan kelib chiqib `limits.ts` dagi barcha chegaralar qurilma pikselida
hisoblanadi. Avval ular CSS pikseliga qo'llangan edi, ya'ni har qanday Retina
mashinada **aynan 2 barobar** xato: 35 977px sahifa "clamped emas" deb
belgilanardi, keyin bo'laklari o'zidan ikki barobar kichik canvas'ga
yopishtirilardi. Bitta bo'lakka sig'adigan sahifalarda bu ko'rinmagan.

O'lchangan chegara: 48 000 qurilma pikselda pastki tasma hamon 162 xil rang,
71 954 da esa **1 xil rang** — ya'ni bo'sh. Bo'lak byudjeti 30 000 qurilma
piksel.

## Klip qayerdan boshlanishi muhim

`captureBeyondViewport` ikkita xatti-harakati bor va ikkalasi ham klipning
BOSHLANISH nuqtasiga bog'liq:

1. **`y=0` dan boshlanib hujjat oxiriga yetgan klip** oxirgi ekranini sahifaning
   TEPASI bilan chizadi — ya'ni surat oxirida sahifa qaytadan boshlanadi.
   O'lchangan (webiston.uz kitob sahifasi, 9 079px):

   | klip | natija |
   | --- | --- |
   | `0..H` | buzuq |
   | `0..H−1` | buzuq |
   | klipsiz (butun sahifa) | buzuq |
   | `y=1..H` | buzuq |
   | `y=6000..H` | **to'g'ri** |
   | `y=H−900, h=900` | **to'g'ri** |

2. **`position: sticky` va `fixed` bloklar klipning boshiga muhrlanadi.**
   Ya'ni birinchidan keyingi har bir bo'lakda sayt header'i o'sha joydagi
   haqiqiy kontent ustiga bosiladi.

Shuning uchun 4 ekрandan uzun sahifada dum **oxirgi ikki ekranni** o'z klipida
oladi, va u **bitta ekran ilgaridan** boshlanadi — o'sha ilgari qism
yopishtirishda tashlab yuboriladi, muhr esa aynan o'sha yerga tushadi.

`H − viewport` da bo'lish yetmaydi: bu nuqta aynan maksimal scroll, va muhr
baribir chiqadi — sinab ko'rilgan.

**Cheklov, halol aytilgan:** 4 ekрandan qisqa sahifada bunday bo'lish mumkin
emas (na dum oxirgi ekрandan qochadi, na uning boshlanishi folddan pastga
tushadi). Bunday sahifalarda bitta klip ishlatiladi. Sticky header va sticky
yon paneli bor 2.0 va 6.4 ekрanlik sahifalarda o'lchandi — toza. Nuqson
balandlikdan emas, ilovaning renderga qanday javob berishidan kelib chiqadi.

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

## Sahifada nima ko'rinadi

Sahifa **scroll bo'ladi**, ko'rinadigan holda — yashirilmaydi, qoraytirilmaydi.
Ustida yagona narsa: viewport tepasidan o'tgan **4 piksellik chiziq**, u
progressni ko'rsatadi. Yozuv ham, kartochka ham yo'q: sahifaning harakati
"ishlayapti" deydi, chiziq esa "qanchasi qoldi" deydi.

Bu uchinchi urinish, va avvalgi ikkitasi noto'g'ri edi. Yopqich (butun
sahifani berkitadigan qatlam) scroll'ni yashirardi — lekin `position: fixed`
qatlam suratning ichiga tushadi, ya'ni u zatvor paytida ekrandan ketishi
kerak. Ketganda esa progress ikkiga bo'linib, ikkita alohida oynadek
ko'rinardi. Pilpillaydigan to'liq qoraytirish oddiy scroll'dan xunukroq.

Chiziq suratga tushmasligi uchun u **rasmdan** olib tashlanadi, ekrandan
emas: zatvor davomida turaveradi, keyin bir marta tushirilib **tepadagi 8
piksel** alohida olinadi va yig'ishda ustiga qo'yiladi. O'lchangan uzilish —
**32ms**, ya'ni bir kadr.

O'lchangan (haqiqiy sahifa): to'ldirish 55 → 202 → 384 → 720px, 4px
balandlikda; 2 klip 1 142ms chiziq **ustida**; rasmning tepasi tekshirildi —
chiziq unda yo'q.

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
xref jadvali qo'lda. jsPDF ~350 kB, bu ~230 qator. O'lchangan: 1200×35 977
surat → **22 sahifa, 0.79 MB, 215ms**, macOS CoreGraphics ochadi.

Sahifa chegarasi qat'iy oraliqda emas: ideal nuqtaning atrofidagi 12% ichida
eng **tinch** qator qidiriladi (eng och va eng to'q piksel orasidagi farq eng
kichik bo'lgani) va kesim o'sha yerga suriladi. Shuning uchun chegara matn
qatorining o'rtasidan emas, satrlar orasidan o'tadi. Kesim faqat **oldinga**
suriladi, ya'ni hech bir sahifa varaqdan oshib ketmaydi. Haqiqiy sahifada
o'lchandi: sahifa balandliklari 4276 emas, **[4130, 4276, 3951, 4276, 1525]**.

PDF ichidagi matn **qidirilmaydi** — bu surat, bosma emas. Matnli PDF
`Page.printToPDF` bilan olinadi, lekin u sahifaning bosma CSS'ini ishlatadi va
siz ko'rgan narsaga o'xshamaydi. Bu vosita ko'rganingizni beradi.

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
