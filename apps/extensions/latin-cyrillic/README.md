# Latin-Cyrillic Chrome Extension

O'zbek lotin va kirill alifbolarini konvertatsiya qiluvchi Chrome extension.

## Xususiyatlar

- ✨ DeepL-style UX: Matn tanlanganda kichik "W" tugmasi paydo bo'ladi
- 🎨 Professional UI dizayni (shadcn/ui style)
- 🌓 Light/Dark theme support
- 🔄 Popup va content script o'rtasida theme sync
- ⚡ Tezkor konvertatsiya (Ctrl+Shift+L)
- 📋 Context menu integratsiyasi
- 🎯 Smart detection: Lotin → Kirill, Kirill → Lotin

## Development

```bash
# Extension development mode (hot reload)
pnpm ext:dev

# Yoki to'g'ridan-to'g'ri
cd apps/extensions/latin-cyrillic
pnpm dev
```

Development mode ishga tushgandan keyin:
1. Chrome'da `chrome://extensions` oching
2. "Developer mode" ni yoqing
3. "Load unpacked" tugmasini bosing
4. `apps/extensions/latin-cyrillic/.output/chrome-mv3` papkasini tanlang

## Production Build

```bash
# Extension build
pnpm ext:build

# ZIP fayl yaratish (Chrome Web Store uchun)
pnpm ext:zip
```

Build qilingandan keyin:
- Build fayllari: `apps/extensions/latin-cyrillic/.output/chrome-mv3/`
- ZIP fayl: `apps/extensions/latin-cyrillic/.output/latin-cyrillic-extension-X.X.X-chrome.zip`

## Chrome'ga O'rnatish

### Development (Local)
1. `pnpm ext:dev` yoki `pnpm ext:build` ni ishga tushiring
2. Chrome'da `chrome://extensions` oching
3. "Developer mode" ni yoqing (o'ng yuqori burchak)
4. "Load unpacked" tugmasini bosing
5. `.output/chrome-mv3` papkasini tanlang

### Production (ZIP)
1. `pnpm ext:zip` ni ishga tushiring
2. Chrome Web Store'ga yuklang yoki:
3. Chrome'da `chrome://extensions` oching
4. ZIP faylni drag & drop qiling

## Foydalanish

### 1. Popup (Extension Icon)
- Extension iconini bosing
- Matn kiriting va konvertatsiya qiling
- Theme switcher bilan light/dark o'zgartiring
- "Tezkor konvertatsiya" toggle'ni yoqing/o'chiring

### 2. Content Script (Sahifada)
- Biror sahifada matn tanlang
- Kichik "W" tugmasi paydo bo'ladi
- Tugmani bosing - popover ochiladi
- Matnni tahrirlang va konvertatsiya qiling

### 3. Context Menu
- Matn tanlang
- O'ng tugma → "Lotin ↔ Kirill konvertatsiya"
- Yoki "→ Кирилл" / "→ Lotin"

### 4. Keyboard Shortcut
- Matn tanlang
- `Ctrl+Shift+L` (Windows/Linux) yoki `Cmd+Shift+L` (Mac)
- Natija clipboard'ga nusxalanadi

## Arxitektura

```
apps/extensions/latin-cyrillic/
├── entrypoints/
│   ├── background.ts       # Service worker (context menu, shortcuts)
│   ├── content.ts          # Content script (trigger icon, popover)
│   └── popup/
│       ├── App.tsx         # Popup UI
│       ├── style.css       # Popup styles
│       └── index.html      # Popup HTML
├── public/
│   └── icon/               # Extension icons
├── wxt.config.ts           # WXT configuration
└── package.json

Shared packages:
├── @webiston/transliteration  # Konvertatsiya logic
└── @webiston/ui               # UI components (future)
```

## Tech Stack

- **WXT**: Modern web extension framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Styling
- **Vite**: Build tool
- **@webiston/transliteration**: Shared logic package

## Theme Support

Extension web app bilan bir xil theme system ishlatadi:
- Light mode: Oq background, qora text
- Dark mode: Qora background, oq text
- System: OS theme'ga moslashadi

Theme popup'da o'zgartirilsa, content script'dagi popover ham o'zgaradi (chrome.storage orqali sync).

## Troubleshooting

### Extension yuklanmayapti
- `.output/chrome-mv3` papkasi mavjudligini tekshiring
- `pnpm ext:build` ni qayta ishga tushiring

### Hot reload ishlamayapti
- `pnpm ext:dev` ishga tushganligini tekshiring
- Chrome'da extensionni reload qiling

### Theme o'zgarishlar ko'rinmayapti
- Popup'ni yoping va qayta oching
- Sahifani refresh qiling (content script uchun)

## Publishing

Chrome Web Store'ga yuklash:
1. `pnpm ext:zip` ni ishga tushiring
2. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) ga kiring
3. "New Item" tugmasini bosing
4. ZIP faylni yuklang
5. Ma'lumotlarni to'ldiring va publish qiling

## License

MIT
