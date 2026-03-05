# Latin-Cyrillic Transliteration Module

Converts text between Uzbek Latin and Cyrillic scripts with Russian Cyrillic support.

## Features

- ✅ Uzbek Latin ↔ Cyrillic conversion
- ✅ Russian Cyrillic → Latin support
- ✅ Apostrophe normalization (all variants → `'`)
- ✅ Protected content (URLs, emails, code blocks)
- ✅ Case preservation
- ✅ Technical terms protection

## Usage

```typescript
import { toCyrillic, toLatin } from "@/modules/tools/LatinCyrillic"

// Latin to Cyrillic
toCyrillic("Salom dunyo!") // → "Салом дунё!"
toCyrillic("O'zbekiston")  // → "Ўзбекистон"

// Cyrillic to Latin
toLatin("Салом дунё!")     // → "Salom dunyo!"
toLatin("Ўзбекистон")      // → "O'zbekiston"

// Russian support
toLatin("Щедрый")          // → "Shchedryy"
```

## Structure

```
LatinCyrillic/
├── components/          # UI components
│   └── InfoSection.tsx
├── constants/           # Static data
│   ├── protected-words.ts
│   ├── samples.ts
│   └── info-cards.tsx
├── hooks/               # React hooks
│   └── useLatinCyrillic.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Core logic
│   ├── transliterate.ts # Main API
│   ├── helpers.ts       # Utility functions
│   ├── detect-script.ts # Script detection
│   └── mappings/        # Character mappings
├── __tests__/           # Unit tests
├── LatinCyrillic.tsx    # Main component
└── index.ts             # Public exports
```

## API

### `toCyrillic(text: string): string`
Converts Latin text to Cyrillic.

### `toLatin(text: string): string`
Converts Cyrillic text to Latin.

### `detectScript(text: string): ScriptType`
Detects script type: `"latin"`, `"cyrillic"`, `"mixed"`, or `"unknown"`.

## Character Mappings

### Uzbek Special Characters
| Latin | Cyrillic |
|-------|----------|
| o'    | ў        |
| g'    | ғ        |
| sh    | ш        |
| ch    | ч        |
| ng    | нг       |
| q     | қ        |
| h     | ҳ        |

### Russian-Only Characters
| Cyrillic | Latin |
|----------|-------|
| щ        | shch  |
| ы        | y     |
| ъ        | '     |
| ь        | '     |

## Protected Content

These are NOT transliterated:
- URLs (`https://...`)
- Emails (`user@example.com`)
- Code blocks (`` `code` ``)
- Technical terms (see `constants/protected-words.ts`)

## Apostrophe Handling

All apostrophe variants are normalized to standard `'`:
- Input: `` ` ´ ' ' ʻ ʼ ʿ ˈ ′ ``
- Output: `'`

## Testing

```bash
pnpm test src/modules/tools/LatinCyrillic
```
