import { describe, it, expect } from "vitest";
import { normalizeUrl, isValidUrl } from "./url";

describe("normalizeUrl", () => {
  it("adds https:// to bare domains", () => {
    expect(normalizeUrl("youtube.com")).toBe("https://youtube.com");
    expect(normalizeUrl("youtube.com/@me")).toBe("https://youtube.com/@me");
  });

  it("keeps an existing http:// or https:// (any casing)", () => {
    expect(normalizeUrl("https://youtube.com")).toBe("https://youtube.com");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeUrl("HTTPS://Example.com")).toBe("HTTPS://Example.com");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeUrl("  youtube.com  ")).toBe("https://youtube.com");
  });

  it("never lets a javascript: URL through as-is", () => {
    expect(normalizeUrl("javascript:alert(1)")).toMatch(/^https:\/\//);
  });
});

describe("isValidUrl", () => {
  it("accepts full URLs", () => {
    expect(isValidUrl("https://youtube.com")).toBe(true);
  });

  it("rejects bare domains and empty strings", () => {
    expect(isValidUrl("youtube.com")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });
});
