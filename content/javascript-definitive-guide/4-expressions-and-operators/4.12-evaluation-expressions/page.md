# Bajarish (`Evaluation`) ifodalari

Ko‘plab interpretatsiya qilinadigan tillar singari, JavaScript ham JavaScript manba kodi satrlarini interpretatsiya qilish, ularni bajarib, qiymat hosil qilish qobiliyatiga ega. JavaScript bu ishni global `eval()` funksiyasi yordamida amalga oshiradi:

``` js
eval("3+2")  // => 5
```

Manba kodi satrlarini dinamik ravishda bajarish kuchli til xususiyati bo‘lib, amalda deyarli hech qachon zarur bo‘lmaydi. Agar siz `eval()`'dan foydalanayotgan bo‘lsangiz, uni ishlatishga haqiqatan ham ehtiyoj bor-yo‘qligi haqida jiddiy o‘ylab ko‘rishingiz kerak.

Xususan, `eval()` xavfsizlik uchun zaiflik (`security hole`) bo‘lishi mumkin va siz hech qachon foydalanuvchi kiritgan ma’lumotlardan olingan biror satrni `eval()`'ga uzatmasligingiz kerak. JavaScript kabi murakkab tilda, foydalanuvchi kiritgan ma’lumotni `eval()` bilan xavfsiz ishlatish uchun uni "tozalash"ning (`sanitize` qilishning) iloji yo‘q. Aynan shu xavfsizlik muammolari tufayli, ba’zi veb-serverlar butun bir veb-sayt uchun `eval()`'ni o‘chirib qo‘yish maqsadida HTTP "Content-Security-Policy" sarlavhasidan foydalanadi.

Keyingi quyi mavzular `eval()`'ning asosiy ishlatilishini tushuntiradi va uning optimizatorga kamroq ta’sir ko‘rsatadigan ikkita cheklangan versiyasini yoritib beradi.

<Callout type='info'>

### `eval()` — Funksiyami yoki Operator?

`eval()` — bu funksiya, lekin u ifodalar haqidagi ushbu bobga kiritilgan, chunki u aslida operator bo‘lishi kerak edi. Tilning eng dastlabki versiyalari `eval()` funksiyasi tilning eng dastlabki versiyalaridanoq mavjud edi va o‘shandan beri til dizaynerlari hamda interpretator yaratuvchilari uni tobora operatorga o‘xshatib boradigan cheklovlar joriy qilib kelishmoqda.

Zamonaviy JavaScript interpretatorlari ko‘plab kod tahlili va optimizatsiyasini amalga oshiradi. Umumiy qilib aytganda, agar biror funksiya `eval()`'ni chaqirsa, interpretator o‘sha funksiyani optimizatsiya qila olmaydi. `eval()`'ni funksiya sifatida e'lon qilishning muammosi shundaki, unga boshqa nomlar berish mumkin:

``` js
let f = eval;
let g = f;
```

Agar bunga yo‘l qo‘yilsa, interpretator qaysi funksiyalar `eval()`'ni chaqirishini aniq bila olmaydi, shuning uchun u agressiv optimizatsiya qila olmaydi. Agar `eval()` operator (va zaxiralangan so‘z) bo‘lganida, bu muammoning oldini olish mumkin edi. Biz `eval()`'ni operatorga o‘xshatish uchun unga qo‘yilgan cheklovlar haqida (§4.12.2 va §4.12.3-bo‘limlarda) o‘rganamiz.
</Callout>

## `eval()`

`eval()` bitta argument kutadi. Agar siz unga satrdan boshqa har qanday qiymatni uzatsangiz, u shunchaki o‘sha qiymatni qaytaradi. Agar satr uzatsangiz, u satrni JavaScript kodi sifatida tahlil qilishga (`parse`) harakat qiladi va agar bu muvaffaqiyatsiz bo‘lsa, `SyntaxError` xatoligiga sabab bo‘ladi. Agar u satrni muvaffaqiyatli tahlil qilsa, u holda kodni bajaradi va satrdagi oxirgi ifoda yoki ko‘rsatmaning qiymatini qaytaradi. Agar oxirgi ifoda yoki ko‘rsatma qiymatga ega bo‘lmasa, `undefined` qaytaradi. Agar bajarilayotgan satr istisno (`exception`) yuzaga keltirsa, bu istisno `eval()` chaqiruvidan tashqariga uzatiladi.

`eval()`'ning (shu tarzda chaqirilganda) asosiy jihati shundaki, u o‘zini chaqirayotgan kodning **o‘zgaruvchilar muhitidan (`variable environment`)** foydalanadi. Ya’ni, u xuddi lokal kod kabi o‘zgaruvchilarning qiymatlarini qidiradi hamda yangi o‘zgaruvchilar va funksiyalarni aniqlaydi. Agar biror funksiya `x` lokal o‘zgaruvchisini aniqlasa va keyin `eval("x")`'ni chaqirsa, u lokal o‘zgaruvchining qiymatini oladi. Agar u `eval("x=1")`'ni chaqirsa, u lokal o‘zgaruvchining qiymatini o‘zgartiradi. Va agar funksiya `eval("var y = 3;")`'ni chaqirsa, u yangi `y` lokal o‘zgaruvchisini e’lon qiladi. Boshqa tomondan, agar bajarilayotgan satr `let` yoki `const`'dan foydalansa, e’lon qilingan o‘zgaruvchi yoki konstanta bajarilishning o‘zi uchun lokal bo‘ladi va chaqiruvchi muhitda aniqlanmaydi.

Xuddi shunday, funksiya quyidagi kabi kod bilan lokal funksiya e’lon qilishi mumkin:

``` js
eval("function f() { return x+1; }");
```

Agar siz `eval()`'ni eng yuqori darajadagi koddan chaqirsangiz, u, albatta, global o‘zgaruvchilar va global funksiyalar ustida ishlaydi.

E’tibor bering, siz `eval()`'ga uzatadigan kod satri o‘z-o‘zidan sintaktik ma’noga ega bo‘lishi kerak: siz undan kod parchalarini funksiyaga "yopishtirish" uchun foydalana olmaysiz. Masalan, `eval("return;")` deb yozishning ma’nosi yo‘q, chunki `return` faqat funksiyalar ichida ishlatilishi mumkin va bajarilayotgan satrning chaqiruvchi funksiya bilan bir xil o‘zgaruvchilar muhitidan foydalanishi uni o‘sha funksiyaning bir qismiga aylantirib qo‘ymaydi. Agar sizning satringiz mustaqil skript sifatida (hatto `x=0` kabi juda qisqa bo‘lsa ham) ma’noga ega bo‘lsa, uni `eval()`'ga uzatish mumkin. Aks holda, `eval()` `SyntaxError` xatoligiga sabab bo‘ladi.

## Global `eval()`

Aynan `eval()`'ning lokal o‘zgaruvchilarni o‘zgartirish qobiliyati JavaScript optimizatorlari uchun anchayin muammolidir. Bunga yechim sifatida, interpretatorlar shunchaki `eval()`'ni chaqiradigan har qanday funksiyada kamroq optimizatsiya qiladi. Lekin, agar skript `eval()` uchun taxallus (`alias`) aniqlasa va keyin bu funksiyani boshqa nom bilan chaqirsa, JavaScript interpretatori nima qilishi kerak?

JavaScript spetsifikatsiyasi `eval()` "eval"dan boshqa har qanday nom bilan chaqirilganda, u satrni xuddi eng yuqori darajadagi global koddek bajarishi kerakligini belgilaydi. Bajarilayotgan kod yangi global o‘zgaruvchilar yoki global funksiyalarni aniqlashi va global o‘zgaruvchilarni o‘rnatishi mumkin, lekin u chaqiruvchi funksiyaga lokal bo‘lgan hech qanday o‘zgaruvchidan foydalanmaydi yoki ularni o‘zgartirmaydi va shuning uchun lokal optimizatsiyalarga xalaqit bermaydi.

**"To‘g‘ridan-to‘g‘ri `eval`" (`direct eval`)** — bu `eval()` funksiyasiga aniq, hech qanday qo‘shimchalarsiz "eval" nomidan foydalanadigan ifoda bilan qilingan chaqiruvdir (bu nom zaxiralangan so‘zdek tuyula boshlaydi). `eval()`'ga to‘g‘ridan-to‘g‘ri qilingan chaqiruvlar chaqiruvchi kontekstning o‘zgaruvchilar muhitidan foydalanadi. Boshqa har qanday chaqiruv — **bilvosita chaqiruv (`indirect call`)** — o‘zining o‘zgaruvchilar muhiti sifatida global obyektni ishlatadi va lokal o‘zgaruvchilar yoki funksiyalarni o‘qiy olmaydi, yoza olmaydi yoki aniqlay olmaydi. (Ham to‘g‘ridan-to‘g‘ri, ham bilvosita chaqiruvlar yangi o‘zgaruvchilarni faqat `var` bilan aniqlashi mumkin. Bajarilayotgan satr ichidagi `let` va `const`'dan foydalanish bajarilishning o‘zi uchun lokal bo‘lgan o‘zgaruvchilar va konstantalar yaratadi va chaqiruvchi yoki global muhitni o‘zgartirmaydi.)

Quyidagi kod buni namoyon etadi:

``` js
const geval = eval;      // Boshqa nomdan foydalanish global `eval`'ni amalga oshiradi
let x = "global", y = "global"; // Ikkita global o‘zgaruvchi

function f() {           // Bu funksiya lokal `eval` qiladi
    let x = "local";     // Lokal o‘zgaruvchini aniqlaymiz
    eval("x += 'changed';"); // To‘g‘ridan-to‘g‘ri `eval` lokal o‘zgaruvchini o‘zgartiradi
    return x;            // O‘zgartirilgan lokal o‘zgaruvchini qaytaramiz
}

function g() {           // Bu funksiya global `eval` qiladi
    let y = "local";     // Lokal o‘zgaruvchi
    geval("y += 'changed';"); // Bilvosita `eval` global o‘zgaruvchini o‘zgartiradi
    return y;            // O‘zgartirilmagan lokal o‘zgaruvchini qaytaramiz
}

console.log(f(), x); // Lokal o‘zgaruvchi o‘zgargan: "localchanged global" ni chiqaradi
console.log(g(), y); // Global o‘zgaruvchi o‘zgargan: "local globalchanged" ni chiqaradi
```

E’tibor bering, global `eval` qilish qobiliyati nafaqat optimizator ehtiyojlariga moslashishdir; bu aslida kod satrlarini xuddi ular mustaqil, eng yuqori darajadagi skriptlar kabi bajarishga imkon beruvchi juda foydali xususiyatdir. Ushbu mavzuning boshida ta’kidlanganidek, kod satrini haqiqatan ham bajarishga kamdan-kam ehtiyoj tug‘iladi. Lekin agar buni zarur deb topsangiz, sizga lokal `eval`'dan ko‘ra global `eval` qilish ehtimoli ko‘proq kerak bo‘ladi.

## Qat’iy rejimdagi `eval()`

Qat’iy rejim (`strict mode`, §5.6.3-bo‘limga qarang) `eval()` funksiyasining xatti-harakatiga va hatto "eval" identifikatorining ishlatilishiga qo‘shimcha cheklovlar yuklaydi. `eval()` qat’iy rejimdagi koddan chaqirilganda yoki bajarilishi kerak bo‘lgan kod satrining o‘zi "use strict" direktivasi bilan boshlanganda, `eval()` xususiy o‘zgaruvchilar muhiti bilan lokal `eval`'ni amalga oshiradi. Bu shuni anglatadiki, qat’iy rejimda bajarilayotgan kod lokal o‘zgaruvchilarni so‘rashi va o‘rnatishi mumkin, lekin u lokal ko‘rinish doirasida **yangi o‘zgaruvchilar yoki funksiyalarni aniqlay olmaydi**.

Bundan tashqari, qat’iy rejim "eval"ni amalda zaxiralangan so‘zga aylantirish orqali `eval()`'ni yanada ko'proq operatorga o‘xshash qilib qo‘yadi. Sizga `eval()` funksiyasini yangi qiymat bilan qayta yozishga ruxsat berilmaydi. Shuningdek, "eval" nomi bilan o‘zgaruvchi, funksiya, funksiya parametri yoki `catch` bloki parametrini e’lon qilishga ruxsat berilmaydi.