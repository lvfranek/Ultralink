import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { EditPageForm } from "@/components/dashboard/edit-page-form";
import type { Page } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Edit link — Dashboard",
  robots: { index: false, follow: false },
};

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Edit link</h1>
        <p className="text-sm text-text-muted mt-1">
          Update your page settings. The link editor (templates, link buttons) is coming soon.
        </p>
      </div>
      <EditPageForm page={page as Page} siteUrl={siteConfig.url} />
    </div>
  );
}
