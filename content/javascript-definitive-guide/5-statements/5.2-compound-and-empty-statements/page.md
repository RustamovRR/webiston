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