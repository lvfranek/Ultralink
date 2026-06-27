import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      {/* Lock html/body to #131313 so macOS scroll-bounce never reveals white */}
      <style>{`html, body { background: #131313 !important; }`}</style>
      <div className="flex min-h-screen dark-theme" style={{ background: "#131313" }}>
        <Sidebar user={user} displayName={profile?.display_name} />
        <main className="flex-1 lg:overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </>
  );
}
