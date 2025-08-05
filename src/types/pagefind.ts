export interface PagefindSubResult {
  title: string
  url: string
  excerpt: string
  // Add other potential fields if necessary
}

export interface PagefindResultData {
  url: string
  excerpt: string
  meta: {
    title?: string
    image?: string
    // Add other potential meta fields
  }
  sub_results: PagefindSubResult[]
}

export interface PagefindResult {
  id: string
  data: () => Promise<PagefindResultData>
}

export interface PagefindSearchResponse {
  results: PagefindResult[]
}

// This can be expanded with options if needed
export interface Pagefind {
  init: () => Promise<void>
  options: (options: any) => Promise<void>
  search: (query: string, options?: any) => Promise<PagefindSearchResponse>
  debouncedSearch: (query: string, options?: any, debounce?: number) => Promise<PagefindSearchResponse | null>
  destroy: () => Promise<void>
}

// Make it available on the window object for easy access
declare global {
  interface Window {
    pagefind?: Pagefind
  }
}
