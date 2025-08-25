## Operatorlar: JavaScript jumlalari

4-bobda fodalar (`expressions`) JavaScript iboralari sifatida ta’riflangan edi. Shu o‘xshatish bo‘yicha davom etsak, operatorlar (`statements`) JavaScript gaplari yoki buyruqlaridir. Ingliz tilidagi gaplar nuqta bilan yakunlanib, bir-biridan ajratilganidek, JavaScript operatorlari ham nuqtali vergul (`;`) bilan yakunlanadi (§2.6). Ifodalar qiymat hosil qilish uchun baholanadi, operatorlar esa biror amalni bajarish uchun ijro etiladi.

“Biror amalni bajarishning” bir usuli — bu qo‘shimcha ta’sirga (`side effects`) ega bo‘lgan ifodani baholashdir. O‘zlashtirishlar va funksiya chaqiruvlari kabi qo‘shimcha ta’sirga ega ifodalar mustaqil operator sifatida qatnasha oladi va bu holatda ular ifoda-operatorlar (`expression statements`)  deb nomlanadi. Operatorlarning shunga o‘xshash yana bir toifasi — bu yangi o‘zgaruvchilarni e’lon qiladigan va yangi funksiyalarni ta’riflaydigan e’lon operatorlaridir (`declaration statements`).

Mohiyatan, JavaScript dasturi — bu ijro etilishi kerak bo‘lgan operatorlar ketma-ketligidir. Standart holatda JavaScript interpretatori ularni dasturda yozilish tartibi bo‘yicha birin-ketin bajaradi. Dastur ijrosini boshqarishning yana bir yo‘li — ana shu standart tartibni o‘zgartirishdir. JavaScript'da aynan shu vazifani amalga oshirish uchun bir nechta maxsus operatorlar va boshqaruvchi konstruksiyalar mavjud:

**Shart operatorlari (Conditionals)**
: `if` va `switch` kabi operatorlar bo‘lib, ular ifoda qiymatiga qarab JavaScript interpretatorini boshqa operatorlarni bajarishga yoki o‘tkazib yuborishga majlaydi.

**Sikllar (Loops)**
: `while` va `for` kabi operatorlar bo‘lib, ular boshqa operatorlarni takroran ijro etadi.

**O‘tish operatorlari (Jumps)**
: `break`, `return` va `throw` kabi operatorlar bo‘lib, ular interpretatorni dasturning boshqa qismiga “sakrashga” majbur qiladi.

Keyingi bo‘limlarda JavaScript’dagi turli operatorlar tavsiflanadi va ularning sintaksisi tushuntiriladi. Bob so‘nggida keltirilgan 5-1-jadval ushbu sintaksisni umumlashtiradi. JavaScript dasturi — bu shunchaki bir-biridan nuqtali vergul bilan ajratilgan operatorlar ketma-ketligidir. Shunday ekan, JavaScript operatorlari bilan tanishib chiqqach, siz bemalol JavaScript dasturlarini yozishni boshlashingiz mumkin.