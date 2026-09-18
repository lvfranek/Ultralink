import { type NextRequest, NextResponse } from "next/server";
import { captureEvent } from "@/lib/analytics";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get("page_id");
  const kind = request.nextUrl.searchParams.get("kind");

  if (!pageId || (kind !== "shown" && kind !== "click")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // No auth on this endpoint (it fires from anonymous visitors) — cap how
  // often one IP can inflate a page's Win-Back numbers.
  const ip = await getClientIp();
  if (!rateLimit(`winback-track:${ip}`, 30, 60).allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const ua = request.headers.get("user-agent");
  const country = request.headers.get("x-vercel-ip-country");
  const referrer = request.headers.get("referer");

  await captureEvent({
    page_id: pageId,
    kind: kind === "shown" ? "winback_shown" : "winback_click",
    country,
    ua,
    referrer,
  });

  return NextResponse.json({ ok: true });
}
