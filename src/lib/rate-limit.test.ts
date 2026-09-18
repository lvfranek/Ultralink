import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit } from "./rate-limit";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets once the window has passed", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 1, 60);
    expect(rateLimit(key, 1, 60).allowed).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect(rateLimit(key, 1, 60).allowed).toBe(true);
  });

  it("keeps different keys independent", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    rateLimit(keyA, 1, 60);
    expect(rateLimit(keyA, 1, 60).allowed).toBe(false);
    expect(rateLimit(keyB, 1, 60).allowed).toBe(true);
  });
});
