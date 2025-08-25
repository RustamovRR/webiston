## 5.3 Shart operatorlari

Shart operatorlari — bu ma’lum bir ifodaning qiymatiga bog‘liq holda kodning keyingi qismini ijro etuvchi yoki o‘tkazib yuboruvchi boshqaruvchi konstruksiyalardir. Ular dastur **ijro oqimini** yo‘naltirgani uchun kodning “qaror qabul qilish nuqtalari” hisoblanadi.

Dastur ijrosi shart operatoriga duch kelganda, u ifoda natijasiga ko‘ra bir nechta yo‘nalishdan birini tanlashi kerak bo‘ladi. Ijroning bu tarzda bir nechta shoxobchaga bo‘linishi sababli bu konstruksiyalar “tarmoqlar” (branches) deb ham ataladi.

Keyingi kichik bo‘limlarda JavaScript’ning asosiy shart operatori bo‘lgan `if/else`, shuningdek, undan murakkabroq, ko‘p tarmoqli `switch` operatori tushuntiriladi.

### 5.3.1 if

`if` operatori — bu JavaScript'ga qarorlar qabul qilish, aniqrog‘i, operatorlarni shartli ravishda ijro etish imkonini beruvchi asosiy boshqaruvchi operatordir. Bu operatorning ikki xil shakli mavjud. Birinchisi:

    if (expression)
        statement

Bu shaklda `expression` (ifoda) baholanadi. Agar natijaviy qiymat `truthy` (rostga yaqin) bo‘lsa, `statement` (operator) ijro etiladi. Agar `expression` `falsy` (yolg‘onga yaqin) bo‘lsa, `statement` ijro etilmaydi. (`truthy` va `falsy` qiymatlarning ta’rifi uchun §3.4 ga qarang.) Masalan:

    if (username == null)    // Agar username null yoki undefined bo‘lsa,
        username = "John Doe"; // unga qiymat beramiz

Yoki shunga o‘xshash boshqa bir misol:

    // Agar username null, undefined, false, 0, "" yoki NaN bo‘lsa, unga yangi qiymat beramiz
    if (!username) username = "John Doe";

E’tibor bering, ifodani o‘rab turuvchi qavslar `if` operatori sintaksisining majburiy qismidir.
JavaScript sintaksisi `if` kalit so‘zi va qavs ichidagi ifodadan keyin yagona operator kelishini talab qiladi, lekin siz operatorlar blokidan foydalanib, bir nechta operatorni bittaga birlashtirishingiz mumkin. Shunday qilib, `if` operatori quyidagi ko‘rinishga ham ega bo‘lishi mumkin:

    if (!address) {
        address = "";
        message = "Please specify a mailing address.";
    }

`if` operatorining ikkinchi shaklida `else` qismi ham mavjud bo‘lib, u `expression` `falsy` bo‘lganda ijro etiladi. Uning sintaksisi quyidagicha:

    if (expression)
        statement1
    else
        statement2

Operatorning bu shakli, agar `expression` `truthy` bo‘lsa, `statement1`'ni, `falsy` bo‘lsa, `statement2`'ni ijro etadi. Masalan:

    if (n === 1)
        console.log("You have 1 new message.");
    else
        console.log(`You have ${n} new messages.`);

Ichma-ich joylashgan `if` operatorlari `else` qismlari bilan ishlatilganda, `else` qismining aynan qaysi `if`'ga tegishli ekanligiga alohida e’tibor berish kerak. Quyidagi qatorlarni ko‘rib chiqamiz:

    i = j = 1;
    k = 2;
    if (i === j)
        if (j === k)
            console.log("i equals k");
        else
            console.log("i doesn't equal j"); // NOTO‘G‘RI!!

Bu misolda ichki `if` operatori tashqi `if` operatori sintaksisi ruxsat bergan yagona operator vazifasini bajarmoqda. Afsuski, `else` qismining qaysi `if`'ga tegishli ekanligi noaniq (chekinishlar bilan berilgan ishoradan tashqari). Va bu misolda chekinish xato qo‘llanilgan, chunki JavaScript interpretatori aslida avvalgi misolni quyidagicha talqin qiladi:

    if (i === j) {
        if (j === k)
            console.log("i equals k");
        else
            console.log("i doesn't equal j"); // XATO!
    }

JavaScript'dagi (va ko‘pchilik dasturlash tillaridagi) qoida shundan iboratki, standart holatda `else` qismi o‘ziga eng yaqin joylashgan `if` operatorining bir qismi hisoblanadi. Bu misolni yanada tushunarli qilish va o‘qish, anglash, qo‘llab-quvvatlash hamda nosozliklarni tuzatishni osonlashtirish uchun jingalak qavslardan foydalanish kerak:

    if (i === j) {
        if (j === k) {
            console.log("i equals k");
        }
    } else { // Jingalak qavsning o‘rni qanday katta farq yaratadi-ya!
        console.log("i doesn't equal j");
    }

Ko‘pgina dasturchilar, tanasi faqat bitta operatordan iborat bo‘lsa ham, `if` va `else` operatorlarining (shuningdek, `while` sikllari kabi boshqa tarkibiy operatorlarning) tanasini doim jingalak qavslar ichiga olishni odat qilishgan. Bunga doimiy amal qilish yuqorida ko‘rsatilgan kabi muammolarning oldini oladi va men sizga ushbu amaliyotni qo‘llashni maslahat beraman. Ushbu chop etilgan kitobda men misol kodlarini vertikal jihatdan ixcham saqlashga ko‘proq e’tibor beraman va shu sababli bu masalada har doim ham o‘z maslahatimga amal qilavermayman.

### 5.3.2 else if

`if/else` operatori ifodani baholab, natijaga qarab ikki kod qismining birini ijro etadi. Xo‘sh, agar ko‘plab kod qismlaridan birini ijro etish kerak bo‘lsa-chi? Buning bir usuli — `else if`'dan foydalanishdir. Aslida, `else if` JavaScript'ning alohida operatori emas, balki shunchaki takroriy `if/else` operatorlari qo‘llanilganda yuzaga keladigan keng tarqalgan dasturlash uslubidir (idiom):

    if (n === 1) {
        // 1-kod blokini ijro etish
    } else if (n === 2) {
        // 2-kod blokini ijro etish
    } else if (n === 3) {
        // 3-kod blokini ijro etish
    } else {
        // Agar yuqoridagilarning hech biri to‘g‘ri kelmasa, 4-blokni ijro etish
    }

Bu kodda hech qanday o‘zgacha narsa yo‘q. Bu shunchaki `if` operatorlari ketma-ketligi bo‘lib, unda har bir keyingi `if` o‘zidan oldingi operatorning `else` qismining tarkibiga kiradi. `else if` uslubidan foydalanish bu operatorlarni sintaktik jihatdan ekvivalent, lekin to‘liq ichma-ich joylashgan shaklda yozishdan ko‘ra afzalroq va o‘qish uchun qulayroqdir:

    if (n === 1) {
        // 1-kod blokini ijro etish
    }
    else {
        if (n === 2) {
            // 2-kod blokini ijro etish
        }
        else {
            if (n === 3) {
                // 3-kod blokini ijro etish
            }
            else {
                // Agar yuqoridagilarning hech biri to‘g‘ri kelmasa, 4-blokni ijro etish
            }
        }
    }

### 5.3.3 switch

`if` operatori dastur ijro oqimida tarmoqlanishni yuzaga keltiradi va siz `else if` uslubidan foydalanib, ko‘p tarmoqli shartni amalga oshirishingiz mumkin. Biroq, barcha tarmoqlar ayni bir ifodaning qiymatiga bog‘liq bo‘lgan holatlarda, bu eng yaxshi yechim emas. Bunday vaziyatda, o‘sha ifodani bir nechta `if` operatorida qayta-qayta baholash samarasizdir.

`switch` operatori aynan shunday vaziyatlar uchun mo‘ljallangan. `switch` kalit so‘zidan so‘ng qavslar ichida ifoda va jingalak qavslar ichida kod bloki keladi:

    switch(expression) {
        statements
    }

Biroq, `switch` operatorining to‘liq sintaksisi bundan murakkabroq. Kod bloki ichidagi turli joylar `case` kalit so‘zi, undan keyin keladigan ifoda va ikki nuqta bilan belgilanadi. `switch` ijro etilganda, u `expression`'ning qiymatini hisoblaydi va keyin qiymati bir xil bo‘lgan `case` belgisini qidiradi (bunda moslik `===` operatori yordamida aniqlanadi). Agar mos keladigan `case` topilsa, ijro oqimi o‘sha `case` bilan belgilangan operatordan boshlanadi. Agar mos keluvchi qiymatga ega `case` topilmasa, `default:` bilan belgilangan operator qidiriladi. Agar `default:` belgisi mavjud bo‘lmasa, `switch` operatori kod blokini butunlay o‘tkazib yuboradi.

`switch` tushuntirish uchun biroz chigal operator; uning ishlashini misol yordamida ancha oson anglash mumkin. Quyidagi `switch` operatori avvalgi bo‘limda ko‘rsatilgan takroriy `if/else` operatorlariga ekvivalentdir:

    switch(n) {
        case 1: // Agar n === 1 bo‘lsa, shu yerdan boshlanadi.
                // 1-kod blokini ijro etish.
            break;  // Shu yerda to‘xtatiladi.
        case 2: // Agar n === 2 bo‘lsa, shu yerdan boshlanadi.
                // 2-kod blokini ijro etish.
            break;  // Shu yerda to‘xtatiladi.
        case 3: // Agar n === 3 bo‘lsa, shu yerdan boshlanadi.
                // 3-kod blokini ijro etish.
            break;  // Shu yerda to‘xtatiladi.
        default: // Agar yuqoridagilarning hech biri mos kelmasa...
                 // 4-kod blokini ijro etish.
            break;   // Shu yerda to‘xtatiladi.
    }

Ushbu kodda har bir `case`'ning oxirida ishlatilgan `break` kalit so‘ziga e’tibor bering. `break` operatori (shu bobning keyingi qismlarida tavsiflanadi) interpretatorni `switch` operatorining oxiriga “sakrashga” yoki undan “chiqib ketishga” majbur qiladi va ijroni undan keyin keladigan operatordan davom ettiradi. `switch` operatoridagi `case` qismlari faqat kerakli kodning boshlanish nuqtasini belgilaydi; ular hech qanday tugash nuqtasini ko‘rsatmaydi. `break` operatorlari bo‘lmagan holda, `switch` operatori o‘z ifodasining qiymatiga mos keladigan `case` belgisidan boshlab kod blokini ijro etishni boshlaydi va blokning oxiriga yetguncha operatorlarni ijro etishda davom etadi. Juda kam holatlarda bir `case` belgisidan keyingisiga “o‘tib ketadigan” (falls through) bunday kod yozish foydali bo‘ladi, lekin 99% hollarda har bir `case`'ni `break` operatori bilan yakunlashga e’tiborli bo‘lishingiz kerak. (Biroq, `switch`'ni funksiya ichida ishlatganda, `break` operatori o‘rniga `return` operatoridan foydalanishingiz mumkin. Ikkalasi ham `switch` operatorini yakunlaydi va ijroning keyingi `case`'ga o‘tib ketishining oldini oladi.)

Mana `switch` operatoriga oid hayotiyroq misol; bu misol qiymat turiga qarab, uni satrga o‘zgartiradi:

    function convert(x) {
        switch(typeof x) {
            case "number": // Sonni o‘n oltilik butun songa o‘zgartirish
                return x.toString(16);
            case "string": // Satrni qo‘shtirnoqlar ichida qaytarish
                return '"' + x + '"';
            default:       // Boshqa har qanday turni odatiy usulda o‘zgartirish
                return String(x);
        }
    }
E’tibor bering, avvalgi ikki misolda `case` kalit so‘zlaridan keyin mos ravishda son va satr literal'lari kelgan. Amaliyotda `switch` operatori eng ko‘p aynan shu tarzda qo‘llaniladi, lekin shuni yodda tutingki, ECMAScript standarti har bir `case`'dan keyin ixtiyoriy ifoda kelishiga ruxsat beradi.

`switch` operatori dastlab `switch` kalit so‘zidan keyingi ifodani baholaydi, so‘ngra mos keluvchi qiymatni topmaguncha `case` ifodalarini ular yozilish tartibida birma-bir baholaydi.¹ Mos keluvchi `case` `==` oddiy tenglik operatori yordamida emas, balki `===` qat’iy tenglik operatori yordamida aniqlanadi, shu sababli, ifodalar hech qanday tip o‘zgartirishlarisiz bir-biriga aynan mos kelishi shart.

`switch` operatori har ijro etilganda barcha `case` ifodalari ham baholanmasligi sababli, siz funksiya chaqiruvlari yoki o‘zlashtirishlar kabi qo‘shimcha ta’sirga ega bo‘lgan `case` ifodalarini ishlatishdan saqlanishingiz lozim. Eng xavfsiz usul — `case` ifodalarini shunchaki o‘zgarmas (konstant) ifodalar bilan cheklashdir.

Yuqorida tushuntirilganidek, agar `case` ifodalarining hech biri `switch` ifodasiga mos kelmasa, `switch` operatori o‘z tanasini `default:` bilan belgilangan operatordan boshlab ijro etadi. Agar `default:` belgisi mavjud bo‘lmasa, `switch` operatori o‘z tanasini butunlay o‘tkazib yuboradi. E’tibor bering, ko‘rsatilgan misollarda `default:` belgisi barcha `case` belgilaridan keyin, `switch` tanasining oxirida joylashgan. Bu uning mantiqiy va keng tarqalgan joylashuvi, lekin aslida u operator tanasining istalgan qismida joylashishi mumkin.

---
¹ `case` ifodalarining dastur ishlashi vaqtida (runtime) baholanishi JavaScript'dagi `switch` operatorini C, C++ va Java'dagi `switch` operatoridan ancha farqli (va kamroq samarali) qiladi. Bu tillarda `case` ifodalari bir xil tipdagi kompilyatsiya vaqtidagi konstantalar bo‘lishi shart va `switch` operatorlari ko‘pincha yuqori samarali sakrash jadvallariga (jump tables) kompilyatsiya qilinishi mumkin.