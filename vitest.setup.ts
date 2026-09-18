// Adds DOM matchers like toBeInTheDocument() / toBeDisabled() to expect().
import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia; components use it for prefers-reduced-motion.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
