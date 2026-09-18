import { createServiceClient } from "./supabase/service";
import type { DeviceType, EventKind } from "./supabase/types";

const BOT_RE =
  /bot|crawler|spider|preview|facebookexternalhit|twitterbot|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|ia_archiver|whatsapp|telegrambot|discordbot|linkedinbot|slackbot|vkshare|embedly|outbrain|pinterest\/|bufferbot|rogerbot/i;

const TABLET_RE = /tablet|ipad|playbook|silk|(android(?!.*mobile))/i;
const MOBILE_RE = /mobile|android.*mobile|iphone|ipod|opera mini|iemobile|wpdesktop|blackberry|windows phone/i;

export function parseDevice(ua: string | null): DeviceType {
  if (!ua) return "unknown";
  if (BOT_RE.test(ua)) return "bot";
  if (TABLET_RE.test(ua)) return "tablet";
  if (MOBILE_RE.test(ua)) return "mobile";
  // Recognizable desktop OS → desktop; everything else → unknown
  if (/windows|macintosh|linux|x11|cros/i.test(ua)) return "desktop";
  return "unknown";
}

export function parseReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === "ultralink.bio") return null;
    return host;
  } catch {
    return null;
  }
}

export interface CaptureOptions {
  page_id: string;
  link_id?: string;
  kind: EventKind;
  country: string | null;
  ua: string | null;
  referrer: string | null;
}

export async function captureEvent(opts: CaptureOptions): Promise<void> {
  const device = parseDevice(opts.ua);
  const referrer_host = parseReferrer(opts.referrer);

  try {
    const supabase = createServiceClient();
    await supabase.from("events").insert({
      page_id: opts.page_id,
      link_id: opts.link_id ?? null,
      kind: opts.kind,
      country: opts.country ?? null,
      device,
      referrer_host,
    });
  } catch {
    // fire-and-forget: swallow all errors
  }
}
