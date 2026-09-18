import { describe, it, expect } from "vitest";
import { isValidEmail, friendlyAuthError } from "./auth-errors";

describe("isValidEmail", () => {
  it("accepts normal addresses", () => {
    expect(isValidEmail("jane@example.com")).toBe(true);
    expect(isValidEmail("jane.doe+work@mail.example.co")).toBe(true);
  });

  it("rejects incomplete or malformed addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("jane")).toBe(false);
    expect(isValidEmail("jane@example")).toBe(false);
    expect(isValidEmail("jane @example.com")).toBe(false);
  });
});

describe("friendlyAuthError", () => {
  const msg = (text: string) => friendlyAuthError(new Error(text));

  it("explains wrong credentials and flags them", () => {
    expect(msg("Invalid login credentials")).toEqual({
      message: "Wrong email or password. Try again, or reset your password.",
      wrongPassword: true,
    });
  });

  it("flags unconfirmed emails so the form can offer a resend", () => {
    expect(msg("Email not confirmed").unconfirmed).toBe(true);
  });

  it("maps rate limits, network problems, weak passwords and taken usernames", () => {
    expect(msg("Email rate limit exceeded").message).toMatch(/Too many attempts/);
    expect(msg("Failed to fetch").message).toMatch(/connection/);
    expect(msg("Password should be at least 8 characters").message).toMatch(/at least 8/);
    expect(msg('duplicate key value violates unique constraint "profiles_username_key"').message).toMatch(
      /username was just taken/,
    );
  });

  it("never shows raw technical errors to users", () => {
    expect(msg("Database error: relation does not exist").message).toBe("Something went wrong. Please try again.");
    expect(friendlyAuthError("plain string").message).toBe("Something went wrong. Please try again.");
  });
});
