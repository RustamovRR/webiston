# Turli xil operatorlar

JavaScript keyingi mavzularda keltirib o'tiladigan bir qator boshqa turli xil operatorlarni ham qo‘llab-quvvatlaydi.

## Shartli operator (`?:`)

Shartli operator JavaScript'dagi yagona **uchlik (`ternary`)** operatordir (uchta operandli) va ba’zan u aslida _ternar operator_ deb ham ataladi. Bu operator ba’zan `?:` kabi yoziladi, garchi u kodda aynan shunday ko‘rinmasa ham. Bu operator uchta operandga ega bo‘lgani uchun, birinchisi `?`'dan oldin, ikkinchisi `?` va `:` orasida, uchinchisi esa `:`'dan keyin keladi. U quyidagicha ishlatiladi:

``` js
x > 0 ? x : -x // x'ning absolut qiymati
```

Shartli operatorning operandlari har qanday tipda bo‘lishi mumkin. Birinchi operand bajariladi va mantiqiy qiymat sifatida talqin qilinadi. Agar birinchi operandning qiymati _truthy_ bo‘lsa, u holda ikkinchi operand bajariladi va uning qiymati qaytariladi. Aks holda, agar birinchi operand _falsy_ bo‘lsa, u holda uchinchi operand bajariladi va uning qiymati qaytariladi. Ikkinchi va uchinchi operandlardan faqat bittasi bajariladi; hech qachon ikkalasi ham emas.

Garchi siz `if` ko‘rsatmasi (§5.3.1) yordamida shunga o‘xshash natijalarga erisha olsangiz-da, `?:` operatori ko‘pincha qulay qisqa yo‘lni taqdim etadi. Quyida uning odatiy ishlatilishi keltirilgan. Bu kod o‘zgaruvchining aniqlanganligini (va ma’noli tarzda, _truthy_ qiymatga ega ekanligini) tekshiradi va agar shunday bo‘lsa, uni ishlatadi, aks holda standart qiymatni taqdim etadi:

``` js
greeting = "hello " + (username ? username : "there");
```

Bu quyidagi `if` ko‘rsatmasiga ekvivalent, lekin undan ancha ixchamroq:

``` js
greeting = "hello ";
if (username) {
    greeting += username;
} else {
    greeting += "there";
}
```

## Birinchi aniqlangan (`??`)

**Birinchi aniqlangan operatori (`??`)** o‘zining birinchi **aniqlangan** operandiga baholanadi: agar uning chap operandi `null` ham, `undefined` ham bo‘lmasa, u o‘sha qiymatni qaytaradi. Aks holda, u o‘ng operandning qiymatini qaytaradi.

`&&` va `||` operatorlari kabi, `??` ham **qisqa tutashuvlidir (`short-circuiting`)**: u o‘zining ikkinchi operandini faqat birinchi operandi `null` yoki `undefined`'ga baholangandagina bajaradi. Agar `a` ifodasi qo‘shimcha ta’sirlarga ega bo‘lmasa, u holda `a ?? b` ifodasi quyidagiga ekvivalentdir:

``` js
(a !== null && a !== undefined) ? a : b
```

`??` operatori birinchi _truthy_ operandni emas, balki birinchi **aniqlangan** operandni tanlashni istaganingizda `||` (§4.10.2) uchun foydali alternativdir. Garchi `||` nominal jihatdan mantiqiy YOKI operatori bo‘lsa-da, u quyidagi kabi kod bilan birinchi _falsy_ bo‘lmagan operandni tanlash uchun ham idiomatik tarzda ishlatiladi:

``` js
// Agar `maxWidth` "truthy" bo‘lsa, o‘shani ishlatado. Aks holda,
// `preferences` obyektidan qiymat qidiradi. Agar u ham "truthy" bo‘lmasa,
// qat’iy belgilangan konstantadan foydalanadi.
let max = maxWidth || preferences.maxWidth || 500;
```

Bu idiomatik ishlatishning muammosi shundaki, nol, bo‘sh satr va `false` qiymatlari ba’zi holatlarda mutlaqo to‘g‘ri qiymatlar bo‘lishi mumkin bo‘lsa-da, ularning barchasi _falsy_ qiymatlardir. Bu kod misolida, agar `maxWidth` nolga teng bo‘lsa, bu qiymat e’tiborsiz qoldiriladi. Lekin agar biz `||` operatorini `??`'ga o‘zgartirsak, nol to‘g‘ri qiymat hisoblanadigan ifodaga ega bo‘lamiz:

``` js
// Agar `maxWidth` aniqlangan bo‘lsa, o‘shani ishlatadi. Aks holda,
// `preferences` obyektidan qiymat qidiradi. Agar u ham aniqlanmagan bo‘lsa,
// qat’iy belgilangan konstantadan foydalanadi.
let max = maxWidth ?? preferences.maxWidth ?? 500;
```

Quyida birinchi operand _falsy_ bo‘lganda `??` qanday ishlashini ko‘rsatadigan yana bir nechta misollar keltirilgan. Agar bu operand _falsy_, lekin **aniqlangan** bo‘lsa, `??` uni qaytaradi. Faqat birinchi operand "`null`ga o'xshash" (**"nullish"**, ya’ni, `null` yoki `undefined`) bo‘lgandagina bu operator ikkinchi operandni bajaradi va qaytaradi:

``` js
let options = { timeout: 0, title: "", verbose: false, n: null };
options.timeout ?? 1000     // => 0: obyektda aniqlanganidek
options.title ?? "Untitled" // => "": obyektda aniqlanganidek
options.verbose ?? true     // => false: obyektda aniqlanganidek
options.quiet ?? false      // => false: xossa aniqlanmagan
options.n ?? 10             // => 10: xossa `null`
```

E’tibor bering, agar biz `??` o‘rniga `||`'ni ishlatganimizda, bu yerdagi `timeout`, `title` va `verbose` ifodalari boshqacha qiymatlarga ega bo‘lardi.

`??` operatori `&&` va `||` operatorlariga o‘xshaydi, lekin ulardan yuqoriroq yoki pastroq ustuvorlikka ega emas. Agar siz uni bu operatorlardan biri bilan birga biror ifodada ishlatsangiz, qaysi amalni birinchi bajarishni xohlayotganingizni aniq ko‘rsatish uchun qavslardan foydalanishingiz shart:

``` js
(a ?? b) || c  // Avval `??`, keyin `||`
a ?? (b || c)  // Avval `||`, keyin `??`
a ?? b || c    // SyntaxError: qavslar talab qilinadi
```

`??` operatori ES2020 tomonidan aniqlangan va 2020-yil boshiga kelib, barcha asosiy brauzerlarning joriy yoki beta versiyalari tomonidan yangidan qo‘llab-quvvatlanadi. Bu operator rasman **"nullish coalescing" (bo‘sh qiymatlarni umumlashtirish)** operatori deb ataladi, lekin men bu atamadan qochaman, chunki bu operator o‘z operandlaridan birini tanlaydi, lekin ularni men ko‘ra oladigan biror usulda "birlashtirmaydi" (coalesce).

## `typeof` operatori

`typeof` — bu o‘zining yagona operandining oldidan qo‘yiladigan birlik operatordir. Bu operand har qanday tipda bo‘lishi mumkin. Operatorning qiymati operandning tipini ko‘rsatuvchi satrdir. 4-3-jadvalda har qanday JavaScript qiymati uchun `typeof` operatorining qiymati ko‘rsatilgan.

<small>_4-3-jadval. `typeof` operatori qaytaradigan qiymatlar_</small>

| **x** | **typeof x** |
| :--- | :--- |
| `undefined` | "undefined" |
| `null` | "object" |
| `true` yoki `false` | "boolean" |
| har qanday son yoki `NaN` | "number" |
| har qanday `BigInt` | "bigint" |
| har qanday satr | "string" |
| har qanday `symbol` | "symbol" |
| har qanday funksiya | "function" |
| funksiya bo‘lmagan har qanday obyekt | "object" |

Siz `typeof` operatorini quyidagi kabi ifodada ishlatishingiz mumkin:

``` js
// Agar qiymat satr bo‘lsa, uni qo'shtirnoq ichiga o‘rang, aks holda, o‘zgartiring
(typeof value === "string") ? "'" + value + "'" : value.toString()
```

E’tibor bering, agar operand qiymati `null` bo‘lsa, `typeof` "object" qaytaradi. Agar siz `null`'ni obyektlardan farqlamoqchi bo‘lsangiz, bu maxsus holat qiymatini aniq tekshirishingiz kerak bo‘ladi.

Garchi JavaScript funksiyalari obyektning bir turi bo‘lsa-da, `typeof` operatori funksiyalarni yetarlicha farqli deb hisoblaydi va ular uchun o‘zining alohida qaytariladigan qiymatiga ega.

`typeof` funksiyalardan tashqari barcha obyekt va massiv qiymatlari uchun "object" qiymatini baholagani sababli, u faqat obyektlarni boshqa, primitiv tiplardan farqlash uchungina foydalidir. Bir obyekt klassini boshqasidan farqlash uchun siz boshqa usullardan, masalan, `instanceof` operatori (§4.9.4), `class` atributi (§14.4.3) yoki `constructor` xossasidan (§9.2.2 va §14.3) foydalanishingiz kerak.

## `delete` operatori

`delete` — bu o‘zining operandi sifatida ko‘rsatilgan obyekt xossasi yoki massiv elementini o‘chirishga harakat qiladigan birlik operatordir. Tayinlash, inkrement va dekrement operatorlari kabi, `delete` ham odatda o‘zi qaytaradigan qiymat uchun emas, balki xossani o‘chirish qo‘shimcha ta’siri (`side effect`) uchun ishlatiladi. Bunga bir nechta misollar:

``` js
let o = { x: 1, y: 2};  // Biror obyektdan boshlaymiz
delete o.x;             // Uning xossalaridan birini o‘chiramiz
"x" in o                // => false: xossa endi mavjud emas

let a = [1,2,3];        // Biror massivdan boshlaymiz
delete a[2];            // Massivning oxirgi elementini o‘chiramiz
2 in a                  // => false: massivning 2-elementi endi mavjud emas
a.length                // => 3: e’tibor bering, massiv uzunligi o‘zgarmaydi
```

E’tibor bering, o‘chirilgan xossa yoki massiv elementi shunchaki `undefined` qiymatiga o‘rnatilmaydi. Xossa o‘chirilganda, u **mavjud bo‘lishdan to‘xtaydi**. Mavjud bo‘lmagan xossani o‘qishga urinish `undefined` qaytaradi, lekin xossaning haqiqatan ham mavjudligini `in` operatori (§4.9.3) yordamida tekshirishingiz mumkin. Massiv elementini o‘chirish massivda "bo‘shliq" qoldiradi va massivning uzunligini o‘zgartirmaydi. Natijada hosil bo‘lgan massiv **siyrak (`sparse`)** bo‘ladi (§7.3).

`delete` o‘z operandining `lvalue` bo‘lishini kutadi. Agar u `lvalue` bo‘lmasa, operator hech qanday harakat qilmaydi va `true` qaytaradi. Aks holda, `delete` ko‘rsatilgan `lvalue`'ni o‘chirishga harakat qiladi. Agar `delete` ko‘rsatilgan `lvalue`'ni muvaffaqiyatli o‘chirsa, `true` qaytaradi. Biroq hamma xossalarni ham o‘chirib bo‘lmaydi: **sozlanmaydigan (`non-configurable`)** xossalar (§14.1) o‘chirishdan himoyalangan.

Qat’iy rejimda (`strict mode`), agar `delete`'ning operandi o‘zgaruvchi, funksiya yoki funksiya parametri kabi to‘g‘ridan-to‘g‘ri identifikator bo‘lsa, u `SyntaxError` xatoligiga sabab bo‘ladi: u faqat operand xossaga murojaat qilish ifodasi (§4.4) bo‘lgandagina ishlaydi. Qat’iy rejim, shuningdek, `delete`'dan har qanday sozlanmaydigan (ya’ni, o‘chirilmaydigan) xossani o‘chirish so‘ralsa, `TypeError` xatoligiga sabab bo‘lishini belgilaydi. Qat’iy rejimsiz, bu hollarda istisno yuz bermaydi va `delete` shunchaki operandni o‘chirib bo‘lmasligini bildirish uchun `false` qaytaradi.

Quyida `delete` operatoridan foydalanishga doir bir nechta misollar keltirilgan:

``` js
let o = {x: 1, y: 2};
delete o.x;         // Obyekt xossalaridan birini o‘chirish; `true` qaytaradi.
typeof o.x;         // Xossa mavjud emas; "undefined" qaytaradi.
delete o.x;         // Mavjud bo‘lmagan xossani o‘chirish; `true` qaytaradi.
delete 1;           // Buning ma’nosi yo‘q, lekin u shunchaki `true` qaytaradi.

// O‘zgaruvchini o‘chirib bo‘lmaydi; `false` qaytaradi, yoki qat’iy rejimda `SyntaxError`.
delete o;

// O‘chirilmaydigan xossa: `false` qaytaradi, yoki qat’iy rejimda `TypeError`.
delete Object.prototype;
```

Biz `delete` operatorini §6.4-bo‘limda yana ko‘rib chiqamiz.

## `await` operatori

`await` ES2017'da JavaScript'da asinxron dasturlashni yanada tabiiyroq qilish usuli sifatida kiritilgan. Bu operatorni tushunish uchun siz 13-bobni o‘qishingiz kerak bo‘ladi.

Qisqacha aytganda, `await` o‘zining yagona operandi sifatida (asinxron hisob-kitobni ifodalovchi) `Promise` obyektini kutadi va u dasturingizni xuddi asinxron hisob-kitobning yakunlanishini kutayotgandek tutishiga majbur qiladi (lekin u buni aslida bloklamasdan amalga oshiradi va boshqa asinxron amallarning bir vaqtning o‘zida davom etishiga to‘sqinlik qilmaydi). `await` operatorining qiymati `Promise` obyektining muvaffaqiyatli yakunlangan qiymati (`fulfillment value`) bo‘ladi.

Muhimi shundaki, `await` faqat `async` kalit so‘zi bilan asinxron deb e’lon qilingan funksiyalar ichidagina ishlatilishi mumkin. Yana bir bor, to‘liq tafsilotlar uchun 13-bobga qarang.

## `void` operatori

`void` — bu o‘zining yagona operandining oldidan keladigan birlik operatordir. Bu operand har qanday tipda bo‘lishi mumkin. Bu operator g‘ayrioddiy va kamdan-kam ishlatiladi; u o‘z operandini bajaradi, so‘ngra qiymatini tashlab yuboradi va `undefined` qaytaradi. Operand qiymati tashlab yuborilgani sababli, `void` operatoridan foydalanish faqatgina operand qo‘shimcha ta’sirlarga (`side effects`) ega bo‘lgandagina ma’noga ega.

`void` operatori shunchalik noaniqki, uning amaliy qo‘llanilishiga misol topish qiyin. Bir holat, hech narsa qaytarmaydigan, lekin ayni paytda funksiya tanasi bitta ifodadan iborat bo‘lgan va o‘sha ifoda bajarilib, qaytariladigan strelkali funksiya qisqa sintaksisidan (§8.1.3-bo‘limga qarang) foydalanmoqchi bo‘lganingizda bo‘lishi mumkin. Agar ifodani faqat uning qo‘shimcha ta’sirlari uchun bajarayotgan bo‘lsangiz va uning qiymatini qaytarishni xohlamasangiz, eng oddiy yechim funksiya tanasi atrofida jingalak qavslardan foydalanishdir. Lekin, alternativ sifatida, bu holda `void` operatoridan ham foydalanishingiz mumkin:

``` js
let counter = 0;
const increment = () => void counter++;
increment() // => undefined
counter     // => 1
```

## Vergul operatori (`,`)

Vergul operatori ikkilik operator bo‘lib, uning operandlari har qanday tipda bo‘lishi mumkin. U avval chap operandini bajaradi, keyin o‘ng operandini bajaradi va so‘ngra o‘ng operandning qiymatini qaytaradi. Shunday qilib, quyidagi qator:

``` js
i=0, j=1, k=2;
```

`2`'ga baholanadi va asosan quyidagiga ekvivalentdir:

``` js
i = 0; j = 1; k = 2;
```

Chap tomondagi ifoda har doim bajariladi, lekin uning qiymati tashlab yuboriladi. Bu shuni anglatadiki, vergul operatoridan foydalanish faqat chap tomondagi ifoda qo‘shimcha ta’sirlarga (`side effects`) ega bo‘lgandagina ma’noga ega.

Vergul operatori keng tarqalgan yagona holat — bu bir nechta sikl o‘zgaruvchisiga ega bo‘lgan `for` sikli (§5.4.3) bilan ishlatilishidir:

``` js
// Quyidagi birinchi vergul `let` ko‘rsatmasi sintaksisining bir qismidir.
// Ikkinchi vergul esa vergul operatoridir: u bizga 2 ta
// ifodani (`i++` va `j--`) bitta ifoda kutadigan ko‘rsatmaga (`for` sikli) sig‘dirishga imkon beradi.
for(let i=0,j=10; i < j; i++,j--) {
    console.log(i+j);
}
```