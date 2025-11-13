# Historical Globe - Setup Guide

## ✅ O'rnatilgan paketlar:
- `cesium` - 3D globe library
- `resium` - React wrapper for Cesium

## 📁 Yaratilgan fayllar:

### 1. Komponentlar:
- `src/modules/historical-globe/HistoricalGlobe.tsx` - Asosiy komponent
- `src/app/(app)/[locale]/historical-globe/page.tsx` - Sahifa

### 2. Konfiguratsiya:
- `next.config.ts` - Webpack config (Cesium uchun)
- `scripts/copy-cesium.js` - Cesium static fayllarni copy qilish
- `src/types/cesium.d.ts` - TypeScript declarations

### 3. Ma'lumotlar:
- `public/cesium/` - Cesium static files
- `public/historical-basemaps/` - GeoJSON data

### 4. Stillar:
- `src/app/globals.css` - Custom slider styles

## 🚀 Ishga tushirish:

```bash
# Agar server ishlamasa
pnpm dev

# Brauzerda
http://localhost:3000/historical-globe
```

## 🎮 Xususiyatlar:

- ✅ 3D interaktiv globus
- ✅ Timeline slider (BC 123,000 - hozir)
- ✅ Play/Pause animatsiya
- ✅ Reset tugmasi
- ✅ Yil ko'rsatish (BC/AD)
- ✅ Davlatlar soni
- ✅ Info panel
- ✅ Loading state
- ✅ Error handling

## 🔧 Texnik tafsilotlar:

### Cesium sozlamalari:
- Base URL: `/cesium`
- Ion token: Public demo token
- Terrain: World Terrain
- Camera: Top-down view

### GeoJSON loading:
- Dynamic loading per year
- Random colors per territory
- White outlines
- Clamped to ground

## 📝 Keyingi yaxshilashlar:

- [ ] Davlatlar ro'yxati sidebar
- [ ] Qidiruv funksiyasi  
- [ ] Tooltip (davlat haqida ma'lumot)
- [ ] Kamera animatsiyalari
- [ ] Performance optimizatsiya
- [ ] Mobile responsive
- [ ] Keyboard shortcuts
- [ ] Bookmark specific years

## 🐛 Agar muammo bo'lsa:

```bash
# Cesium fayllarni qayta copy qilish
node scripts/copy-cesium.js

# Cache tozalash
rm -rf .next
pnpm dev
```
