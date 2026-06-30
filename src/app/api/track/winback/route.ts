import { type NextRequest, NextResponse } from "next/server";
import { captureEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get("page_id");
  const kind = request.nextUrl.searchParams.get("kind");

  if (!pageId || (kind !== "shown" && kind !== "click")) {
    return NextResponse.json({ ok: false }, { status: 400 });
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
