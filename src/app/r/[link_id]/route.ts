import { NextResponse } from "next/server";
import { after } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { captureEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ link_id: string }> }) {
  const { link_id } = await params;

  const supabase = createServiceClient();

  // Fetch link
  const { data: link } = await supabase
    .from("page_links")
    .select("id, url, page_id, is_active")
    .eq("id", link_id)
    .single();

  if (!link || !link.is_active) {
    return new NextResponse(null, { status: 404 });
  }

  // Verify the page is active
  const { data: page } = await supabase.from("pages").select("is_active").eq("id", link.page_id).single();

  if (!page || !page.is_active) {
    return new NextResponse(null, { status: 404 });
  }

  // In route handlers, headers are accessible inside after() directly
  const ua = request.headers.get("user-agent");
  const country = request.headers.get("x-vercel-ip-country");
  const referrer = request.headers.get("referer");

  after(async () => {
    await captureEvent({
      page_id: link.page_id,
      link_id: link.id,
      kind: "click",
      country,
      ua,
      referrer,
    });
  });

  // Identical 302 for bots and humans — no cloaking
  return NextResponse.redirect(link.url, { status: 302 });
}
