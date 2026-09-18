import { describe, it, expect } from "vitest";
import { resolveTheme, DEFAULT_THEME } from "./theme";

describe("resolveTheme", () => {
  it("returns the default theme for missing or empty values", () => {
    expect(resolveTheme(null)).toEqual(DEFAULT_THEME);
    expect(resolveTheme(undefined)).toEqual(DEFAULT_THEME);
    expect(resolveTheme({})).toEqual(DEFAULT_THEME);
  });

  it("keeps valid presets and 'custom'", () => {
    expect(resolveTheme({ preset: "sunset" }).preset).toBe("sunset");
    expect(resolveTheme({ preset: "custom" }).preset).toBe("custom");
  });

  it("falls back to the default preset for unknown (e.g. removed) presets", () => {
    expect(resolveTheme({ preset: "max_conversion" }).preset).toBe(DEFAULT_THEME.preset);
  });

  it("fills in missing fields from the defaults", () => {
    const theme = resolveTheme({ pageBg: { type: "color", value: "#000000" } });
    expect(theme.pageBg.value).toBe("#000000");
    expect(theme.pageBg.overlay).toBe(DEFAULT_THEME.pageBg.overlay);
    expect(theme.fonts).toEqual(DEFAULT_THEME.fonts);
    expect(theme.colors).toEqual(DEFAULT_THEME.colors);
  });

  it("ignores wrongly-typed numbers instead of crashing", () => {
    const theme = resolveTheme({ pageBg: { type: "color", value: "#000", overlay: "50%", blur: "lots" } });
    expect(theme.pageBg.overlay).toBe(DEFAULT_THEME.pageBg.overlay);
    expect(theme.pageBg.blur).toBe(0);
  });

  it("drops fields from older theme versions", () => {
    const theme = resolveTheme({ preset: "mint", button: { corner: "pill" }, animation: "bounce" });
    expect(theme).not.toHaveProperty("button");
    expect(theme).not.toHaveProperty("animation");
  });
});
