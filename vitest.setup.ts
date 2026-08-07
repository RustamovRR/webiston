import "@testing-library/jest-dom/vitest"

// jsdom ships no `matchMedia`. Components consult it for progressive
// behaviour only — autofocus on pointer devices, reduced-motion — so a stub
// that answers "no match" everywhere keeps them on their conservative path.
// jsdom ships no ResizeObserver either; SegmentedControl only uses it to
// re-measure its indicator, which never matters at jsdom's zero layout.
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }) as MediaQueryList
}
