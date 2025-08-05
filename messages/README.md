# Translation Files Structure

Bu papka loyihadagi barcha translation fayllarini o'z ichiga oladi. Fayllar code-splitting prinsipi asosida tashkil etilgan.

## Struktura

```
messages/
├── common/           # Umumiy komponentlar
│   ├── uz.json      # O'zbek tili
│   └── en.json      # Ingliz tili
├── tools/           # Tool-specific translations
│   ├── tools-page/  # Tools sahifasi
│   ├── json-formatter/
│   ├── url-encoder/
│   ├── base64-converter/
│   ├── jwt-decoder/
│   ├── latin-cyrillic/
│   ├── color-converter/
│   ├── hash-generator/
│   ├── uuid-generator/
│   └── qr-generator/
├── index.js         # Barcha fayllarni birlashtiruvchi
└── README.md        # Bu fayl
```

## Migration Status

✅ **Completed:**

- `common/` - HomePage, Header, Common, Filters
- `tools/tools-page/` - ToolsPage, Tools, ToolCategories
- `tools/json-formatter/` - JsonFormatterPage (to'liq)
- `tools/url-encoder/` - UrlEncoderPage (to'liq)
- `tools/base64-converter/` - Base64ConverterPage (to'liq)
- `tools/jwt-decoder/` - JwtDecoderPage (to'liq)
- `tools/latin-cyrillic/` - LatinCyrillicPage (to'liq)
- `tools/color-converter/` - ColorConverterPage (to'liq)
- `tools/hash-generator/` - HashGeneratorPage (to'liq)
- `tools/uuid-generator/` - UuidGeneratorPage (to'liq)
- `tools/qr-generator/` - QrGeneratorPage (to'liq)

## Foydalanish

Translation fayllar `index.js` orqali birlashtirilib, i18n sistemasiga uzatiladi:

```javascript
import translations from './messages/index.js'
// translations.uz va translations.en mavjud
```

## Yangi Tool Qo'shish

1. `tools/` papkasida yangi papka yarating
2. `uz.json` va `en.json` fayllarini yarating
3. `index.js` faylida import va merge qiling

## Naming Convention

- Papka nomlari: kebab-case (`json-formatter`)
- Key nomlari: PascalCase (`JsonFormatterPage`)
- Nested keys: camelCase (`inputPlaceholder`)
