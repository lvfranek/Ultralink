import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getEffectivePlan, isProActive } from "./types";

const NOW = new Date("2026-06-15T12:00:00Z");
const tomorrow = "2026-06-16T12:00:00Z";
const yesterday = "2026-06-14T12:00:00Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("getEffectivePlan", () => {
  it("is pro for active, trialing and grace", () => {
    expect(getEffectivePlan({ subscription_status: "active" })).toBe("pro");
    expect(getEffectivePlan({ subscription_status: "trialing" })).toBe("pro");
    expect(getEffectivePlan({ subscription_status: "grace" })).toBe("pro");
  });

  it("is free for everything else", () => {
    expect(getEffectivePlan({ subscription_status: "none" })).toBe("free");
    expect(getEffectivePlan({ subscription_status: "canceled" })).toBe("free");
    expect(getEffectivePlan({ subscription_status: "past_due" })).toBe("free");
  });
});

describe("isProActive", () => {
  it("is true for active and trialing subscriptions", () => {
    expect(isProActive({ subscription_status: "active", grace_period_ends_at: null })).toBe(true);
    expect(isProActive({ subscription_status: "trialing", grace_period_ends_at: null })).toBe(true);
  });

  it("keeps Pro during the payment grace period", () => {
    expect(isProActive({ subscription_status: "grace", grace_period_ends_at: tomorrow })).toBe(true);
  });

  it("ends Pro once the grace period has passed", () => {
    expect(isProActive({ subscription_status: "grace", grace_period_ends_at: yesterday })).toBe(false);
    expect(isProActive({ subscription_status: "grace", grace_period_ends_at: null })).toBe(false);
  });

  it("is false for free, canceled and past-due accounts", () => {
    expect(isProActive({ subscription_status: "none", grace_period_ends_at: null })).toBe(false);
    expect(isProActive({ subscription_status: "canceled", grace_period_ends_at: tomorrow })).toBe(false);
    expect(isProActive({ subscription_status: "past_due", grace_period_ends_at: null })).toBe(false);
  });
});
