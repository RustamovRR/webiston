# Currency Converter - To'liq Implementatsiya Dokumentatsiyasi

## 📋 Umumiy Ma'lumot

**Tool Nomi:** Currency Converter (Valyuta Konverteri)  
**Maqsad:** O'zbekiston va dunyo valyutalarini real-time konvertatsiya qilish  
**API Manba:** O'zbekiston Markaziy Banki (CBU) + ExchangeRate-API (fallback)  
**Texnologiyalar:** Next.js 15, React 19, TypeScript, Recharts, Zustand

---

## 🏗️ Arxitektura va Struktura

### Fayl Tuzilishi
```
src/
├── app/(app)/[locale]/tools/currency-converter/
│   └── page.tsx                          # Next.js page with metadata & schemas
│
├── modules/tools/CurrencyConverter/
│   ├── CurrencyConverter.tsx             # Main component
│   ├── components/
│   │   ├── index.ts                      # Barrel export
│   │   ├── ConverterPanel.tsx            # Konvertatsiya paneli
│   │   ├── CurrencySelector.tsx          # Valyuta tanlash dropdown
│   │   ├── QuickPairs.tsx                # Tez-tez ishlatiladigan juftliklar
│   │   ├── RateChart.tsx                 # Tarixiy grafik (Recharts)
│   │   ├── ComparisonTable.tsx           # Valyutalar taqqoslash jadvali
│   │   ├── RateAlerts.tsx                # Kurs ogohlantirishlari
│   │   └── InfoSection.tsx               # Ma'lumot va FAQ
│   │
│   ├── hooks/
│   │   ├── index.ts                      # Barrel export
│   │   ├── useCurrencyConverter.ts       # Asosiy konvertatsiya logikasi
│   │   ├── useCurrencyRates.ts           # API va caching
│   │   ├── useRateHistory.ts             # Tarixiy ma'lumotlar
│   │   └── useRateAlerts.ts              # Ogohlantirishlar
│   │
│   ├── utils/
│   │   ├── index.ts                      # Barrel export
│   │   ├── currencyCalculations.ts       # Hisoblash funksiyalari
│   │   ├── currencyFormatters.ts         # Format qilish
│   │   └── popularPairs.ts               # Popular juftliklar ro'yxati
│   │
│   └── types/
│       └── index.ts                      # TypeScript interfaces
│
├── lib/api/
│   ├── cbu.ts                            # CBU API client
│   └── exchangerate.ts                   # ExchangeRate-API client
│
└── stores/
    └── currencyStore.ts                  # Zustand store (caching)
```

---

## 📊 Ma'lumotlar Strukturasi

### TypeScript Interfaces

```typescript
// src/modules/tools/CurrencyConverter/types/index.ts

export interface CurrencyRate {
  id: number
  code: string              // "USD", "EUR", "RUB"
  name_uz: string           // "AQSH dollari"
  name_en: string           // "US Dollar"
  name_ru: string           // "Доллар США"
  rate: number              // 11895.57 (UZS ga nisbatan)
  nominal: number           // 1 (ba'zi valyutalar 10)
  diff: number              // -45.38 (kunlik o'zgarish)
  date: string              // "02.12.2025"
}

export interface HistoricalRate {
  date: string
  rate: number
}

export interface CurrencyPair {
  from: string
  to: string
  rate: number
  inverseRate: number
}

export interface RateAlert {
  id: string
  currencyCode: string
  targetRate: number
  condition: 'above' | 'below'
  isActive: boolean
  createdAt: string
}

export interface ConversionResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  result: number
  rate: number
  timestamp: string
}
```

---

## 🔌 API Integration

### 1. CBU API Client

```typescript
// src/lib/api/cbu.ts

export interface CBURate {
  id: number
  Code: string
  Ccy: string
  CcyNm_UZ: string
  CcyNm_EN: string
  CcyNm_RU: string
  Nominal: string
  Rate: string
  Diff: string
  Date: string
}

const CBU_BASE_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json'

export async function fetchCurrentRates(): Promise<CurrencyRate[]> {
  const response = await fetch(CBU_BASE_URL, {
    next: { revalidate: 3600 } // 1 soat cache
  })
  
  if (!response.ok) throw new Error('Failed to fetch rates')
  
  const data: CBURate[] = await response.json()
  
  return data.map(item => ({
    id: item.id,
    code: item.Ccy,
    name_uz: item.CcyNm_UZ,
    name_en: item.CcyNm_EN,
    name_ru: item.CcyNm_RU,
    rate: parseFloat(item.Rate),
    nominal: parseInt(item.Nominal),
    diff: parseFloat(item.Diff),
    date: item.Date
  }))
}

export async function fetchHistoricalRates(
  currencyCode: string,
  startDate: string,
  endDate?: string
): Promise<HistoricalRate[]> {
  const url = endDate 
    ? `${CBU_BASE_URL}/${currencyCode}/${startDate}/${endDate}/`
    : `${CBU_BASE_URL}/${currencyCode}/${startDate}/`
    
  const response = await fetch(url)
  
  if (!response.ok) throw new Error('Failed to fetch historical rates')
  
  const data: CBURate[] = await response.json()
  
  return data.map(item => ({
    date: item.Date,
    rate: parseFloat(item.Rate) / parseInt(item.Nominal)
  }))
}
```

### 2. ExchangeRate-API Client (Fallback)

```typescript
// src/lib/api/exchangerate.ts

const EXCHANGERATE_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

export async function fetchGlobalRates(baseCurrency: string = 'USD') {
  const response = await fetch(`${EXCHANGERATE_BASE_URL}/${baseCurrency}`)
  
  if (!response.ok) throw new Error('Failed to fetch global rates')
  
  return response.json()
}
```

---

## 🎯 Step-by-Step Implementatsiya

### PHASE 1: Asosiy Struktura (Kun 1)

#### 1.1 - Types va Constants
- ✅ TypeScript interfaces yaratish
- ✅ Popular currency pairs ro'yxati
- ✅ Currency flags/icons mapping

#### 1.2 - API Layer
- ✅ CBU API client
- ✅ ExchangeRate-API client
- ✅ Error handling
- ✅ Type safety

#### 1.3 - Zustand Store
- ✅ Rates caching
- ✅ Last update timestamp
- ✅ Loading states
- ✅ Error states

---

### PHASE 2: Core Hooks (Kun 2)

#### 2.1 - useCurrencyRates Hook
```typescript
// Vazifalar:
- CBU API dan ma'lumot olish
- LocalStorage cache
- Auto-refresh (har 1 soat)
- Error handling
- Loading states
```

#### 2.2 - useCurrencyConverter Hook
```typescript
// Vazifalar:
- Amount input handling
- Currency selection
- Real-time conversion
- Cross-rate calculation
- Swap currencies
- Format numbers
```

#### 2.3 - useRateHistory Hook
```typescript
// Vazifalar:
- Tarixiy ma'lumotlar olish
- Date range selection (7/30/90 kun)
- Data formatting for charts
- Cache management
```

---

### PHASE 3: UI Components (Kun 3-4)

#### 3.1 - ConverterPanel Component
```typescript
// Features:
- Amount input (formatted)
- Currency selector (from)
- Swap button (animated)
- Currency selector (to)
- Result display (large, formatted)
- Rate info (1 USD = X UZS)
- Last update time
```

#### 3.2 - CurrencySelector Component
```typescript
// Features:
- Search/filter currencies
- Flag icons
- Currency names (3 til)
- Popular currencies on top
- Keyboard navigation
- Recent selections
```

#### 3.3 - QuickPairs Component
```typescript
// Features:
- USD/UZS, RUB/UZS, EUR/UZS, etc.
- One-click selection
- Current rates display
- Trend indicators (↑↓)
- Responsive grid
```

---

### PHASE 4: Advanced Features (Kun 5)

#### 4.1 - RateChart Component
```typescript
// Features:
- Recharts line chart
- 7/30/90 kun tabs
- Zoom & pan
- Tooltip with exact values
- Min/max markers
- Trend line
- Export chart (PNG)
```

#### 4.2 - ComparisonTable Component
```typescript
// Features:
- Top 10 currencies
- Today vs Yesterday
- % change
- Trend indicators
- Sort by change
- Responsive table
```

#### 4.3 - RateAlerts Component
```typescript
// Features:
- Set target rate
- Above/below condition
- Browser notifications
- Alert history
- Enable/disable alerts
- LocalStorage persistence
```

---

### PHASE 5: Polish & SEO (Kun 6-7)

#### 5.1 - InfoSection Component
```typescript
// Content:
- Qanday ishlaydi?
- Cross-rate tushuntirish
- FAQ section
- Foydali maslahatlar
- Banklar bilan taqqoslash
```

#### 5.2 - Page Metadata & Schemas
```typescript
// SEO:
- Title, description, keywords
- OpenGraph tags
- Twitter cards
- Structured data (WebApplication)
- FAQ schema
- Breadcrumb schema
- HowTo schema
```

#### 5.3 - Internationalization
```typescript
// Translations:
- messages/tools/currency-converter/uz.json
- messages/tools/currency-converter/en.json
- messages/tools/currency-converter/ru.json
```

---

## 🎨 UI/UX Design Principles

### Layout Structure
```
┌─────────────────────────────────────────┐
│  Header (Title + Description)           │
├─────────────────────────────────────────┤
│  Quick Pairs (USD, RUB, EUR, etc.)      │
├─────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────┐ │
│  │  Converter      │  │  Rate Info   │ │
│  │  Panel          │  │  - Current   │ │
│  │                 │  │  - Change    │ │
│  │  [Amount]       │  │  - Updated   │ │
│  │  [From] ⇄ [To] │  └──────────────┘ │
│  │  [Result]       │                   │
│  └─────────────────┘                   │
├─────────────────────────────────────────┤
│  Rate Chart (7/30/90 days)              │
├─────────────────────────────────────────┤
│  Comparison Table                        │
├─────────────────────────────────────────┤
│  Rate Alerts                             │
├─────────────────────────────────────────┤
│  Info Section + FAQ                      │
└─────────────────────────────────────────┘
```

### Color Scheme
```typescript
// Trend colors
const TREND_COLORS = {
  up: 'text-green-500',
  down: 'text-red-500',
  neutral: 'text-zinc-400'
}

// Currency categories
const CATEGORY_COLORS = {
  popular: 'bg-blue-500/10 border-blue-500/20',
  crypto: 'bg-purple-500/10 border-purple-500/20',
  fiat: 'bg-zinc-500/10 border-zinc-500/20'
}
```

### Animations
```typescript
// Framer Motion variants
- Number counter animation
- Swap button rotation
- Chart entrance
- Alert notifications
- Loading skeletons
```

---

## 🔧 Utility Functions

### Currency Calculations
```typescript
// src/modules/tools/CurrencyConverter/utils/currencyCalculations.ts

export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number,
  fromNominal: number = 1,
  toNominal: number = 1
): number {
  // UZS → Foreign: amount / (rate / nominal)
  // Foreign → UZS: amount * (rate / nominal)
  // Foreign → Foreign: (amount / fromRate) * toRate
  
  const fromInUZS = amount * (fromRate / fromNominal)
  const result = fromInUZS / (toRate / toNominal)
  
  return result
}

export function calculateCrossRate(
  fromRate: number,
  toRate: number
): number {
  return toRate / fromRate
}

export function calculatePercentChange(
  current: number,
  previous: number
): number {
  return ((current - previous) / previous) * 100
}
```

### Currency Formatters
```typescript
// src/modules/tools/CurrencyConverter/utils/currencyFormatters.ts

export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'uz-UZ'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode === 'UZS' ? 'UZS' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(
  num: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num)
}
```

---

## 💾 Caching Strategy

### LocalStorage Structure
```typescript
interface CacheData {
  rates: CurrencyRate[]
  lastUpdate: string
  expiresAt: string
}

const CACHE_KEY = 'currency_rates_cache'
const CACHE_DURATION = 3600000 // 1 soat (ms)

// Save to cache
localStorage.setItem(CACHE_KEY, JSON.stringify({
  rates: data,
  lastUpdate: new Date().toISOString(),
  expiresAt: new Date(Date.now() + CACHE_DURATION).toISOString()
}))

// Read from cache
const cached = localStorage.getItem(CACHE_KEY)
if (cached) {
  const { rates, expiresAt } = JSON.parse(cached)
  if (new Date(expiresAt) > new Date()) {
    return rates // Cache valid
  }
}
```

### Zustand Store
```typescript
// src/stores/currencyStore.ts

interface CurrencyStore {
  rates: CurrencyRate[]
  lastUpdate: string | null
  isLoading: boolean
  error: string | null
  
  fetchRates: () => Promise<void>
  setRates: (rates: CurrencyRate[]) => void
  clearError: () => void
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  rates: [],
  lastUpdate: null,
  isLoading: false,
  error: null,
  
  fetchRates: async () => {
    set({ isLoading: true, error: null })
    try {
      const rates = await fetchCurrentRates()
      set({ 
        rates, 
        lastUpdate: new Date().toISOString(),
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false 
      })
    }
  },
  
  setRates: (rates) => set({ rates }),
  clearError: () => set({ error: null })
}))
```

---

## 🌐 Internationalization

### Translation Keys Structure
```json
// messages/tools/currency-converter/uz.json
{
  "ToolHeader": {
    "title": "Valyuta Konverteri",
    "description": "O'zbekiston va dunyo valyutalarini real-time konvertatsiya qiling"
  },
  "converter": {
    "amount": "Miqdor",
    "from": "Dan",
    "to": "Ga",
    "result": "Natija",
    "swap": "Almashtirish",
    "rate": "Kurs",
    "lastUpdate": "Oxirgi yangilanish"
  },
  "quickPairs": {
    "title": "Tez konvertatsiya",
    "popular": "Mashhur"
  },
  "chart": {
    "title": "Kurs tarixi",
    "days7": "7 kun",
    "days30": "30 kun",
    "days90": "90 kun",
    "high": "Eng yuqori",
    "low": "Eng past",
    "average": "O'rtacha"
  },
  "comparison": {
    "title": "Valyutalar taqqoslash",
    "currency": "Valyuta",
    "rate": "Kurs",
    "change": "O'zgarish",
    "trend": "Trend"
  },
  "alerts": {
    "title": "Kurs ogohlantirishlari",
    "create": "Ogohlantirish yaratish",
    "target": "Maqsadli kurs",
    "condition": "Shart",
    "above": "Yuqorida",
    "below": "Pastda",
    "active": "Faol",
    "inactive": "Nofaol"
  },
  "info": {
    "howItWorks": "Qanday ishlaydi?",
    "crossRate": "Cross-rate nima?",
    "faq": "Ko'p so'raladigan savollar"
  }
}
```

---

## 📱 Responsive Design

### Breakpoints
```typescript
// Mobile: < 640px
- Single column layout
- Stacked converter panel
- Simplified chart
- Compact table

// Tablet: 640px - 1024px
- Two column layout
- Side-by-side converter
- Full chart
- Scrollable table

// Desktop: > 1024px
- Three column layout (optional)
- Full features
- Large chart
- Full table
```

---

## ✅ Testing Checklist

### Functional Tests
- [ ] Currency conversion accuracy
- [ ] Cross-rate calculations
- [ ] Swap functionality
- [ ] Amount input validation
- [ ] Currency search/filter
- [ ] Historical data loading
- [ ] Chart rendering
- [ ] Alert creation/deletion
- [ ] Cache expiration
- [ ] Error handling

### UI/UX Tests
- [ ] Responsive on all devices
- [ ] Animations smooth
- [ ] Loading states
- [ ] Error messages
- [ ] Accessibility (keyboard nav)
- [ ] Dark mode support
- [ ] RTL support (if needed)

### Performance Tests
- [ ] Initial load < 2s
- [ ] API response caching
- [ ] Chart rendering < 500ms
- [ ] No memory leaks
- [ ] Optimized re-renders

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All features implemented
- [ ] Translations complete (UZ, EN, RU)
- [ ] SEO metadata optimized
- [ ] Structured data added
- [ ] Error tracking setup
- [ ] Analytics events
- [ ] Performance optimized
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile testing

### Post-Launch
- [ ] Monitor API errors
- [ ] Track user engagement
- [ ] Collect feedback
- [ ] A/B test features
- [ ] Optimize based on data
- [ ] Add more currencies
- [ ] Improve chart features
- [ ] Add export functionality

---

## 📈 Success Metrics

### KPIs
- Daily Active Users (DAU)
- Conversion rate (visits → conversions)
- Average session duration
- Bounce rate
- API error rate
- Cache hit rate
- Page load time
- Mobile vs Desktop usage

### Goals (3 months)
- 1000+ daily conversions
- < 2s average load time
- < 1% API error rate
- > 80% cache hit rate
- 4.5+ star rating

---

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Cryptocurrency support
- [ ] Historical comparison (year-over-year)
- [ ] Currency calculator widget (embed)
- [ ] API endpoint for developers
- [ ] Email alerts
- [ ] Telegram bot integration
- [ ] PWA offline mode
- [ ] Multi-currency conversion (3+ currencies)
- [ ] Currency converter Chrome extension
- [ ] Bank rates comparison
- [ ] Travel calculator (budget planning)
- [ ] Investment calculator

---

## 📚 Resources

### APIs
- CBU API: https://cbu.uz/uz/arkhiv-kursov-valyut/json/
- ExchangeRate-API: https://www.exchangerate-api.com/
- Currency Flags: https://flagcdn.com/

### Libraries
- Recharts: https://recharts.org/
- Zustand: https://zustand-demo.pmnd.rs/
- date-fns: https://date-fns.org/
- Framer Motion: https://www.framer.com/motion/

### Design Inspiration
- Google Currency Converter
- XE.com
- Wise.com
- Revolut

---

**Dokumentatsiya versiyasi:** 1.0  
**Oxirgi yangilanish:** 02.12.2025  
**Muallif:** Webiston Development Team
