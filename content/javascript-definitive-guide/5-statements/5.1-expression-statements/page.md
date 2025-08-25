## 5.1 Ifoda-operatorlar

JavaScript’dagi eng sodda operatorlar — bular qo‘shimcha ta’sirga (side effects) ega bo‘lgan ifodalardir. Bu turdagi operatorlar 4-bobda ko‘rib chiqilgan edi. O‘zlashtirish operatorlari ifoda-operatorlarning asosiy toifalaridan biridir. Masalan:

    greeting = "Hello " + name;
    i *= 3;

Inkrement (`++`) va dekrement (`--`) operatorlari o‘zlashtirish operatorlariga yaqindan bog‘liq. Ular ham xuddi o‘zlashtirish kabi o‘zgaruvchi qiymatini o‘zgartirish qo‘shimcha ta’siriga ega:

    counter++;

`delete` operatori obyekt xususiyatini o‘chirish kabi muhim qo‘shimcha ta’sirga ega. Shu sababli, u kattaroq ifodaning bir qismi sifatida emas, balki deyarli har doim mustaqil operator sifatida ishlatiladi:

    delete o.x;

Funksiya chaqiruvlari — ifoda-operatorlarning yana bir yirik toifasidir. Masalan:

    console.log(debugMessage);
    displaySpinner(); // Veb-ilovada spinner'ni ko‘rsatish uchun faraziy funksiya.

    Bu funksiya chaqiruvlari aslida ifodalardir, lekin ular host environment (ish muhiti) yoki dastur state'iga ta’sir ko‘rsatadigan qo‘shimcha ta’sirlarga ega va aynan shuning uchun operator sifatida qo‘llaniladi. Agar funksiyaning hech qanday qo‘shimcha ta’siri bo‘lmasa, uni kattaroq ifodaning bir qismi yoki o‘zlashtirish operatori tarkibida bo‘lmagan holatda shunchaki chaqirishdan ma’no yo‘q. Masalan, siz kosinusni shunchaki hisoblab, natijasini e’tiborsiz qoldirmaysiz:

    Math.cos(x);

Buning o‘rniga, qiymatni hisoblab, kelajakda foydalanish uchun uni o‘zgaruvchiga o‘zlashtirishingiz mumkin:

    cx = Math.cos(x);

E’tibor bering, bu misollarning har biridagi kod qatori nuqtali vergul bilan yakunlangan.

## 5.2 Tarkibiy va bo‘sh operatorlar

Xuddi vergul operatori (§4.13.7) bir nechta ifodani yagona ifodaga birlashtirgani kabi, operatorlar bloki ham bir nechta operatorni yagona tarkibiy operatorga jamlaydi. Operatorlar bloki — bu shunchaki jingalak qavslar (`{}`) ichiga olingan operatorlar ketma-ketligidir. Shunday qilib, quyidagi qatorlar yagona operator sifatida ishlaydi va JavaScript yagona operator talab qiladigan har qanday joyda qo‘llanilishi mumkin:

    {
      x = Math.PI;
      cx = Math.cos(x);
      console.log("cos(π) = " + cx);
    }

Ushbu operatorlar bloki haqida bir nechta narsani ta’kidlash lozim. Birinchidan, u nuqtali vergul bilan tugamaydi. Blok ichidagi sodda operatorlar nuqtali vergul bilan yakunlanadi, lekin blokning o‘zi yakunlanmaydi. Ikkinchidan, blok ichidagi qatorlar uni o‘rab turuvchi jingalak qavslarga nisbatan chekinish bilan yozilgan. Bu majburiy emas, lekin kodni o‘qish va tushunishni osonlashtiradi.

Ifodalar ko‘pincha quyi ifodalardan tashkil topgani kabi, ko‘plab JavaScript operatorlari ham o‘z tarkibida quyi operatorlarga ega bo‘ladi. Rasman, JavaScript sintaksisi odatda bitta quyi operatorga ruxsat beradi. Misol uchun, `while` sikli sintaksisida sikl tanasi vazifasini bajaruvchi yagona operator mavjud. Operatorlar blokidan foydalanib, siz ruxsat etilgan shu yagona quyi operator o‘rniga istalgancha operator joylashtirishingiz mumkin.

Tarkibiy operator JavaScript sintaksisi bitta operatorni kutgan joyda bir nechta operatorni ishlatishga imkon beradi. Bo‘sh operator esa buning aksidir: u bitta operator kutilgan joyda hech qanday operator ishlatmaslik imkonini beradi. Bo‘sh operator quyidagicha ko‘rinishga ega:

    ;

JavaScript interpretatori bo‘sh operatorni ijro etganda hech qanday amal bajarmaydi. Bo‘sh operator ba’zan tanasi bo‘sh bo‘lgan sikl yaratish kerak bo‘lganda foydali bo‘ladi. Quyidagi `for` siklini ko‘rib chiqing (`for` sikllari §5.4.3 da batafsil yoritiladi):

    // a massivini initsializatsiya qilish
    for(let i = 0; i < a.length; a[i++] = 0) ;

Bu siklda barcha ish `a[i++] = 0` ifodasi orqali bajariladi va sikl tanasiga ehtiyoj qolmaydi. Biroq, JavaScript sintaksisi sikl tanasi sifatida biror operator bo‘lishini talab qiladi, shuning uchun bu yerda bo‘sh operator — ya’ni shunchaki nuqtali vergul — ishlatiladi.

E’tibor bering, `for`, `while` yoki `if` operatorlarining yopiluvchi qavsidan keyin beixtiyor qo‘yib yuborilgan nuqtali vergul aniqlash qiyin bo‘lgan jiddiy xatoliklarga olib kelishi mumkin. Masalan, quyidagi kod muallif kutgan natijani bermasligi aniq:

    if ((a === 0) || (b === 0)); // Voy! Bu qator hech narsa bajarmaydi...
    o = null;                     // ...va bu qator har doim ijro etiladi.

Agar bo‘sh operatorni ataylab ishlatsangiz, buni ongli ravishda qilayotganingizni aniq ko‘rsatish uchun kodingizga izoh qo‘shib qo‘yish yaxshi amaliyotdir. Masalan:

    for(let i = 0; i < a.length; a[i++] = 0) /* bo'sh */ ;