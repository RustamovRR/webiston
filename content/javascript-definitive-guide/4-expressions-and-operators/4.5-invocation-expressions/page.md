# Funksiyani chaqirish ifodalari

**Chaqiruv ifodasi (`invocation expression`)** — bu JavaScript'da funksiya yoki metodni **chaqirish** (yoki **bajarish**) uchun mo‘ljallangan sintaksisdir. U chaqirilishi kerak bo‘lgan funksiyani aniqlovchi funksiya ifodasi bilan boshlanadi. Funksiya ifodasidan keyin ochuvchi qavs, nolta yoki undan ortiq argument ifodalaridan iborat vergul bilan ajratilgan ro‘yxat va yopuvchi qavs keladi. Bir nechta misollar:

``` js
f(0)            // `f` - funksiya ifodasi; `0` - argument ifodasi.
Math.max(x,y,z) // `Math.max` - funksiya; `x`, `y`, va `z` - argumentlar.
a.sort()        // `a.sort` - funksiya; argumentlar yo‘q.
```

Chaqiruv ifodasi bajarilganda, avval funksiya ifodasi, so‘ngra argument ifodalari bajarilib, argument qiymatlari ro‘yxati hosil qilinadi. Agar funksiya ifodasining qiymati funksiya bo‘lmasa, `TypeError` xatoligi yuzaga keladi. Keyin, argument qiymatlari funksiya ta’riflanganda ko‘rsatilgan parametr nomlariga tartib bilan tayinlanadi va shundan so‘ng funksiya tanasi bajariladi. Agar funksiya biror qiymatni qaytarish uchun `return` ko‘rsatmasidan foydalansa, o‘sha qiymat chaqiruv ifodasining qiymatiga aylanadi. Aks holda, chaqiruv ifodasining qiymati `undefined` bo‘ladi. Funksiyalarni chaqirishning to‘liq tafsilotlari, jumladan, argument ifodalari soni funksiya ta’rifidagi parametrlar soniga mos kelmaganda nima sodir bo‘lishi haqidagi tushuntirishlar 8-bobda keltirilgan.

Har bir chaqiruv ifodasi bir juft qavsni va ochuvchi qavsdan oldingi bir ifodani o‘z ichiga oladi. Agar bu ifoda xossaga murojaat qilish ifodasi bo‘lsa, u holda bu chaqiruv **metod chaqiruvi (`method invocation`)** deb nomlanadi. Metod chaqiruvlarida, xossaga murojaat qilishning obyekti bo‘lgan obyekt yoki massiv funksiya tanasi bajarilayotgan vaqtda `this` kalit so‘zining qiymatiga aylanadi. Bu funksiyalar (shu tarzda ishlatilganda biz ularni "metodlar" deb ataymiz) o‘zlari tegishli bo‘lgan obyekt ustida amallar bajaradigan obyektga yo‘naltirilgan dasturlash paradigmasini yaratish imkonini beradi. Tafsilotlar uchun 9-bobga qarang.

## Shartli chaqiruv

ES2020'da siz funksiyani `()` o‘rniga `?.()` yordamida ham chaqirishingiz mumkin. Odatda, siz funksiyani chaqirganingizda, agar qavslardan chapdagi ifoda `null` yoki `undefined` yoxud boshqa biror funksiya bo‘lmagan qiymat bo‘lsa, `TypeError` xatoligi yuzaga keladi. Yangi `?.()` chaqiruv sintaksisi bilan esa, agar `?.`'dan chapdagi ifoda `null` yoki `undefined`'ga baholansa, butun chaqiruv ifodasi `undefined`'ga baholanadi va hech qanday istisno (`exception`) yuzaga kelmaydi.

Massiv obyektlarining `sort()` metodi mavjud bo‘lib, unga massiv elementlari uchun kerakli saralash tartibini aniqlaydigan ixtiyoriy funksiya argumentini uzatish mumkin. ES2020'dan oldin, agar siz `sort()` kabi ixtiyoriy funksiya argumentini qabul qiladigan metod yozmoqchi bo‘lsangiz, odatda `if` ko‘rsatmasi yordamida funksiya argumenti mavjudligini tekshirib, keyin uni `if` tanasi ichida chaqirardingiz:

``` js
function square(x, log) { // Ikkinchi argument - ixtiyoriy funksiya
    if (log) {            // Agar ixtiyoriy funksiya uzatilgan bo‘lsa
        log(x);           // Uni chaqirish
    }
    return x * x;         // Argumentning kvadratini qaytarish
}
```

ES2020'ning bu shartli chaqiruv sintaksisi bilan esa, siz shunchaki funksiya chaqiruvini `?.()` yordamida yozishingiz mumkin va chaqiruv faqat chaqiriladigan qiymat haqiqatan ham mavjud bo‘lgandagina sodir bo‘lishini bilasiz:

``` js
function square(x, log) { // Ikkinchi argument - ixtiyoriy funksiya
    log?.(x);             // Agar funksiya mavjud bo‘lsa, uni chaqirish
    return x * x;         // Argumentning kvadratini qaytarish
}
```

Biroq shuni yodda tutingki, `?.()` faqat chap tomonning `null` yoki `undefined` ekanligini tekshiradi. U qiymatning haqiqatan ham funksiya ekanligini tekshirmaydi. Shuning uchun, bu misoldagi `square()` funksiyasiga, masalan, ikkita son uzatsangiz, u baribir istisno yuzaga keltiradi.

Xuddi shartli xossa murojaati ifodalari (§4.4.1) kabi, `?.()` bilan funksiya chaqiruvi ham **qisqa tutashuvlidir (`short-circuiting`)**: agar `?.`'dan chapdagi qiymat `null` yoki `undefined` bo‘lsa, qavslar ichidagi argument ifodalarining hech biri bajarilmaydi:

``` js
let f = null, x = 0;
try {
    f(x++);     // f `null` bo‘lgani uchun TypeError yuzaga keltiradi
} catch(e) {
    x           // => 1: x istisno yuzaga kelishidan oldin inkrement qilinadi
}
f?.(x++)        // => undefined: f `null`, lekin istisno yuzaga kelmaydi
x               // => 1: qisqa tutashuv sababli inkrement qilinmadi
```

`?.()` bilan shartli chaqiruv ifodalari funksiyalar uchun qanday ishlasa, metodlar uchun ham xuddi shunday ishlaydi. Lekin metod chaqiruvi o‘z ichiga xossaga murojaat qilishni ham olgani uchun, quyidagi ifodalar orasidagi farqlarni tushunib olishga bir lahza vaqt ajratishga arziydi:

``` js
o.m()   // Oddiy xossa murojaati, oddiy chaqiruv
o?.m()  // Shartli xossa murojaati, oddiy chaqiruv
o.m?.() // Oddiy xossa murojaati, shartli chaqiruv
```

Birinchi ifodada, `o` obyekti `m` xossasiga ega bo‘lishi va bu xossaning qiymati funksiya bo‘lishi kerak. Ikkinchi ifodada, agar `o` obyekti `null` yoki `undefined` bo‘lsa, ifoda `undefined`'ga baholanadi. Lekin `o` obyekti boshqa har qanday qiymatga ega bo‘lsa, u `m` xossasiga ega bo‘lishi va bu xossaning qiymati funksiya bo‘lishi shart. Uchinchi ifodada esa, `o` obyekti `null` yoki `undefined` bo‘lmasligi kerak. Agar unda `m` xossasi bo‘lmasa, yoki bu xossaning qiymati `null` bo‘lsa, butun ifoda `undefined`'ga baholanadi.

`?.()` bilan shartli chaqiruv JavaScript'ning eng yangi xususiyatlaridan biridir. 2020-yilning ilk oylariga kelib, bu yangi sintaksis ko‘pchilik asosiy brauzerlarning joriy yoki beta versiyalarida qo‘llab-quvvatlanadi.