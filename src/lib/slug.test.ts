import { describe, it, expect } from "vitest";
import { sanitizeSlug, validateSlug } from "./slug";

describe("sanitizeSlug", () => {
  it("lowercases and replaces invalid characters with hyphens", () => {
    expect(sanitizeSlug("My Name!")).toBe("my-name");
    expect(sanitizeSlug("  Hello World  ")).toBe("hello-world");
  });

  it("collapses repeated hyphens and strips them from the ends", () => {
    expect(sanitizeSlug("--a---b--")).toBe("a-b");
  });
});

describe("validateSlug", () => {
  it("accepts valid slugs", () => {
    expect(validateSlug("franek")).toBeNull();
    expect(validateSlug("ab")).toBeNull();
    expect(validateSlug("my-page-2")).toBeNull();
  });

  it("rejects empty, too short and too long slugs", () => {
    expect(validateSlug("")).toMatch(/required/);
    expect(validateSlug("a")).toMatch(/at least 2/);
    expect(validateSlug("a".repeat(31))).toMatch(/30 characters/);
  });

  it("rejects slugs that start or end with a hyphen", () => {
    expect(validateSlug("-abc")).not.toBeNull();
    expect(validateSlug("abc-")).not.toBeNull();
  });

  it("rejects reserved slugs so pages can't shadow app routes", () => {
    expect(validateSlug("dashboard")).toMatch(/reserved/);
    expect(validateSlug("login")).toMatch(/reserved/);
  });
});
