# Obyektlarni yaratish

Obyektlarni obyekt literallari, `new` kalit so‘zi va `Object.create()` funksiyasi yordamida yaratish mumkin. Quyidagi quyi bo‘limlar har bir usulni batafsil bayon etadi.

## Obyekt literallari

Obyekt yaratishning eng oson yo‘li — bu JavaScript kodingizga obyekt literalini kiritishdir. Eng sodda ko‘rinishida, obyekt literali — bu jingalak qavslar ichiga olingan, vergul bilan ajratilgan va ikki nuqta bilan ajratilgan nom:qiymat juftliklari ro‘yxatidir. Xossa nomi JavaScript identifikatori yoki satr literali bo‘lishi mumkin (bo‘sh satrga ham ruxsat etiladi). Xossa qiymati esa har qanday JavaScript ifodasidir; bu ifodaning qiymati (u primitiv qiymat yoki obyekt qiymati bo‘lishi mumkin) xossaning qiymatiga aylanadi. Quyida bir nechta misollar keltirilgan:

``` js
let empty = {};                         // Xossalari yo‘q obyekt
let point = { x: 0, y: 0 };             // Ikkita sonli xossa
let p2 = { x: point.x, y: point.y+1 };  // Murakkabroq qiymatlar

let book = {
    "main title": "JavaScript",          // Bu xossa nomlari bo‘shliqlar,
    "sub-title": "The Definitive Guide", // va chiziqchalarni o‘z ichiga oladi, shuning uchun satr literallaridan foydalaning.
    for: "all audiences",                // `for` zaxiralangan so‘z, lekin qo'shtirnoqlarsiz.
    author: {                            // Bu xossaning qiymati
        firstname: "David",              // o‘zi ham bir obyekt.
        surname: "Flanagan"
    }
};
```

Obyekt literalidagi oxirgi xossadan keyin ortiqcha vergul qoldirish mumkin va ba’zi dasturlash uslublari bu ortiqcha vergullardan foydalanishni rag‘batlantiradi. Bu kelajakda obyekt literalining oxiriga yangi xossa qo‘shganingizda sintaktik xatolikka yo‘l qo‘yish ehtimolini kamaytiradi.

Obyekt literali — bu har safar bajarilganda yangi va alohida obyekt yaratadigan va initsializatsiya qiladigan ifodadir. Har bir xossaning qiymati literal har safar bajarilganda qayta hisoblanadi. Bu shuni anglatadiki, agar bitta obyekt literali sikl tanasi ichida yoki qayta-qayta chaqiriladigan funksiya ichida kelsa, u ko‘plab yangi obyektlar yaratishi mumkin va bu obyektlarning xossa qiymatlari bir-biridan farq qilishi mumkin.

Bu yerda ko‘rsatilgan obyekt literallari JavaScript'ning eng dastlabki versiyalaridan beri mavjud bo‘lgan oddiy sintaksisdan foydalanadi. Tilning so‘nggi versiyalari bir qator yangi obyekt literali xususiyatlarini kiritgan bo‘lib, ular §6.10-bo‘limda yoritilgan.

## `new` yordamida obyektlarni yaratish

`new` operatori yangi obyekt yaratadi va uni initsializatsiya qiladi. `new` kalit so‘zidan keyin funksiya chaqiruvi kelishi shart. Bu tarzda ishlatilgan funksiya **konstruktor** deb ataladi va yangi yaratilgan obyektni initsializatsiya qilish uchun xizmat qiladi. JavaScriptda o‘zining ichki o‘rnatilgan tiplari uchun ba'zi bir konstruktorlar mavjud. Masalan:

``` js
let o = new Object(); // Bo‘sh obyekt yaratish: `{}` bilan bir xil.
let a = new Array();  // Bo‘sh massiv yaratish: `[]` bilan bir xil.
let d = new Date();   // Hozirgi vaqtni ifodalovchi `Date` obyekti yaratish.
let r = new Map();    // Kalit/qiymat mosligi uchun `Map` obyekti yaratish.
```

Ushbu ichki o‘rnatilgan konstruktorlarga qo‘shimcha ravishda, yangi yaratilgan obyektlarni initsializatsiya qilish uchun o‘zingizning shaxsiy konstruktor funksiyalaringizni ta’riflash keng tarqalgan amaliyotdir. Bu haqida 9-bobda batafsil so‘z yuritiladi.

## Prototiplar

Uchinchi obyekt yaratish usulini ko‘rib chiqishdan oldin, biz bir lahzaga to‘xtab, prototiplarni tushuntirib o‘tishimiz kerak. Deyarli har bir JavaScript obyekti o‘zi bilan bog‘langan ikkinchi bir JavaScript obyektiga ega. Bu ikkinchi obyekt **prototip (`prototype`)** deb nomlanadi va birinchi obyekt xossalarni aynan shu prototipdan meros qilib oladi.

Obyekt literallari orqali yaratilgan barcha obyektlar bir xil prototip obyektiga ega va biz bu prototip obyektiga JavaScript kodida `Object.prototype` orqali murojaat qilishimiz mumkin. `new` kalit so‘zi va konstruktor chaqiruvi yordamida yaratilgan obyektlar esa o‘zlarining prototipi sifatida konstruktor funksiyasining `prototype` xossasining qiymatidan foydalanadi. Shunday qilib, `new Object()` orqali yaratilgan obyekt, xuddi `{}` orqali yaratilgan obyekt kabi, `Object.prototype`'dan meros oladi. Xuddi shunday, `new Array()` orqali yaratilgan obyekt o‘z prototipi sifatida `Array.prototype`'dan, `new Date()` orqali yaratilgan obyekt esa `Date.prototype`'dan foydalanadi.

JavaScript'ni ilk bor o‘rganayotganda bu biroz chalkash tuyulishi mumkin. Yodda tuting: deyarli barcha obyektlar **prototipga** ega, lekin faqat nisbatan kam sonli obyektlargina **`prototype` xossasiga** ega. Aynan shu `prototype` xossasiga ega bo‘lgan obyektlar qolgan barcha obyektlar uchun prototiplarni aniqlab beradi.

`Object.prototype` — bu prototipga ega bo‘lmagan kamyob obyektlardan biridir: u hech qanday xossani meros qilib olmaydi. Boshqa prototip obyektlari esa prototipga ega bo‘lgan oddiy obyektlardir. Ko'p ichki o‘rnatilgan konstruktorlar (va ko'p foydalanuvchi tomonidan yaratilgan konstruktorlar) `Object.prototype`'dan meros oladigan prototipga ega. Masalan, `Date.prototype` xossalarni `Object.prototype`'dan meros qilib oladi, shuning uchun `new Date()` orqali yaratilgan `Date` obyekti xossalarini ham `Date.prototype`'dan, ham `Object.prototype`'dan meros qilib oladi. Prototip obyektlarining bu bog‘langan zanjiri **prototiplar zanjiri (`prototype chain`)** deb nomlanadi.

Xossalarni meros qilib olish qanday ishlashi §6.3.2-bo‘limda tushuntirilgan. 9-bob prototiplar va konstruktorlar o‘rtasidagi bog‘liqlikni yanada batafsil yoritadi: u konstruktor funksiyasini yozish va uning `prototype` xossasini o‘sha konstruktor yordamida yaratilgan "nusxalar" (`instances`) tomonidan ishlatiladigan prototip obyektiga o‘rnatish orqali yangi obyekt "klass"larini qanday ta’riflashni ko‘rsatadi. Va biz §14.3-bo‘limda qanday qilib obyektning prototipini so‘rash (va hatto o‘zgartirish)ni o‘rganamiz.

## `Object.create()`

`Object.create()` yangi obyekt yaratadi va o‘zining birinchi argumentini o‘sha obyektning prototipi sifatida ishlatadi:

``` js
let o1 = Object.create({x: 1, y: 2});   // `o1` obyekti `x` va `y` xossalarini meros qilib oladi.
o1.x + o1.y                             // => 3
```

Prototipga ega bo‘lmagan yangi obyekt yaratish uchun `null` qiymatini uzatishingiz mumkin. Lekin agar shunday qilsangiz, yangi yaratilgan obyekt hech narsani, hatto `toString()` kabi asosiy metodlarni ham meros qilib olmaydi (bu esa uning `+` operatori bilan ham ishlamasligini anglatadi):

``` js
let o2 = Object.create(null); // `o2` hech qanday xossa yoki metodni meros olmaydi.
```

Agar siz oddiy bo‘sh obyekt (`{}` yoki `new Object()` tomonidan qaytariladigan obyekt kabi) yaratmoqchi bo‘lsangiz, `Object.prototype`'ni uzating:

``` js
let o3 = Object.create(Object.prototype); // `o3` xuddi `{}` yoki `new Object()` kabi.
```

Ixtiyoriy prototip bilan yangi obyekt yaratish qobiliyati juda kuchli imkoniyatdir va biz ushbu bob davomida `Object.create()`'dan bir necha joyda foydalanamiz. (`Object.create()` shuningdek, yangi obyektning xossalarini tasvirlaydigan ixtiyoriy ikkinchi argumentni ham qabul qiladi. Bu ikkinchi argument §14.1-bo‘limda yoritiladigan takomillashgan xususiyatlar sirasiga kiradi.)

`Object.create()`'dan foydalaniladigan holatlardan biri — bu siz nazorat qila olmaydigan biror kutubxona funksiyasi tomonidan obyektning beixtiyor (lekin yomon niyatlarsiz) o‘zgartirilishidan himoyalanishni xohlaganingizda yuz beradi. Obyektni funksiyaga to‘g‘ridan-to‘g‘ri uzatish o‘rniga, undan meros oladigan obyektni uzatishingiz mumkin. Agar funksiya bu obyektning xossalarini o‘qisa, u meros qilib olingan qiymatlarni ko‘radi. Biroq agar u xossalarni o‘rnatsa, bu yozishlar asl obyektga ta’sir qilmaydi.

``` js
let o = { x: "bu qiymatni o'zgartirmang" };
library.function(Object.create(o)); // Tasodifiy o‘zgartirishlardan himoyalanish
```

Bu nima uchun ishlashini tushunish uchun, siz JavaScript'da xossalar qanday so‘ralishi va o‘rnatilishini bilishingiz kerak. Bular keyingi bo‘limning mavzularidir.