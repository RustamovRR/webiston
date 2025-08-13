# Sonlar

JavaScript'ning asosiy sonli tipi bo‘lgan `Number` tipi ham butun sonlarni ifodalash, ham haqiqiy sonlarni taqriban hisoblash uchun xizmat qiladi. JavaScript sonlarni ifodalash uchun IEEE 754 standarti[^1] bilan belgilangan 64 bitli **suzuvchi nuqtali (`floating-point`)** formatdan foydalanadi. Bu format `±1.7976931348623157 × 10³⁰⁸` gacha bo‘lgan ulkan va `±5 × 10⁻³²⁴` gacha bo‘lgan juda kichik sonlarni ifodalash imkonini beradi.

JavaScript'ning son formati `−9,007,199,254,740,992` (−2⁵³) dan `9,007,199,254,740,992` (2⁵³) gacha bo‘lgan barcha butun sonlarni (shu sonlarning o‘zini ham qo‘shgan holda) mutlaqo aniq ifodalash imkonini beradi. Agar bundan katta butun sonlar bilan ishlasangiz, ularning oxirgi raqamlarida aniqlik yo‘qolishi mumkin. Shuni ta’kidlash joizki, JavaScript’dagi ba’zi amallar (masalan, massivlarni indekslash va 4-bobda yoritilgan bitli operatorlar) 32 bitli butun sonlar bilan bajariladi. Bundan ham katta butun sonlarni mutlaqo aniq ifodalash zarur bo‘lsa, `§3.2.5`-bo‘limga qarang.

JavaScript dasturi kodida to‘g‘ridan-to‘g‘ri yozilgan son _sonli literal_ deb ataladi. JavaScript sonli literallarning bir necha formatini qo‘llab-quvvatlaydi va ular keyingi bo‘limlarda yoritilgan. Shuni ham aytib o‘tish kerakki, har qanday sonli literal oldidan minus (`-`) belgisi kelishi mumkin va bu uni manfiy songa aylantiradi.

---

[^1]: Bu Java, C++ va ko‘pchilik zamonaviy dasturlash tillaridagi `double` tipidagi sonlar uchun qo‘llaniladigan formatdir.