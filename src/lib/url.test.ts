import { describe, it, expect } from "vitest";
import { normalizeUrl, isValidUrl, safeRedirectPath } from "./url";

describe("safeRedirectPath", () => {
  it("keeps paths on this site, including query and hash", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/checkout?tier=10&interval=annual")).toBe("/checkout?tier=10&interval=annual");
    expect(safeRedirectPath("/help#videos")).toBe("/help#videos");
  });

  it("falls back for missing or non-path values", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath("")).toBe("/dashboard");
    expect(safeRedirectPath("dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("@evil.com")).toBe("/dashboard");
  });

  it("blocks tricks that browsers treat as another site", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\t/evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\n/evil.com")).toBe("/dashboard");
  });

  it("uses a custom fallback when given", () => {
    expect(safeRedirectPath("//evil.com", "/login")).toBe("/login");
  });
});

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
