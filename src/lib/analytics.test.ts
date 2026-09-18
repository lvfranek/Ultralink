import { describe, it, expect } from "vitest";
import { parseDevice, parseReferrer } from "./analytics";

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  androidPhone: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  androidTablet: "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  macChrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  windowsEdge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  googlebotMobile: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  whatsappPreview: "WhatsApp/2.23.20.0 A",
  curl: "curl/8.7.1",
};

describe("parseDevice", () => {
  it("detects phones", () => {
    expect(parseDevice(UA.iphone)).toBe("mobile");
    expect(parseDevice(UA.androidPhone)).toBe("mobile");
  });

  it("detects tablets", () => {
    expect(parseDevice(UA.ipad)).toBe("tablet");
    expect(parseDevice(UA.androidTablet)).toBe("tablet");
  });

  it("detects desktops", () => {
    expect(parseDevice(UA.macChrome)).toBe("desktop");
    expect(parseDevice(UA.windowsEdge)).toBe("desktop");
  });

  it("flags crawlers and link previews as bots, even when they look like phones", () => {
    expect(parseDevice(UA.googlebotMobile)).toBe("bot");
    expect(parseDevice(UA.whatsappPreview)).toBe("bot");
  });

  it("returns unknown for missing or unrecognizable user agents", () => {
    expect(parseDevice(null)).toBe("unknown");
    expect(parseDevice(UA.curl)).toBe("unknown");
  });
});

describe("parseReferrer", () => {
  it("reduces a referrer to its host, without www.", () => {
    expect(parseReferrer("https://www.instagram.com/some/profile?x=1")).toBe("instagram.com");
    expect(parseReferrer("https://l.instagram.com/")).toBe("l.instagram.com");
  });

  it("ignores Ultralink's own domain (internal navigation isn't a traffic source)", () => {
    expect(parseReferrer("https://ultralink.bio/franek")).toBeNull();
    expect(parseReferrer("https://www.ultralink.bio/")).toBeNull();
  });

  it("returns null for missing or malformed referrers", () => {
    expect(parseReferrer(null)).toBeNull();
    expect(parseReferrer("not a url")).toBeNull();
  });
});
