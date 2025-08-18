## 4.4 Xossalarga murojaat qilish ifodalari

**Xossaga murojaat qilish ifodasi (Property access expression)** obyekt xossasining yoki massiv elementining qiymatini ifodalaydi. JavaScript xossaga murojaat qilish uchun ikki xil sintaksisni taqdim etadi:

``` js
ifoda . identifikator
ifoda [ ifoda ]
```

Birinchi uslubdagi xossaga murojaat ifodasi, biror ifodadan keyin keladigan nuqta va identifikator ko‘rinishida bo‘ladi. Birinchi ifoda obyektni, identifikator esa kerakli xossaning nomini belgilaydi. Ikkinchi uslubdagi xossaga murojaatda esa, birinchi ifodadan (obyekt yoki massivdan) keyin kvadrat qavslar ichida yana bir ifoda keladi. Bu ikkinchi ifoda kerakli xossaning nomini yoki kerakli massiv elementining indeksini belgilaydi.

Quyida bir nechta aniq misollar keltirilgan:

``` js
let o = {x: 1, y: {z: 3}};  // Misol uchun obyekt
let a = [o, 4, [5, 6]];     // Ichida obyekt mavjud bo'lgan massiv misoli
o.x                         // => 1: `o` ifodasining `x` xossasi
o.y.z                       // => 3: `o.y` ifodasining `z` xossasi
o["x"]                      // => 1: `o` obyektining `x` xossasi
a[1]                        // => 4: `a` ifodasining 1-indeksidagi elementi
a[2]["1"]                   // => 6: `a[2]` ifodasining 1-indeksidagi elementi
a[0].x                      // => 1: `a[0]` ifodasining `x` xossasi
```

Xossaga murojaat qilish ifodasining har ikki turida ham, `.` yoki `[` belgisidan oldingi ifoda birinchi bo‘lib bajariladi. Agar bu ifodaning qiymati `null` yoki `undefined` bo‘lsa, ifoda `TypeError` xatoligiga sabab bo‘ladi, chunki bu ikki JavaScript qiymati xossalarga ega bo‘la olmaydi.

Agar obyekt ifodasidan keyin nuqta va identifikator kelsa, o‘sha identifikator bilan nomlangan xossaning qiymati qidiriladi va u butun ifodaning yakuniy qiymatiga aylanadi. Agar obyekt ifodasidan keyin kvadrat qavslar ichida boshqa bir ifoda kelsa, o‘sha ikkinchi ifoda bajariladi va satrga o‘zgartiriladi. Shundan so‘ng, butun ifodaning yakuniy qiymati o‘sha satr bilan nomlangan xossaning qiymati bo‘ladi. Har ikki holatda ham, agar nomlangan xossa mavjud bo‘lmasa, xossaga murojaat qilish ifodasining qiymati `undefined` bo‘ladi.

`.identifikator` sintaksisi xossaga murojaat qilishning ikki variantidan soddarog‘idir, lekin e’tibor bering, u faqat siz murojaat qilmoqchi bo‘lgan xossaning nomi ruxsat etilgan identifikator bo‘lganda va siz dasturni yozayotganda bu nomni bilganingizdagina ishlatilishi mumkin. Agar xossa nomi bo‘shliqlar yoki tinish belgilarini o‘z ichiga olsa, yoki u son bo‘lsa (massivlar uchun), siz kvadrat qavslar yozuvidan foydalanishingiz shart. Kvadrat qavslar, shuningdek, xossa nomi statik bo‘lmay, o‘zi ham biror hisob-kitob natijasi bo‘lganda ishlatiladi (misol uchun §6.3.1-bo‘limga qarang).

Obyektlar va ularning xossalari 6-bobda, massivlar va ularning elementlari esa 7-bobda batafsil yoritilgan.